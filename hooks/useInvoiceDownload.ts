import { useState, useCallback } from "react";
import { BASE_API_URL, COLOR_DARK_CHARCOAL } from "@/constants";
import { renderPdfInIframe } from "@/lib/renderPdf";

export interface InvoicePayload {
  meta: Meta;
  branding: Branding;
  seller: Party;
  customer: Customer;
  legal: Legal;
  items: InvoiceItem[];
  totals: Totals;
  payment: Payment;
  footer: Footer;
}

export interface Meta {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  templateId: string;
}

export interface Branding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  watermarkUrl: string;
  fontFamily: string;
}

export interface Party {
  legalName: string;
  address: Address;
  taxIds: TaxId[];
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
}

export interface Customer {
  name: string;
  email: string;
  billingAddress: Address;
  shippingAddress: Address;
  placeOfSupply: string;
  placeOfDelivery: string;
}

export interface Legal {
  legalName: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  taxIds: TaxId[];
}

export interface Address {
  recipientName: string;
  addressLine1: string;

  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  stateCode?: string;
}

export interface TaxId {
  key: string;
  value: string;
}

export interface InvoiceItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  netAmount: number;
  taxRate: number;
  taxType: "CGST" | "SGST" | "IGST" | string;
  taxAmount: number;
  totalAmount: number;
}

export interface Totals {
  subTotal: number;
  totalDiscount: number;
  netAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  grandTotal: number;
  currency: string;
  grandTotalInWords: string;
  reverseCharge: boolean;
}

export interface Payment {
  transactionId: string;
  paymentMethod: string;
  invoiceValue: number;
  paidAt: string;
}

