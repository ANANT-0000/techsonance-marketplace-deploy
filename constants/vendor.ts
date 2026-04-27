import type { Link } from "@/components/common/InnerSideBar";
import { Coupon, CustomerTicket, GstInvoice, InventoryItem, InventoryProduct, NavLinkType, OrderDetail, UserReview, VendorOrder, VendorProduct, Warehouse } from "@/utils/Types";

//used
export const VendorDocumentTypes: { label: string; value: string }[] = [
  {
    label: 'Business Registration',
    value: 'business_registration'
  },
  {
    label: 'Financial Statements',
    value: 'financial_statements'
  },
  {
    label: 'Insurance Coverage',
    value: 'insurance_coverage'
  }
  ,
  {
    label: 'Compliance Certifications',
    value: 'compliance_certifications'
  }
  ,
  {
    label: 'Security Documentation',
    value: 'security_documentation'
  }
  ,
  {
    label: 'Contract Agreements',
    value: 'contract_agreements'
  }
  ,
  {
    label: 'Vendor Information',
    value: 'vendor_information'
  }
  ,
  {
    label: 'Business Continuity Plan',
    value: 'business_continuity_plan'
  }

]
// ============================================================
// VENDOR NAVIGATION LINKS
// ============================================================
//used
export const VENDOR_NAV_LINKS: NavLinkType[] = [
  { Dashboard: null, icon: 'layout-dashboard' },
  { Products: "products", icon: 'package' },
  { Orders: "orders", icon: 'shopping-cart' },
  { Analytics: "finances", icon: 'chart-column-stacked' },
  { Finances: "finances", icon: 'hand-coins' },
  { Marketing: "marketing", icon: 'megaphone' },
  { "Customer Care": "customerCare", icon: 'headset' },
  { Settings: "settings", icon: 'settings' },
];
// Define reusable types
interface SidebarLink {
  title: string;
  path: string | null;
  icon: string; // Lucide icon name
}

interface SidebarSection {
  section: string;
  list: SidebarLink[];
}

interface InnerSidebar {
  menu: string; // e.g. "Sales", "Catalog"
  sections: SidebarSection[];
}
// 1. Sidebar config with dynamic icon names
interface SidebarLink {
  title: string;
  path: string | null;
  icon: string; // kebab-case Lucide icon name
}

interface SidebarSection {
  section: string;
  list: SidebarLink[];
}

interface InnerSidebar {
  menu: string;
  sections: SidebarSection[];
}

// Factory function to generate links with vendorId
export const getVendorInnerSidebarLinks = (vendorId: string, selectedMenu: string): InnerSidebar[] => [
  {
    menu: "Sales",
    sections: [
      {
        section: "Sellings",
        list: [
          { title: "Orders", path: `/vendor/${vendorId}/orders`, icon: "shopping-cart" },
          { title: "Back Orders", path: `/vendor/${vendorId}/orders/backOrder`, icon: "rotate-ccw" },
          { title: "Failed Orders", path: `/vendor/${vendorId}/orders/failedOrder`, icon: "x-circle" },
          { title: "Archived", path: `/vendor/${vendorId}/orders/archivedOrder`, icon: "archive" },
        ],
      },
      {
        section: "Request",
        list: [{ title: "Quotes", path: `/vendor/${vendorId}/quotes`, icon: "file-text" }],
      },
    ],
  },
  {
    menu: "Catalog",
    sections: [
      {
        section: "Master Catalog",
        list: [
          { title: "Product List", path: `/vendor/${vendorId}/products`, icon: "list" },
          { title: "Stock Update", path: `/vendor/${vendorId}/products/stock-update`, icon: "refresh-cw" },
          { title: "Variant Stock Update", path: `/vendor/${vendorId}/products/variant-stock-update`, icon: "layers" },
          { title: "Category Management", path: `/vendor/${vendorId}/products/categories`, icon: "layers" },
        ],
      },
      {
        section: 'Configuration',
        list: [
          { title: "Product Variants", path: `/vendor/${vendorId}/products/variants`, icon: "list-check" },
        ]
      },
      {
        section: "Data",
        list: [
          { title: "Bulk Product Imports", path: `/vendor/${vendorId}/products/import-products`, icon: "upload" },
          { title: "Export Data", path: `/vendor/${vendorId}/products/export-products`, icon: "download" },
          { title: "Product Localization", path: `/vendor/${vendorId}/products/product-localization`, icon: "globe" },
        ],
      },
    ],
  },
].filter(section => section.menu.toLowerCase() === selectedMenu.toLowerCase());

