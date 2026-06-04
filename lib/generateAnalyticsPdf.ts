// lib/generateAnalyticsPdf.ts
// Fetches analytics data from backend and opens a Chart.js-rendered
// HTML page in a new window which the user can Print → Save as PDF.

import AxiosAPI from '@/lib/axios';

function fmtINR(v: number) {
  return '₹' + Math.round(v).toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export async functiongenerateAnalyticsPdf( 
  token: string,
  startDate?: Date,
  endDate?: Date,
) {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate.toISOString();
  if (endDate) params.endDate = endDate.toISOString();

  const res = await AxiosAPI.get('/v1/vendors/analytics/pdf-data', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  const d = res.data.data;
  const {
    meta,
    summary,
    monthlyTrend,
    dailyRevenue,
    topProducts,
    categoryBreakdown,
    orderStatusBreakdown,
    topPromotions,
  } = d;

  const STATUS_COLORS: Record<string, string> = {
    delivered: '#10b981',
    processing: '#3b82f6',
    pending: '#f59e0b',
    shipped: '#8b5cf6',
    cancelled: '#ef4444',
    returned: '#6b7280',
  };

  const CAT_PALETTE = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
    '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  ];

  // Encode data for chart injection
  const safe = (obj: unknown) =>
    JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Storefront Analytics Report</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b;font-size:13px}
  @media print{body{background:#fff}.no-print{display:none}@page{size:A4;margin:12mm}}
  .page{max-width:1100px;margin:0 auto;padding:24px}
  .header{background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);color:#fff;border-radius:16px;padding:32px 36px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}
  .header h1{font-size:26px;font-weight:700;letter-spacing:-0.5px}
  .header .sub{font-size:12px;opacity:0.7;margin-top:4px}
  .header .meta{text-align:right;font-size:12px;opacity:0.8}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
  .kpi{background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.07);border-top:4px solid}
  .kpi.blue{border-color:#3b82f6}.kpi.green{border-color:#10b981}.kpi.violet{border-color:#8b5cf6}.kpi.amber{border-color:#f59e0b}.kpi.rose{border-color:#f43f5e}.kpi.cyan{border-color:#06b6d4}
  .kpi .label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#64748b}
  .kpi .val{font-size:22px;font-weight:700;margin-top:4px;color:#0f172a}
  .kpi .note{font-size:10px;color:#94a3b8;margin-top:3px}
  .row{display:grid;gap:16px;margin-bottom:20px}
  .row.col2{grid-template-columns:2fr 1fr}
  .row.col3{grid-template-columns:1fr 1fr 1fr}
  .row.col-equal{grid-template-columns:1fr 1fr}
  .card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
  .card-title{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:14px;display:flex;align-items:center;gap:6px}
  .card-title::before{content:'';display:inline-block;width:3px;height:14px;background:currentColor;border-radius:2px}
  .chart-wrap{position:relative}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#f1f5f9;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:600;padding:8px 10px;text-align:left;border-bottom:1px solid #e2e8f0}
  td{padding:8px 10px;border-bottom:1px solid #f1f5f9;color:#334155}
  tr:last-child td{border:none}
  .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600}
  .badge.active{background:#d1fae5;color:#065f46}.badge.expired{background:#fee2e2;color:#991b1b}.badge.draft{background:#f1f5f9;color:#475569}
  .pnl-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9}
  .pnl-row:last-child{border:none;padding-top:12px;font-weight:700;font-size:15px}
  .deduct{color:#ef4444}.earn{color:#10b981}
  .footer{text-align:center;color:#94a3b8;font-size:11px;margin-top:28px;padding:16px;border-top:1px solid #e2e8f0}
  .print-btn{position:fixed;top:16px;right:16px;background:#312e81;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(49,46,129,.4);transition:background .2s}
  .print-btn:hover{background:#4c1d95}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">⬇ Download PDF</button>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="sub">STOREFRONT ANALYTICS REPORT</div>
      <h1>Business Performance Summary</h1>
      <div class="sub" style="margin-top:8px">${fmtDate(meta.startDate)} — ${fmtDate(meta.endDate)}</div>
    </div>
    <div class="meta">
      <div>Generated</div>
      <div style="font-size:14px;font-weight:600">${fmtDate(meta.generatedAt)}</div>
      <div style="margin-top:8px">Total Orders</div>
      <div style="font-size:20px;font-weight:700">${summary.totalOrders}</div>
    </div>
  </div>

  <!-- KPI CARDS -->
  <div class="kpi-grid">
    <div class="kpi blue"><div class="label">Gross Revenue</div><div class="val">${fmtINR(summary.grossRevenue)}</div><div class="note">${summary.totalOrders} confirmed orders</div></div>
    <div class="kpi green"><div class="label">Net Earnings</div><div class="val">${fmtINR(summary.netEarnings)}</div><div class="note">After all deductions</div></div>
    <div class="kpi violet"><div class="label">Avg. Order Value</div><div class="val">${fmtINR(summary.avgOrderValue)}</div><div class="note">Per completed order</div></div>
    <div class="kpi amber"><div class="label">GST Collected</div><div class="val">${fmtINR(summary.taxCollected)}</div><div class="note">CGST + SGST / IGST</div></div>
    <div class="kpi rose"><div class="label">Total Refunds</div><div class="val">${fmtINR(summary.refunds)}</div><div class="note">Processed refunds</div></div>
    <div class="kpi cyan"><div class="label">Promotions Used</div><div class="val">${topPromotions.reduce((a: number, p: any) => a + p.timesUsed, 0)}</div><div class="note">Across all campaigns</div></div>
  </div>

  <!-- ROW 1: Daily Revenue + P&L -->
  <div class="row col2">
    <div class="card">
      <div class="card-title" style="color:#3b82f6">Daily Revenue Trend</div>
      <div class="chart-wrap"><canvas id="dailyChart" height="200"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#10b981">Profit & Loss Summary</div>
      <div class="pnl-row"><span style="color:#64748b">Gross Sales</span><span style="font-weight:600">${fmtINR(summary.grossRevenue)}</span></div>
      <div class="pnl-row"><span class="deduct">− GST / Tax</span><span class="deduct">${fmtINR(summary.taxCollected)}</span></div>
      <div class="pnl-row"><span class="deduct">− Refunds</span><span class="deduct">${fmtINR(summary.refunds)}</span></div>
      <div class="pnl-row"><span class="deduct">− Platform Fees</span><span class="deduct">${fmtINR(summary.platformFees)}</span></div>
      <div class="pnl-row earn"><span>Net Profit</span><span>${fmtINR(summary.netEarnings)}</span></div>
      <div style="margin-top:14px;background:#f0fdf4;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:11px;color:#6b7280">Net Margin</div>
        <div style="font-size:24px;font-weight:700;color:#10b981">${summary.grossRevenue > 0 ? ((summary.netEarnings / summary.grossRevenue) * 100).toFixed(1) : 0}%</div>
      </div>
    </div>
  </div>

  <!-- ROW 2: Monthly Trend + Category Pie -->
  <div class="row col2">
    <div class="card">
      <div class="card-title" style="color:#8b5cf6">Monthly Revenue & Orders</div>
      <div class="chart-wrap"><canvas id="monthlyChart" height="200"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f59e0b">Category Breakdown</div>
      <div class="chart-wrap" style="height:200px"><canvas id="catChart"></canvas></div>
    </div>
  </div>

  <!-- ROW 3: Top Products + Order Status -->
  <div class="row col-equal">
    <div class="card">
      <div class="card-title" style="color:#06b6d4">Top Products by Revenue</div>
      <div class="chart-wrap"><canvas id="productsChart" height="220"></canvas></div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#ec4899">Order Status Distribution</div>
      <div class="chart-wrap" style="height:220px"><canvas id="statusChart"></canvas></div>
    </div>
  </div>

  <!-- ROW 4: Promotions Table + Category Table -->
  <div class="row col-equal">
    <div class="card">
      <div class="card-title" style="color:#f59e0b">Top Promotions Performance</div>
      ${topPromotions.length > 0 ? `
      <table>
        <thead><tr><th>Promotion</th><th>Type</th><th>Used</th><th>Discount Given</th><th>Status</th></tr></thead>
        <tbody>${topPromotions.map((p: any) => `
          <tr>
            <td style="font-weight:600;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.name}">${p.name}</td>
            <td>${(p.promotionType || '').replace(/_/g, ' ')}</td>
            <td style="text-align:center">${p.timesUsed}</td>
            <td style="color:#ef4444;font-weight:600">${fmtINR(Number(p.totalDiscount))}</td>
            <td><span class="badge ${p.status === 'ACTIVE' ? 'active' : p.status === 'EXPIRED' ? 'expired' : 'draft'}">${p.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>` : '<div style="padding:20px;text-align:center;color:#94a3b8">No promotions used in this period.</div>'}
    </div>
    <div class="card">
      <div class="card-title" style="color:#8b5cf6">Category Sales Details</div>
      ${categoryBreakdown.length > 0 ? `
      <table>
        <thead><tr><th>Category</th><th>Revenue</th><th>Units</th><th>Share</th></tr></thead>
        <tbody>${categoryBreakdown.map((c: any, i: number) => {
          const total = categoryBreakdown.reduce((a: number, x: any) => a + x.revenue, 0);
          const share = total > 0 ? ((c.revenue / total) * 100).toFixed(1) : '0';
          return `<tr>
            <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CAT_PALETTE[i % CAT_PALETTE.length]};margin-right:6px"></span>${c.name}</td>
            <td style="font-weight:600">${fmtINR(c.revenue)}</td>
            <td>${c.unitsSold}</td>
            <td style="color:#64748b">${share}%</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>` : '<div style="padding:20px;text-align:center;color:#94a3b8">No category data.</div>'}
    </div>
  </div>

  <!-- Products Table -->
  <div class="card" style="margin-bottom:20px">
    <div class="card-title" style="color:#06b6d4">Product Performance Details</div>
    <table>
      <thead><tr><th>#</th><th>Product Name</th><th>SKU</th><th>Units Sold</th><th>Revenue</th><th>Avg. Price</th></tr></thead>
      <tbody>${topProducts.map((p: any, i: number) => `
        <tr>
          <td style="color:#94a3b8;font-weight:600">#${i + 1}</td>
          <td style="font-weight:600">${p.name || 'N/A'}</td>
          <td style="font-family:monospace;color:#64748b">${p.sku}</td>
          <td>${p.unitsSold}</td>
          <td style="font-weight:600;color:#10b981">${fmtINR(p.revenue)}</td>
          <td style="color:#64748b">${p.unitsSold > 0 ? fmtINR(p.revenue / p.unitsSold) : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Techsonance Marketplace — Confidential Analytics Report &nbsp;·&nbsp; Generated ${new Date(meta.generatedAt).toLocaleString('en-IN')}
  </div>
</div>

<script>
const DAILY = ${safe(dailyRevenue)};
const MONTHLY = ${safe(monthlyTrend)};
const PRODUCTS = ${safe(topProducts)};
const CATEGORIES = ${safe(categoryBreakdown)};
const STATUSES = ${safe(orderStatusBreakdown)};

const STATUS_COLORS = ${safe(STATUS_COLORS)};
const CAT_PALETTE = ${safe(CAT_PALETTE)};

// 1. Daily Revenue Chart
new Chart(document.getElementById('dailyChart'), {
  type: 'line',
  data: {
    labels: DAILY.map(d => d.date.slice(5)),
    datasets: [{
      label: 'Revenue',
      data: DAILY.map(d => d.revenue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: DAILY.length > 30 ? 0 : 3,
      borderWidth: 2,
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '₹' + Math.round(ctx.raw).toLocaleString('en-IN') } } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
    }
  }
});

// 2. Monthly Chart
new Chart(document.getElementById('monthlyChart'), {
  type: 'bar',
  data: {
    labels: MONTHLY.map(m => m.month),
    datasets: [
      { label: 'Revenue', data: MONTHLY.map(m => m.revenue), backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 5, yAxisID: 'y' },
      { label: 'Orders', data: MONTHLY.map(m => m.orderCount), type: 'line', borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, borderWidth: 2, yAxisID: 'y1' }
    ]
  },
  options: {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { labels: { font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' }, position: 'left' },
      y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  }
});

// 3. Category Donut
new Chart(document.getElementById('catChart'), {
  type: 'doughnut',
  data: {
    labels: CATEGORIES.map(c => c.name),
    datasets: [{ data: CATEGORIES.map(c => c.revenue), backgroundColor: CAT_PALETTE, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 12, padding: 8 } }, tooltip: { callbacks: { label: ctx => ctx.label + ': ₹' + Math.round(ctx.raw).toLocaleString('en-IN') } } },
    cutout: '60%'
  }
});

// 4. Top Products Bar (horizontal)
new Chart(document.getElementById('productsChart'), {
  type: 'bar',
  data: {
    labels: PRODUCTS.map(p => (p.name || p.sku || '').substring(0, 20)),
    datasets: [{ label: 'Revenue', data: PRODUCTS.map(p => p.revenue), backgroundColor: CAT_PALETTE, borderRadius: 4 }]
  },
  options: {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '₹' + Math.round(ctx.raw).toLocaleString('en-IN') } } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } },
      y: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  }
});

// 5. Order Status Doughnut
const statusLabels = STATUSES.map(s => (s.status || '').charAt(0).toUpperCase() + (s.status || '').slice(1).toLowerCase());
const statusColors = STATUSES.map(s => STATUS_COLORS[(s.status || '').toLowerCase()] || '#94a3b8');
new Chart(document.getElementById('statusChart'), {
  type: 'doughnut',
  data: {
    labels: statusLabels,
    datasets: [{ data: STATUSES.map(s => s.count), backgroundColor: statusColors, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 12, padding: 8 } } },
    cutout: '55%'
  }
});
</script>
</body>
</html>`;

  // ── Render inside a hidden iframe so no new tab ever opens ──────────────
  const iframe = document.createElement('iframe');
  // Place it completely off-screen; visibility:hidden blocks print in some browsers
  iframe.style.cssText =
    'position:fixed;top:0;left:-9999px;width:1200px;height:1px;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iDoc) {
    document.body.removeChild(iframe);
    throw new Error('Could not access iframe document.');
  }

  iDoc.open();
  iDoc.write(html);
  iDoc.close();

  // Wait for Chart.js CDN to load + all 5 charts to finish rendering,
  // then trigger the browser's native Print / Save-as-PDF dialog.
  await new Promise<void>((resolve) => {
    const tryPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (_) {
        /* cross-origin guard — should not happen for same-origin blobs */
      }
      resolve();
    };

    // 1.8 s gives Chart.js CDN enough time to load and paint all canvases
    setTimeout(tryPrint, 1800);
  });

  // Clean up after the dialog closes (slight delay so print isn't aborted)
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 3000);
}