export interface Footer {
  termsAndConditions: string;
  notes: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatorySignatureDataUri: string;
}
// ── Build invoice HTML string (same function from before, no changes needed) ──
function buildInvoiceHtml(payload: InvoicePayload): string {
  const { meta, branding, seller, customer, items, totals, footer } = payload;
  const sym = totals.currency === "INR" ? "₹" : "$";
  const fc = (n: number) => `${sym}${Number(n).toFixed(2)}`;
  const fmtDate = (d: string | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const hasCgst = totals.totalCgst > 0;
  const hasIgst = totals.totalIgst > 0;
  const primaryColor = branding.primaryColor || COLOR_DARK_CHARCOAL;
  const fontFamily = branding.fontFamily || "Arial, sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily.split(",")[0])}:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: '${fontFamily}', Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.5; color: #111; background: #fff; }
  .page { padding: 28px 36px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${primaryColor}; padding-bottom: 12px; margin-bottom: 14px; }
  .header h1 { font-size: 18px; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; }
  .header-logo img { max-height: 52px; max-width: 140px; object-fit: contain; }
  .two-col { display: flex; gap: 20px; margin-bottom: 12px; }
  .col { flex: 1; }
  .block-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #555; margin-bottom: 4px; }
  .recipient-name { font-weight: 700; font-size: 11px; margin-bottom: 2px; }
  .address-line { font-size: 9.5px; color: #333; line-height: 1.5; }
  .tax-row { font-size: 9.5px; color: #222; margin-bottom: 2px; }
  .meta-strip { display: flex; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 8px 0; margin-bottom: 12px; }
  .meta-cell { flex: 1; font-size: 9px; }
  .meta-cell .lbl { color: #888; margin-bottom: 2px; }
  .meta-cell .val { font-weight: 700; font-size: 10px; color: #111; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10px; }
  table.items thead tr { background-color: ${primaryColor}; }
  table.items thead th { color: #fff; padding: 7px 6px; font-size: 8.5px; font-weight: 600; text-align: right; white-space: nowrap; }
  table.items thead th:first-child, table.items thead th:nth-child(2) { text-align: left; }
  table.items tbody td { padding: 8px 6px; text-align: right; border-bottom: 1px solid #e8e8e8; vertical-align: top; }
  table.items tbody td:first-child, table.items tbody td:nth-child(2) { text-align: left; }
  table.items tbody tr:nth-child(even) { background: #f8f8f8; }
  .item-name { font-weight: 700; font-size: 10.5px; margin-bottom: 2px; }
  .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 12px; }
  .totals-box { width: 300px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 12px; font-size: 10px; border-bottom: 1px solid #f0f0f0; color: #333; }
  .totals-row.grand { background-color: ${primaryColor}; color: #fff; font-weight: 700; font-size: 12px; padding: 8px 12px; border-bottom: none; }
  .totals-row.indent { padding-left: 24px; font-size: 9.5px; color: #555; }
  .amount-words { font-size: 9px; color: #333; background: #f7f7f7; border-left: 3px solid ${primaryColor}; padding: 6px 10px; border-radius: 3px; margin-bottom: 14px; font-weight: 700; }
  .signatory-wrap { display: flex; justify-content: flex-end; margin-bottom: 16px; }
  .signatory-box { width: 190px; text-align: center; }
  .sig-line { border-top: 1px solid #333; padding-top: 5px; margin-top: 44px; font-size: 9.5px; font-weight: 700; color: #222; }
  .section { border-top: 1px solid #e0e0e0; padding-top: 9px; margin-bottom: 12px; }
  .section-heading { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #333; margin-bottom: 5px; }
  .section-body { font-size: 8.5px; color: #555; line-height: 1.55; white-space: pre-line; }
  .page-footer { border-top: 1px solid #ddd; padding-top: 6px; font-size: 8px; color: #aaa; text-align: center; margin-top: 10px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <h1>Tax Invoice / Bill of Supply</h1>
      <div style="font-size:9px;color:#555;margin-top:2px;">(Original for Recipient)</div>
    </div>
    ${
      branding.logoUrl
        ? `<div class="header-logo"><img src="${branding.logoUrl}" crossorigin="anonymous" alt="Logo"></div>`
        : ""
    }
  </div>

  <div class="two-col">
    <div class="col">
      <div class="block-label">Sold By:</div>
      <div class="recipient-name">${seller.legalName}</div>
      <div class="address-line">${seller.address.addressLine1}</div>
      <div class="address-line">${seller.address.city}, ${seller.address.state} ${seller.address.postalCode}</div>
      <div class="address-line">${seller.address.country}</div>
      <div style="margin-top:6px">
        ${(seller.taxIds || []).map((t: any) => `<div class="tax-row"><strong>${t.key}:</strong> ${t.value}</div>`).join("")}
        ${seller.supportEmail ? `<div class="tax-row"><strong>Email:</strong> ${seller.supportEmail}</div>` : ""}
        ${seller.supportPhone ? `<div class="tax-row"><strong>Phone:</strong> ${seller.supportPhone}</div>` : ""}
      </div>
    </div>
    <div class="col">
      <div class="block-label">Billing Address:</div>
      <div class="recipient-name">${customer.billingAddress.recipientName}</div>
      <div class="address-line">${customer.billingAddress.addressLine1}</div>
      
      <div class="address-line">${customer.billingAddress.city}, ${customer.billingAddress.state} ${customer.billingAddress.postalCode}</div>
      <div class="address-line">${customer.billingAddress.country}</div>
      ${customer.billingAddress.stateCode ? `<div class="address-line" style="font-weight:700">State/UT Code: ${customer.billingAddress.stateCode}</div>` : ""}
      <br>
      <div class="block-label">Shipping Address:</div>
      <div class="recipient-name">${customer.shippingAddress.recipientName}</div>
      <div class="address-line">${customer.shippingAddress.addressLine1}</div>
        
      <div class="address-line">${customer.shippingAddress.city}, ${customer.shippingAddress.state} ${customer.shippingAddress.postalCode}</div>
      <div class="address-line">${customer.shippingAddress.country}</div>
      ${customer.placeOfSupply ? `<div class="address-line" style="font-weight:700;margin-top:2px">Place of supply: ${customer.placeOfSupply}</div>` : ""}
    </div>
  </div>

  <div class="meta-strip">
    <div class="meta-cell"><div class="lbl">Order Number</div><div class="val">${meta.orderNumber}</div></div>
    <div class="meta-cell"><div class="lbl">Order Date</div><div class="val">${fmtDate(meta.orderDate)}</div></div>
    <div class="meta-cell"><div class="lbl">Invoice Number</div><div class="val">${meta.invoiceNumber}</div></div>
    <div class="meta-cell"><div class="lbl">Invoice Date</div><div class="val">${fmtDate(meta.invoiceDate)}</div></div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:26px">#</th>
        <th>Description</th>
        <th>Unit Price</th>
        <th>Discount </th>
        <th style="text-align:center">Qty</th>
        <th>Net Amount</th>
        <th>Tax Rate</th>
        <th>Tax Type</th>
        <th>Tax Amount</th>
        <th>Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map((item: InvoiceItem, i: number) => {
          const isCgstSgst = item.taxType === "CGST+SGST";
          const half = isCgstSgst ? item.taxAmount / 2 : 0;
          return `<tr>
          <td><span style="color:#888;font-size:8.5px">${i + 1}</span></td>
          <td>
            <div class="item-name">${item.name}</div>
            ${item.sku ? `<div style="font-size:8px;color:#999">SKU: ${item.sku}</div>` : ""}
          </td>
          <td>${fc(item.unitPrice)}</td>
          <td>${fc(item.discount)}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td>${fc(item.netAmount)}</td>
          <td>${item.taxRate}%</td>
          <td>
            ${
              isCgstSgst
                ? `<div style="font-size:8px;color:#666">CGST</div><div style="font-size:8px;color:#666">SGST</div>`
                : item.taxType
            }
          </td>
          <td>
            ${
              isCgstSgst
                ? `<div style="font-size:8px;color:#666">${fc(half)}</div><div style="font-size:8px;color:#666">${fc(half)}</div>`
                : fc(item.taxAmount)
            }
          </td>
          <td><strong>${fc(item.totalAmount)}</strong></td>
        </tr>`;
        })
        .join("")}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="totals-row"><span>Taxable Amount</span><span>${fc(totals.netAmount)}</span></div>
      ${
        hasCgst
          ? `
        <div class="totals-row indent"><span>CGST</span><span>${fc(totals.totalCgst)}</span></div>
        <div class="totals-row indent"><span>SGST</span><span>${fc(totals.totalSgst)}</span></div>`
          : ""
      }
      ${
        hasIgst
          ? `<div class="totals-row indent"><span>IGST</span><span>${fc(totals.totalIgst)}</span></div>`
          : ""
      }
      ${totals.totalTax > 0 ? `<div class="totals-row"><span>Total Tax</span><span>${fc(totals.totalTax)}</span></div>` : ""}
      <div class="totals-row grand"><span>TOTAL</span><span>${fc(totals.grandTotal)}</span></div>
    </div>
  </div>

  <div class="amount-words">
    Amount in Words: <span style="font-weight:400;color:#555">${totals.currency} ${totals.grandTotalInWords || ""}</span>
  </div>
  <div style="font-size:9px;color:#444;margin-bottom:14px;">Whether tax is payable under reverse charge — No</div>

  <div class="signatory-wrap">
    <div class="signatory-box">
      <div style="font-size:9px;color:#333;margin-bottom:6px;font-weight:700">For ${seller.legalName}:</div>
      ${
        footer.signatorySignatureDataUri
          ? `<img src="${footer.signatorySignatureDataUri}" style="height:50px;object-fit:contain;margin-bottom:6px" alt="Signature">`
          : ""
      }
      <div class="sig-line">${
        footer.signatoryName || "Authorized Signatory"
      }</div>
      ${footer.signatoryDesignation ? `<div style="font-size:8.5px;color:#777;margin-top:2px">${footer.signatoryDesignation}</div>` : ""}
    </div>
  </div>

  ${footer.notes ? `<div class="section"><div class="section-heading">Notes</div><div class="section-body">${footer.notes}</div></div>` : ""}
  ${footer.termsAndConditions ? `<div class="section"><div class="section-heading">Terms &amp; Conditions</div><div class="section-body">${footer.termsAndConditions}</div></div>` : ""}
  <div class="page-footer">This is a system-generated invoice. No signature required if digitally authenticated.</div>
</div>
</body>
</html>`;
}

// ── The hook ──

export function useInvoiceDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadInvoice = useCallback(
    async (orderId: string, token: string) => {
      setIsGenerating(true);
      try {
        // Fetch the payload from the new backend endpoint
        const res = await fetch(
          `${BASE_API_URL}/v1/invoice/payload/${orderId}`,
          {
            headers: {
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${res.status}`);
        }

        const { data: payload } = await res.json(); // Build HTML string and render to PDF in isolated iframe
        const html = buildInvoiceHtml(payload);
        const filename = `invoice-${payload.meta.invoiceNumber}.pdf`;

        await renderPdfInIframe(html, filename);
      } catch (err) {
        // Re-throw so the UI can show a toast/error
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { downloadInvoice, isGenerating };
}