// ============================================================
// VENDOR SETTINGS LINKS
// ============================================================
//used
export const VENDOR_SETTINGS_LINKS: Link[] = [
  {
    section: "general",
    list: [
      { title: "Store Profile", path: null, icon: "profile" },
      { title: "Locations & Warehouses", path: "locations", icon: "locations" },
    ],
  },
  {
    section: "organization",
    list: [
      { title: "Billing & Banking", path: "billing", icon: "billing" },
    ],
  },
  {
    section: "account",
    list: [{ title: "Business Profile", path: "businessProfile", icon: "businessProfile" },
    { title: "Security & Password", path: "security", icon: "usersRoles" },
    ],
  },
];

// ============================================================
// VENDOR DASHBOARD — MOCK DATA
// ============================================================

export const VENDOR_DASHBOARD_STATS = {
  totalRevenue: 120000,
  revenueGrowth: 10,
  pendingOrder: 15,
  lowStock: 5,
  activeOrders: 320,
  totalProducts: 156,
  completedOrders: 280,
  averageOrderValue: 3750,
};

// ============================================================
// VENDOR — RECENT ORDERS MOCK DATA
// ============================================================


// export const VENDOR_ORDER_DATA: VendorOrderType[] = [
//   { orderId: "#ORD-2024-001", customerName: "Rahul Kumar", status: "Pending", amount: 1499, action: "Ship Now", date: "2026-03-10", items: 2 },
//   { orderId: "#ORD-2024-002", customerName: "Anita Singh", status: "Shipped", amount: 3499, action: "View", date: "2026-03-09", items: 1 },
//   { orderId: "#ORD-2024-003", customerName: "Nitish Kumar", status: "Delivered", amount: 2499, action: "View", date: "2026-03-08", items: 3 },
//   { orderId: "#ORD-2024-004", customerName: "Rudra Kumar", status: "Pending", amount: 4499, action: "Ship Now", date: "2026-03-07", items: 1 },
//   { orderId: "#ORD-2024-005", customerName: "Rudra Kumar", status: "Delivered", amount: 4099, action: "View", date: "2026-03-06", items: 4 },
//   { orderId: "#ORD-2024-006", customerName: "Akash Kumar", status: "Delivered", amount: 2099, action: "View", date: "2026-03-05", items: 2 },
//   { orderId: "#ORD-2024-007", customerName: "Akash Kumar", status: "Delivered", amount: 2099, action: "View", date: "2026-03-04", items: 1 },
//   { orderId: "#ORD-2024-008", customerName: "Akash Kumar", status: "Delivered", amount: 1499, action: "View", date: "2026-03-03", items: 2 },
//   { orderId: "#ORD-2024-009", customerName: "Priya Sharma", status: "Shipped", amount: 2999, action: "View", date: "2026-03-02", items: 3 },
//   { orderId: "#ORD-2024-010", customerName: "Vikram Singh", status: "Pending", amount: 5499, action: "Ship Now", date: "2026-03-01", items: 1 },
//   { orderId: "#ORD-2024-011", customerName: "Neha Gupta", status: "Delivered", amount: 1299, action: "View", date: "2026-02-28", items: 2 },
//   { orderId: "#ORD-2024-012", customerName: "Sanjay Verma", status: "Shipped", amount: 3899, action: "View", date: "2026-02-27", items: 1 },
//   { orderId: "#ORD-2024-013", customerName: "Pooja Patel", status: "Pending", amount: 2199, action: "Ship Now", date: "2026-02-26", items: 3 },
//   { orderId: "#ORD-2024-014", customerName: "Amit Mishra", status: "Delivered", amount: 999, action: "View", date: "2026-02-25", items: 1 },
//   { orderId: "#ORD-2024-015", customerName: "Sneha Reddy", status: "Shipped", amount: 4599, action: "View", date: "2026-02-24", items: 2 },
//   { orderId: "#ORD-2024-016", customerName: "Karan Malhotra", status: "Pending", amount: 6299, action: "Ship Now", date: "2026-02-23", items: 4 },
//   { orderId: "#ORD-2024-017", customerName: "Divya Joshi", status: "Delivered", amount: 1899, action: "View", date: "2026-02-22", items: 1 },
//   { orderId: "#ORD-2024-018", customerName: "Rohit Nair", status: "Shipped", amount: 7499, action: "View", date: "2026-02-21", items: 2 },
// ];

