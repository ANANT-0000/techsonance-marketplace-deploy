import { useState, useCallback } from "react";
import { BASE_API_URL, COLOR_DARK_CHARCOAL } from "@/constants";
import { renderPdfInIframe } from "@/lib/renderPdf";
import AxiosAPI from "@/lib/axios";

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirrors PolicyDocumentPayload from the server interface
// ─────────────────────────────────────────────────────────────────────────────

interface WarrantyPayload {
  meta: {
    documentId: string;
    issueDate: string | Date;
    orderNumber: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  product: {
    name: string;
    sku?: string;
    quantity: number;
    price: string;
  };
  policy: {
    policyName: string;
    policyType: string;
    startDate: string | Date;
    endDate: string | Date | null;
    coverageDescription?: string;
    exclusions?: string;
    serviceProvider?: string;
    claimEmail?: string;
    claimPhone?: string;
    processDescription?: string;
  };
  branding: {
    companyName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters — identical logic to the server's _formatPayload method
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "N/A";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `₹${num.toFixed(2)}`;
}

function fmtPolicyType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Builder — 1-to-1 port of warranty.hbs template into a JS template literal
// Sections (in order): Header, Issued By/To, Product Table, Policy Terms,
//                      Coverage Description, Exclusions, Support/Claims, Footer
// ─────────────────────────────────────────────────────────────────────────────

function buildWarrantyHtml(p: WarrantyPayload): string {
  const policy = p.policy;
  const endDateText = policy.endDate
    ? fmtDate(policy.endDate)
    : "Lifetime / No Expiry";

  const primaryColor = p.branding.primaryColor || COLOR_DARK_CHARCOAL;
  const secondaryColor = p.branding.secondaryColor || "#555555";
  const accentColor = p.branding.accentColor || "#ff9900";
  const fontFamily = p.branding.fontFamily || "Arial, sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Warranty Certificate</title>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily.split(",")[0])}:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: '${fontFamily}', 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }

    .page {
      padding: 30px 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    /* --- Header --- */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header-logo { max-height: 50px; margin-bottom: 10px; }
    .header-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: ${primaryColor}; }
    .header-meta { text-align: right; font-size: 11px; color: #333; }
    .header-meta strong { color: #000; }

    /* --- Addresses --- */
    .details-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }
    .details-box { width: 48%; }
    .details-box h4 { font-size: 11px; text-transform: uppercase; color: ${secondaryColor}; margin-bottom: 5px; border-bottom: 1px solid ${primaryColor}; padding-bottom: 3px; }
    .details-box p { margin-bottom: 2px; }

    /* --- Product Table --- */
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { border: 1px solid ${primaryColor}; padding: 10px; text-align: left; }
    th { background-color: ${primaryColor}; color: #fff; font-size: 11px; text-transform: uppercase; }
    .col-qty { width: 60px; text-align: center; }
    .col-price { width: 100px; text-align: right; }

    /* --- Policy Terms Box --- */
    .policy-section {
      border: 1px solid ${primaryColor};
      padding: 15px;
      margin-bottom: 25px;
      background-color: #fafafa;
    }
    .policy-header { font-size: 16px; font-weight: bold; color: ${primaryColor}; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .policy-grid { display: flex; flex-wrap: wrap; gap: 15px; }
    .policy-item { flex: 1 1 45%; }
    .policy-item span { display: block; font-size: 10px; text-transform: uppercase; color: ${secondaryColor}; margin-bottom: 2px; }
    .policy-item strong { display: block; font-size: 13px; }

    .policy-description { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc; }
    .policy-description h5 { font-size: 11px; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 4px; }
    .policy-description p { font-size: 11px; color: #333; margin-bottom: 10px; }

    /* --- Support / Claims --- */
    .support-box {
      border: 1px dashed ${primaryColor};
      padding: 15px;
      margin-bottom: 30px;
    }
    .support-box h4 { margin-bottom: 5px; font-size: 13px; color: ${primaryColor}; }
    .support-box p { margin-bottom: 4px; }

    /* --- Footer --- */
    .footer {
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 15px;
      margin-top: 40px;
    }
  </style>
</head>
<body>

  <div class="page">

    <!-- ── Header ── -->
    <div class="header">
      <div>
        ${
          p.branding.logoUrl
            ? `<img src="${p.branding.logoUrl}" alt="Company Logo" class="header-logo" crossorigin="anonymous" />`
            : ""
        }
        <div class="header-title">Product Policy Document</div>
      </div>
      <div class="header-meta">
        <p><strong>Order ID:</strong> ${p.meta.orderNumber}</p>
        <p><strong>Document ID:</strong> ${p.meta.documentId}</p>
        <p><strong>Issue Date:</strong> ${fmtDate(p.meta.issueDate)}</p>
      </div>
    </div>

    <!-- ── Issued By / To ── -->
    <div class="details-row">
      <div class="details-box">
        <h4>Issued By</h4>
        <p><strong>${p.branding.companyName}</strong></p>
        <p>This is a computer-generated document serving as proof of warranty/policy coverage for the purchased item below.</p>
      </div>
      <div class="details-box">
        <h4>Issued To</h4>
        <p><strong>${p.customer.name}</strong></p>
        <p>${p.customer.email}</p>
        ${p.customer.phone ? `<p>${p.customer.phone}</p>` : ""}
      </div>
    </div>

    <!-- ── Product Table ── -->
    <table>
      <thead>
        <tr>
          <th class="col-qty">Qty</th>
          <th>Description</th>
          <th class="col-price">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="col-qty">${p.product.quantity}</td>
          <td>
            <strong>${p.product.name}</strong>
            ${p.product.sku ? `<br><span style="font-size: 10px; color: #666;">SKU: ${p.product.sku}</span>` : ""}
          </td>
          <td class="col-price">${fmtPrice(p.product.price)}</td>
        </tr>
      </tbody>
    </table>

    <!-- ── Policy Terms ── -->
    <div class="policy-section">
      <div class="policy-header">${policy.policyName}</div>

      <div class="policy-grid">
        <div class="policy-item">
          <span>Policy Type</span>
          <strong>${fmtPolicyType(policy.policyType)}</strong>
        </div>
        <div class="policy-item">
          <span>Coverage Start Date</span>
          <strong>${fmtDate(policy.startDate)}</strong>
        </div>
        <div class="policy-item">
          <span>Coverage End Date</span>
          <strong>${endDateText}</strong>
        </div>
        ${
          policy.serviceProvider
            ? `<div class="policy-item">
               <span>Authorized Service Provider</span>
               <strong>${policy.serviceProvider}</strong>
             </div>`
            : ""
        }
      </div>

      <!-- ── Coverage / Exclusions ── -->
      <div class="policy-description">
        ${
          policy.coverageDescription
            ? `<h5>What is Covered</h5>
             <p>${policy.coverageDescription}</p>`
            : ""
        }
        ${
          policy.exclusions
            ? `<h5>Exclusions (What is Not Covered)</h5>
             <p>${policy.exclusions}</p>`
            : ""
        }
      </div>
    </div>

    <!-- ── Support / Claims ── -->
    <div class="support-box">
      <h4>How to file a claim or request support</h4>
      ${policy.processDescription ? `<p>${policy.processDescription}</p>` : ""}
      <p style="margin-top: 8px;">
        <strong>Contact Support:</strong>
        ${policy.claimEmail ? policy.claimEmail : ""}
        ${policy.claimPhone ? ` | ${policy.claimPhone}` : ""}
      </p>
    </div>

    <!-- ── Footer ── -->
    <div class="footer">
      This is a computer-generated document.<br>
      To return an item or view your order details, please visit your account dashboard.<br>
      ${p.branding.companyName}
    </div>

  </div>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useWarrantyDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Fetches the warranty payload(s) for `orderId` from the backend,
   * builds the HTML for each item, and triggers a sequential PDF download.
   *
   * Requires a valid JWT `token` for authorization.
   */
  const downloadWarranty = useCallback(
    async (orderId: string, token: string): Promise<boolean> => {
      setIsGenerating(true);
      try {
        // 1. Fetch the structured warranty payload from the backend
        const res = await AxiosAPI.get(
          `/v1/product-policies/warranty-payload/${orderId}`,
          {
            headers: {
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            },
          },
        );

        if (res.data.status != 200) {
          throw new Error(
            res.data.message ||
              `HTTP ${res.data.status}: Failed to fetch warranty data`,
          );
        }

        // API response shape: { success, status, message, data: { message, data: WarrantyPayload[] } }
        const inner = res.data.data as {
          message: string;
          data: WarrantyPayload[];
        };
        const payloads = inner?.data;

        if (!payloads || payloads.length === 0) {
          // No policy snapshots for this order — expected for old orders or
          // products that have no policy configured. Return false (not an error).
          return false;
        }

        // 2. For each order item, build HTML and render to a separate PDF file
        for (let i = 0; i < payloads.length; i++) {
          const payload = payloads[i];
          const html = buildWarrantyHtml(payload);
          const filename = `warranty-${payload.meta.orderNumber}-item-${i + 1}.pdf`;

          await renderPdfInIframe(html, filename).catch((error) => {});

          // Stagger sequential downloads so the browser doesn't block them
          if (i < payloads.length - 1) {
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        return true;
      } catch (err) {
        // Re-throw so the calling UI can display a toast/error message
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { downloadWarranty, isGenerating };
}