// ============================================================
// VENDOR — INVENTORY MOCK DATA
// ============================================================


// export const VENDOR_INVENTORY_DATA: InventoryItemType[] = [
//   { id: "INV-001", name: "Sony WH-1000XM5", sku: "SNY-WH-XM5", category: "Headphones", stock: 45, reorderLevel: 10, price: 29990, status: "In Stock" },
//   { id: "INV-002", name: "Blue Yeti USB Mic", sku: "BLU-YETI-USB", category: "Microphones", stock: 8, reorderLevel: 10, price: 10999, status: "Low Stock" },
//   { id: "INV-003", name: "Marshall Emberton", sku: "MAR-EMB-BLK", category: "Speakers", stock: 32, reorderLevel: 15, price: 14999, status: "In Stock" },
//   { id: "INV-004", name: "Shure SM7B", sku: "SHR-SM7B", category: "Microphones", stock: 0, reorderLevel: 5, price: 36500, status: "Out of Stock" },
//   { id: "INV-005", name: "JBL Flip 6", sku: "JBL-FLP-6", category: "Speakers", stock: 67, reorderLevel: 20, price: 9999, status: "In Stock" },
//   { id: "INV-006", name: "Beats Studio3", sku: "BTS-STD-3", category: "Headphones", stock: 3, reorderLevel: 10, price: 25900, status: "Low Stock" },
//   { id: "INV-007", name: "Audio-Technica LP60X", sku: "AT-LP60X", category: "Audio Players", stock: 22, reorderLevel: 8, price: 13999, status: "In Stock" },
//   { id: "INV-008", name: "HyperX Cloud II", sku: "HPX-CLD-2", category: "Gaming Audio", stock: 0, reorderLevel: 15, price: 8490, status: "Out of Stock" },
//   { id: "INV-009", name: "Bose QC45", sku: "BOSE-QC45", category: "Headphones", stock: 18, reorderLevel: 10, price: 29900, status: "In Stock" },
//   { id: "INV-010", name: "Rode PodMic", sku: "RODE-PDMC", category: "Microphones", stock: 14, reorderLevel: 8, price: 9500, status: "In Stock" },
// ];

// ============================================================
// VENDOR — PRODUCT MANAGEMENT MOCK DATA
// ============================================================



export const VENDOR_PRODUCTS: VendorProduct[] = [
  { id: "VP-001", name: "Sony WH-1000XM5 Noise Canceling", category: "Headphones", price: 29990, stock: 45, status: "Active", imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=300&q=80", sales: 128 },
  { id: "VP-002", name: "Blue Yeti USB Microphone", category: "Microphones", price: 10999, stock: 8, status: "Active", imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=300&q=80", sales: 87 },
  { id: "VP-003", name: "Marshall Emberton Portable Speaker", category: "Speakers", price: 14999, stock: 32, status: "Active", imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=300&q=80", sales: 65 },
  { id: "VP-004", name: "Shure SM7B Vocal Mic", category: "Microphones", price: 36500, stock: 0, status: "Archived", imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=300&q=80", sales: 42 },
  { id: "VP-005", name: "AKG Pro K702 Reference", category: "Headphones", price: 22500, stock: 15, status: "Active", imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=300&q=80", sales: 31 },
  { id: "VP-006", name: "Logitech G733 LIGHTSPEED", category: "Gaming Audio", price: 11995, stock: 20, status: "Draft", imageUrl: "https://images.unsplash.com/photo-1628236162359-21b790d56569?auto=format&fit=crop&w=300&q=80", sales: 0 },
];

// ============================================================
// VENDOR — FINANCE STATS MOCK DATA
// ============================================================

export const VENDOR_FINANCE_DATA = {
  totalRevenue: 245000,
  thisMonthRevenue: 42500,
  lastMonthRevenue: 38000,
  pendingPayouts: 18500,
  totalTransactions: 892,
  averageOrderValue: 3750,
  revenueByMonth: [
    { month: "Jan", revenue: 32000 },
    { month: "Feb", revenue: 38000 },
    { month: "Mar", revenue: 42500 },
    { month: "Apr", revenue: 35000 },
    { month: "May", revenue: 48000 },
    { month: "Jun", revenue: 49500 },
  ],
  paymentMethods: [
    { method: "UPI", percentage: 45 },
    { method: "Credit Card", percentage: 30 },
    { method: "Debit Card", percentage: 15 },
    { method: "Net Banking", percentage: 10 },
  ],
};

// ============================================================
// VENDOR — MARKETING MOCK DATA
// ============================================================

export const VENDOR_MARKETING_DATA = {
  activeCampaigns: 3,
  totalImpressions: 125000,
  clickThroughRate: 4.2,
  conversionRate: 2.8,
  campaigns: [
    { id: "C-001", name: "Summer Sale 2026", status: "Active", budget: 15000, spent: 8500, impressions: 45000, clicks: 2100, startDate: "2026-03-01", endDate: "2026-03-31" },
    { id: "C-002", name: "New Arrivals Spotlight", status: "Active", budget: 8000, spent: 3200, impressions: 28000, clicks: 1400, startDate: "2026-03-05", endDate: "2026-03-20" },
    { id: "C-003", name: "Clearance Event", status: "Active", budget: 5000, spent: 4800, impressions: 52000, clicks: 1800, startDate: "2026-02-15", endDate: "2026-03-15" },
    { id: "C-004", name: "Valentine Audio Deals", status: "Completed", budget: 10000, spent: 10000, impressions: 72000, clicks: 3500, startDate: "2026-02-01", endDate: "2026-02-14" },
  ],
};

// ============================================================
// VENDOR — ORDERS PAGE MOCK DATA
// ============================================================


// export const VENDOR_ORDERS_DETAIL: OrderDetailType[] = [
//   { id: "order_001", orderNumber: "#ORD-2024-001", dateTime: "Today, 10:23 AM", customer: { name: "Rahul Kumar", location: "Mumbai, MH" }, status: "pending", total: 1499, paymentMethod: "Paid (UPI)" },
//   { id: "order_002", orderNumber: "#ORD-2024-002", dateTime: "11-01-26, 11:34 PM", customer: { name: "Anita Singh", location: "Bangalore, KA" }, status: "shipped", total: 3499, paymentMethod: "COD" },
//   { id: "order_003", orderNumber: "#ORD-2024-003", dateTime: "10-01-26, 4:34 PM", customer: { name: "Nitish kumar", location: "Kolkata, WB" }, status: "Delivered", total: 2499, paymentMethod: "COD" },
//   { id: "order_004", orderNumber: "#ORD-2024-004", dateTime: "5-01-26, 1:34 PM", customer: { name: "Rudra kumar", location: "Surat, GJ" }, status: "shipped", total: 4499, paymentMethod: "Paid (UPI)" },
//   { id: "order_005", orderNumber: "#ORD-2024-005", dateTime: "5-01-26, 1:34 PM", customer: { name: "Rudra kumar", location: "Surat, GJ" }, status: "Delivered", total: 4099, paymentMethod: "COD" },
//   { id: "order_006", orderNumber: "#ORD-2024-006", dateTime: "5-01-26, 1:34 PM", customer: { name: "Akash kumar", location: "Kolkata, WB" }, status: "Delivered", total: 2099, paymentMethod: "Paid (UPI)" },
//   { id: "order_007", orderNumber: "#ORD-2024-007", dateTime: "5-01-26, 1:34 PM", customer: { name: "Akash kumar", location: "Kolkata, WB" }, status: "Delivered", total: 2099, paymentMethod: "COD" },
//   { id: "order_008", orderNumber: "#ORD-2024-008", dateTime: "5-01-26, 1:34 PM", customer: { name: "Niraj kumar", location: "Guwahati, AS" }, status: "Delivered", total: 1499, paymentMethod: "Paid (UPI)" },
// ];

// ============================================================
// VENDOR — WAREHOUSE MOCK DATA
// ============================================================


// export const WAREHOUSE_DATA: WarehouseType[] = [
//   { warehouse_id: 1, company_id: 101, name: "Main Warehouse (Surat)", location: "Ring Road, Surat, Gujarat", is_active: true, total_units: 4520, is_default: true },
//   { warehouse_id: 2, company_id: 101, name: "North Hub (Delhi)", location: "Okhla Ind. Estate, Delhi", is_active: true, total_units: 2520, is_default: false },
//   { warehouse_id: 3, company_id: 101, name: "South Hub (Bengaluru)", location: "Whitefield, Bengaluru, Karnataka", is_active: true, total_units: 3150, is_default: false },
//   { warehouse_id: 4, company_id: 101, name: "West Hub (Mumbai)", location: "Bhiwandi, Thane, Maharashtra", is_active: true, total_units: 1890, is_default: false },
//   { warehouse_id: 5, company_id: 101, name: "East Hub (Kolkata)", location: "Salt Lake Sector V, Kolkata, WB", is_active: true, total_units: 1240, is_default: false },
// ];

// ============================================================
// VENDOR — INVENTORY PRODUCT LIST MOCK DATA
// ============================================================



// export const INVENTORY_PRODUCTS: InventoryProductType[] = [
//   { id: "prod-001", productName: "Noise Air Clips Wireless Open Ear Earbuds", sku: "AUD-MIC-001", category: "Audio", stock: 5, price: 8999, warehouse: "Main Warehouse", status: "Low Stock", imageUrl: "https://picsum.photos/seed/AUD-MIC-001/200/200" },
//   { id: "prod-002", productName: "boAt 2025 Launch Rockerz 113", sku: "AUD-HDP-002", category: "Audio", stock: 220, price: 2099, warehouse: "Main Warehouse", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-HDP-002/200/200" },
//   { id: "prod-003", productName: "Noise Airwave Bluetooth in Ear Neckband", sku: "AUD-SPK-003", category: "Audio", stock: 400, price: 12999, warehouse: "Main Warehouse", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-SPK-003/200/200" },
//   { id: "prod-004", productName: "OnePlus Bullets Wireless Z3 in-Ear Neckband", sku: "AUD-SND-004", category: "Audio", stock: 10, price: 4099, warehouse: "North Hub", status: "Low Stock", imageUrl: "https://picsum.photos/seed/AUD-SND-004/200/200" },
//   { id: "prod-005", productName: "pTron Tangent Buzz w", sku: "AUD-SND-005", category: "Audio", stock: 40, price: 4099, warehouse: "North Hub", status: "Low Stock", imageUrl: "https://picsum.photos/seed/AUD-SND-005/200/200" },
//   { id: "prod-006", productName: "ZEBRONICS Duke Plus, Wireless Over Ear Headphone", sku: "AUD-SND-006", category: "Audio", stock: 20, price: 1299, warehouse: "North Hub", status: "Low Stock", imageUrl: "https://picsum.photos/seed/AUD-SND-006/200/200" },
//   { id: "prod-007", productName: "Sony WF-C510 Wireless Bluetooth Earbuds", sku: "AUD-SND-007", category: "Audio", stock: 2200, price: 3499, warehouse: "Main Warehouse", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-SND-007/200/200" },
//   { id: "prod-008", productName: "Boat New Launch Rockerz 650 Pro", sku: "AUD-SND-008", category: "Audio", stock: 40, price: 3499, warehouse: "North Hub", status: "Low Stock", imageUrl: "https://picsum.photos/seed/AUD-SND-008/200/200" },
//   { id: "prod-009", productName: "JBL Tune 760NC", sku: "AUD-HDP-009", category: "Audio", stock: 36, price: 2099, warehouse: "Main Warehouse", status: "Low Stock", imageUrl: "https://picsum.photos/seed/AUD-HDP-009/200/200" },
//   { id: "prod-010", productName: "Sennheiser Momentum 4", sku: "AUD-HDP-010", category: "Audio", stock: 183, price: 4099, warehouse: "North Hub", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-HDP-010/200/200" },
//   { id: "prod-011", productName: "Samsung Galaxy Buds2 Pro", sku: "AUD-WLS-011", category: "Audio", stock: 91, price: 1499, warehouse: "Main Warehouse", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-WLS-011/200/200" },
//   { id: "prod-012", productName: "Bose QuietComfort Ultra", sku: "AUD-HDP-012", category: "Audio", stock: 198, price: 2099, warehouse: "Main Warehouse", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-HDP-012/200/200" },
//   { id: "prod-013", productName: "Realme Buds Air 5", sku: "AUD-WLS-013", category: "Audio", stock: 197, price: 24999, warehouse: "North Hub", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-WLS-013/200/200" },
//   { id: "prod-014", productName: "Skullcandy Crusher ANC 2", sku: "AUD-SND-014", category: "Audio", stock: 181, price: 12999, warehouse: "Main Warehouse", status: "In Stock", imageUrl: "https://picsum.photos/seed/AUD-SND-014/200/200" },
//   { id: "prod-015", productName: "Marshall Major IV", sku: "AUD-HDP-015", category: "Audio", stock: 0, price: 12999, warehouse: "North Hub", status: "Out of Stock", imageUrl: "https://picsum.photos/seed/AUD-HDP-015/200/200" },
// ];

// ============================================================
// VENDOR — GST INVOICES MOCK DATA (FINANCES)
// ============================================================


export const GST_INVOICES: GstInvoice[] = [
  { id: 1, date: "2026-01-16", invoice_no: "INV-2026-0000000001", order_ref: "#ORD-00000009921", taxable_value: 2117.80, total_tax: 381.20, currency: "INR", download_available: true },
  { id: 2, date: "2026-01-15", invoice_no: "INV-2026-0000000004", order_ref: "#ORD-00000005921", taxable_value: 758.93, total_tax: 91.07, currency: "INR", download_available: true },
  { id: 3, date: "2026-01-14", invoice_no: "INV-2026-0000000003", order_ref: "#ORD-00000044921", taxable_value: 1540.00, total_tax: 277.20, currency: "INR", download_available: true },
  { id: 4, date: "2026-01-13", invoice_no: "INV-2026-0000000006", order_ref: "#ORD-00000009455", taxable_value: 3210.50, total_tax: 577.89, currency: "INR", download_available: true },
  { id: 5, date: "2026-01-12", invoice_no: "INV-2026-0000000045", order_ref: "#ORD-00000009451", taxable_value: 4500.00, total_tax: 810.00, currency: "INR", download_available: true },
  { id: 6, date: "2026-01-11", invoice_no: "INV-2026-0000000035", order_ref: "#ORD-00000065656", taxable_value: 2117.80, total_tax: 381.20, currency: "INR", download_available: true },
  { id: 7, date: "2026-01-10", invoice_no: "INV-2026-0000000036", order_ref: "#ORD-00005755645", taxable_value: 2117.80, total_tax: 381.20, currency: "INR", download_available: true },
  { id: 8, date: "2026-01-09", invoice_no: "INV-2026-0000000466", order_ref: "#ORD-00056565623", taxable_value: 2117.80, total_tax: 381.20, currency: "INR", download_available: true },
];

export const VENDOR_FINANCE_STATS = {
  totalEarnings: "₹ 1,20,000",
  earningsDesc: "Include CGST, SGST, IGST",
  pendingSettlements: "₹ 4,000",
  pendingDesc: "Include CGST, SGST, IGST",
  gstRegistration: "24ABCDE1234FIZ5",
  gstStatus: "Status: Active (Regular)",
};

// ============================================================
// VENDOR — COUPON MOCK DATA (MARKETING)
// ============================================================



// export const COUPON_DATA: CouponType[] = [
//   { id: 1, code: "WINTER26", discount_type: "PERCENTAGE", value: 25, status: "ACTIVE", conditions: { min_purchase_amount: 1000, customer_segment: "ALL", expiry_text: "Expires in 12 days" } },
//   { id: 2, code: "WELCOME2026", discount_type: "FLAT_AMOUNT", value: 100, currency: "INR", status: "ACTIVE", conditions: { customer_segment: "NEW_CUSTOMERS", expiry_text: "No expiry" } },
// ];

export const COUPON_COLORS = {
  text: ["text-blue-800", "text-green-800", "text-yellow-800", "text-gray-800", "text-purple-800", "text-pink-800", "text-indigo-800", "text-orange-800", "text-teal-800", "text-cyan-800"],
  bg: ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-gray-100", "bg-purple-100", "bg-pink-100", "bg-indigo-100", "bg-orange-100", "bg-teal-100", "bg-cyan-100"],
};

// ============================================================
// VENDOR — REVIEW MOCK DATA (MARKETING)
// ============================================================


export const REVIEW_DATA: UserReview[] = [
  { id: 1, user_name: "Rahul K.", purchased_item: "Cotton T-Shirt", rating: 5, review_text: "Great quality fabric! Fits perfectly and delivery was super fast. Will definitely order again.", time_posted: "2 hours ago", actions: { can_reply: true, can_report: true } },
  { id: 2, user_name: "Sneha M.", purchased_item: "Floral Summer Dress", rating: 4, review_text: "The print is beautiful and exactly as shown. The fit is slightly loose around the waist but comfortable.", time_posted: "5 hours ago", actions: { can_reply: true, can_report: true } },
  { id: 3, user_name: "Amit P.", purchased_item: "Slim Fit Jeans", rating: 3, review_text: "Quality is decent for the price, but the color faded slightly after the first wash.", time_posted: "1 day ago", actions: { can_reply: true, can_report: true } },
  { id: 4, user_name: "Priya S.", purchased_item: "Running Sneakers", rating: 5, review_text: "Absolutely love these! Very lightweight and perfect for my morning jogs.", time_posted: "2 days ago", actions: { can_reply: true, can_report: true } },
  { id: 5, user_name: "Vikram R.", purchased_item: "Leather Wallet", rating: 2, review_text: "The stitching started coming off within a week. Disappointed with the build quality.", time_posted: "3 days ago", actions: { can_reply: true, can_report: true } },
  { id: 6, user_name: "Anjali D.", purchased_item: "Cotton T-Shirt", rating: 5, review_text: "Ordered a size M and it fits true to size. Very soft material.", time_posted: "4 days ago", actions: { can_reply: true, can_report: true } },
  { id: 7, user_name: "Rohan G.", purchased_item: "Casual Linen Shirt", rating: 4, review_text: "Looks premium and feels great. Just wish the sleeves were a bit longer.", time_posted: "1 week ago", actions: { can_reply: true, can_report: true } },
  { id: 8, user_name: "Kavita L.", purchased_item: "Designer Handbag", rating: 1, review_text: "Product arrived damaged and customer support has been slow to respond.", time_posted: "1 week ago", actions: { can_reply: true, can_report: true } },
  { id: 9, user_name: "Arjun B.", purchased_item: "Wireless Headphones", rating: 5, review_text: "Best value for money. The bass is incredible and battery life lasts forever.", time_posted: "2 weeks ago", actions: { can_reply: true, can_report: true } },
  { id: 10, user_name: "Meera K.", purchased_item: "Cotton T-Shirt", rating: 3, review_text: "It's okay, but the fabric is thinner than I expected based on the photos.", time_posted: "2 weeks ago", actions: { can_reply: true, can_report: true } },
];

// ============================================================
// VENDOR — CUSTOMER CARE MOCK DATA
// ============================================================


export const CUSTOMER_TICKET_DATA: CustomerTicket[] = [
  { id: 1, ticket_number: "#9021", customer_name: "Sneha Kapoor", related_order: "#ORD-00009921", subject: "Received wrong size", description: "I ordered a Medium Cotton T-Shirt, but I received a Small. Please arrange for an exchange.", status: "In Progress", priority: "High", created: " 2 hours ago" },
  { id: 2, ticket_number: "#8955", customer_name: "Rahul Verma", related_order: "#ORD-00005921", subject: "Package marked delivered but not received", description: "The tracking says delivered yesterday, but I haven't received anything at my doorstep.", status: "Resolved", priority: "High", created: " 1 day ago" },
  { id: 3, ticket_number: "#8810", customer_name: "Amit Patel", related_order: "#ORD-00004492", subject: "Question about fabric care", description: "Can I machine wash the silk saree I bought, or is it dry clean only?", status: "Resolved", priority: "Low", created: " 3 days ago" },
  { id: 4, ticket_number: "#8500", customer_name: "Priya Singh", related_order: "#ORD-00009455", subject: "Refund not reflected yet", description: "I returned the item 5 days ago. When will the amount be credited back to my card?", status: "Closed", priority: "Medium", created: " 1 week ago" },
];

