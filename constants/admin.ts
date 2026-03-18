import type { NavLinkType } from "./common";
import {
  dashboard_icon,
  vendor_icon,
  analytics_icon,
  customer_care_icon,
  settings_icon,
} from "./common";

// ============================================================
// ADMIN NAVIGATION LINKS
// ============================================================

export const ADMIN_NAV_LINKS: NavLinkType[] = [
  { Dashboard: "/admin", icon: dashboard_icon },
  { Vendor: "/admin/vendorManagement", icon: vendor_icon },
  { Analytics: "/admin/auditLog", icon: analytics_icon },
  { "Support Tickets": "/admin/supportTickets", icon: customer_care_icon },
  { Settings: "/admin/settings", icon: settings_icon },
];

// ============================================================
// ADMIN DASHBOARD — MOCK DATA
// ============================================================

export const ADMIN_DASHBOARD_STATS = {
  totalVendors: 120,
  vendorGrowth: 15,
  totalCustomers: 450,
  totalOrders: 320,
  totalRevenue: 50000,
  systemsOperations: 99.9,
};

export interface ActiveInstanceType {
  id: number;
  name: string;
  email: string;
  status: "Healthy" | "High Load" | "Degraded";
}

export const ACTIVE_INSTANCES: ActiveInstanceType[] = [
  { id: 201, name: "Shree Electronics", email: "contact@shreeelectronics.in", status: "Healthy" },
  { id: 202, name: "FashionHub", email: "support@fashionhub.com", status: "Healthy" },
  { id: 203, name: "GreenMart Organics", email: "sales@greenmart.org", status: "High Load" },
  { id: 204, name: "TechWorld Solutions", email: "info@techworld.io", status: "Healthy" },
  { id: 205, name: "Royal Furnishings", email: "service@royalfurnishings.in", status: "High Load" },
  { id: 206, name: "BookNest", email: "help@booknest.co", status: "Healthy" },
  { id: 207, name: "UrbanStyle Apparel", email: "care@urbanstyle.com", status: "Healthy" },
  { id: 208, name: "KitchenKing Supplies", email: "orders@kitchenking.in", status: "High Load" },
  { id: 209, name: "GlowBeauty Cosmetics", email: "support@glowbeauty.in", status: "Healthy" },
  { id: 210, name: "MegaMart Traders", email: "sales@megamart.biz", status: "Healthy" },
  { id: 211, name: "SoundCraft Audio", email: "info@soundcraft.audio", status: "Healthy" },
  { id: 212, name: "InstrumentsPlus", email: "sales@instrumentsplus.com", status: "Degraded" },
];

// ============================================================
// ADMIN — VENDOR MANAGEMENT MOCK DATA
// ============================================================

export interface VendorManagementEntry {
  id: number;
  name: string;
  email: string;
  domain: string;
  status: "Active" | "Pending" | "Suspended";
  revenue: number;
}

export const VENDOR_LIST: VendorManagementEntry[] = [
  { id: 201, name: "Shree Electronics", email: "contact@shreeelectronics.in", domain: "shreeelectronics.in", status: "Pending", revenue: 69951 },
  { id: 202, name: "FashionHub", email: "support@fashionhub.com", domain: "fashionhub.com", status: "Active", revenue: 67863 },
  { id: 203, name: "GreenMart Organics", email: "sales@greenmart.org", domain: "greenmart.org", status: "Suspended", revenue: 33578 },
  { id: 204, name: "TechWorld Solutions", email: "info@techworld.io", domain: "techworld.io", status: "Active", revenue: 48867 },
  { id: 205, name: "Royal Furnishings", email: "service@royalfurnishings.in", domain: "royalfurnishings.in", status: "Suspended", revenue: 94217 },
  { id: 206, name: "BookNest", email: "help@booknest.co", domain: "booknest.co", status: "Pending", revenue: 49228 },
  { id: 207, name: "UrbanStyle Apparel", email: "care@urbanstyle.com", domain: "urbanstyle.com", status: "Active", revenue: 84513 },
  { id: 208, name: "KitchenKing Supplies", email: "orders@kitchenking.in", domain: "kitchenking.in", status: "Active", revenue: 68074 },
  { id: 209, name: "GlowBeauty Cosmetics", email: "support@glowbeauty.in", domain: "glowbeauty.in", status: "Suspended", revenue: 98671 },
  { id: 210, name: "MegaMart Traders", email: "sales@megamart.biz", domain: "megamart.biz", status: "Active", revenue: 24579 },
  { id: 211, name: "SoundCraft Audio", email: "info@soundcraft.audio", domain: "soundcraft.audio", status: "Active", revenue: 112450 },
  { id: 212, name: "VibeStation Music", email: "hello@vibestation.co", domain: "vibestation.co", status: "Pending", revenue: 15890 },
  { id: 213, name: "BeatMakers Hub", email: "support@beatmakers.hub", domain: "beatmakers.hub", status: "Active", revenue: 76340 },
  { id: 214, name: "AudioPrime Gear", email: "sales@audioprime.com", domain: "audioprime.com", status: "Active", revenue: 91200 },
  { id: 215, name: "ProSound Warehouse", email: "orders@prosound.in", domain: "prosound.in", status: "Suspended", revenue: 45670 },
];

// ============================================================
// ADMIN — APPROVE VENDOR REQUESTS MOCK DATA
// ============================================================

export interface VendorRequestEntry {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const VENDOR_REQUESTS: VendorRequestEntry[] = [
  { id: 301, businessName: "Shree Electronics", ownerName: "Rajesh Kumar", email: "rajesh@shreeelectronics.in", phone: "+91 98765 11111", category: "Electronics", submittedAt: "2026-02-28T10:00:00Z", status: "Pending" },
  { id: 302, businessName: "VibeStation Music", ownerName: "Priya Sharma", email: "priya@vibestation.co", phone: "+91 98765 22222", category: "Musical Instruments", submittedAt: "2026-03-01T14:30:00Z", status: "Pending" },
  { id: 303, businessName: "BeatMakers Hub", ownerName: "Amit Patel", email: "amit@beatmakers.hub", phone: "+91 98765 33333", category: "Music Production", submittedAt: "2026-03-02T09:15:00Z", status: "Pending" },
  { id: 304, businessName: "MelodyWave Studios", ownerName: "Sneha Reddy", email: "sneha@melodywave.in", phone: "+91 98765 44444", category: "Recording Equipment", submittedAt: "2026-03-03T11:45:00Z", status: "Pending" },
  { id: 305, businessName: "TuneBox India", ownerName: "Vikram Singh", email: "vikram@tunebox.in", phone: "+91 98765 55555", category: "DJ Equipment", submittedAt: "2026-03-04T16:20:00Z", status: "Pending" },
];

// ============================================================
// ADMIN — AUDIT LOG MOCK DATA
// ============================================================

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actor: string;
  tenant: string;
  actionType: "Active" | "Inactive" | "Pending" | "Suspended";
  targetEntity: string;
  details: string;
  ipAddress: string;
}

export const AUDIT_LOG_DATA: AuditLogEntry[] = [
  { id: 1, timestamp: "Oct 24, 14:45:12", actor: "akash jain", tenant: "System(Global)", actionType: "Active", targetEntity: "Vendor #882", details: "View JSON", ipAddress: "192.168.1.12" },
  { id: 2, timestamp: "Oct 24, 14:38:05", actor: "sarah connor", tenant: "TechWorld Inc.", actionType: "Pending", targetEntity: "Payment Gateway", details: "View JSON", ipAddress: "10.0.0.45" },
  { id: 3, timestamp: "Oct 24, 14:32:01", actor: "Super Admin", tenant: "System(Global)", actionType: "Active", targetEntity: "User: john.smith", details: "View JSON", ipAddress: "192.168.1.1" },
  { id: 4, timestamp: "Oct 24, 13:15:00", actor: "System Bot", tenant: "System(Global)", actionType: "Inactive", targetEntity: "API Key: pk_live_...", details: "View JSON", ipAddress: "127.0.0.1" },
  { id: 5, timestamp: "Oct 24, 11:20:44", actor: "akash jain", tenant: "ShoesWorld Inc.", actionType: "Active", targetEntity: "Domain: shoes.com", details: "View JSON", ipAddress: "192.168.1.12" },
  { id: 6, timestamp: "Oct 24, 09:45:22", actor: "Super Admin", tenant: "System(Global)", actionType: "Suspended", targetEntity: "Vendor #901", details: "View JSON", ipAddress: "192.168.1.1" },
  { id: 7, timestamp: "Oct 23, 18:30:10", actor: "david rose", tenant: "FashionHub Inc.", actionType: "Active", targetEntity: "User: david.r", details: "View JSON", ipAddress: "172.16.0.23" },
  { id: 8, timestamp: "Oct 23, 16:12:00", actor: "Super Admin", tenant: "System(Global)", actionType: "Active", targetEntity: "Vendor #882", details: "View JSON", ipAddress: "192.168.1.1" },
  { id: 9, timestamp: "Oct 23, 14:05:33", actor: "john smith", tenant: "System(Global)", actionType: "Inactive", targetEntity: "Session #4451", details: "View JSON", ipAddress: "192.168.1.55" },
  { id: 10, timestamp: "Oct 23, 09:00:01", actor: "Automated Job", tenant: "System(Global)", actionType: "Active", targetEntity: "Daily Backup", details: "View JSON", ipAddress: "10.0.0.1" },
  { id: 11, timestamp: "Oct 22, 20:15:30", actor: "priya sharma", tenant: "VibeStation Music", actionType: "Active", targetEntity: "Product Catalog Update", details: "View JSON", ipAddress: "192.168.2.10" },
  { id: 12, timestamp: "Oct 22, 17:30:00", actor: "Super Admin", tenant: "System(Global)", actionType: "Pending", targetEntity: "Vendor #915", details: "View JSON", ipAddress: "192.168.1.1" },
  { id: 13, timestamp: "Oct 22, 15:45:22", actor: "System Bot", tenant: "System(Global)", actionType: "Active", targetEntity: "SSL Certificate Renewal", details: "View JSON", ipAddress: "10.0.0.1" },
  { id: 14, timestamp: "Oct 22, 10:00:00", actor: "amit patel", tenant: "BeatMakers Hub", actionType: "Active", targetEntity: "New Product: TR-808 Clone", details: "View JSON", ipAddress: "172.16.0.55" },
  { id: 15, timestamp: "Oct 21, 23:59:59", actor: "Automated Job", tenant: "System(Global)", actionType: "Active", targetEntity: "Nightly DB Backup", details: "View JSON", ipAddress: "10.0.0.1" },
];

// ============================================================
// ADMIN — SUPPORT TICKETS MOCK DATA
// ============================================================

export interface TicketMessage {
  id: number;
  sender: string;
  role: string;
  text: string;
  time: string;
  type: "vendor" | "system" | "super_admin";
}

export interface SupportTicketType {
  id: string;
  title: string;
  company: string;
  email: string;
  status: "active" | "pending" | "closed";
  time: string;
  messages: TicketMessage[];
}

export const SUPPORT_TICKETS: SupportTicketType[] = [
  {
    id: "TK-1024",
    title: "Payment Gateway Error",
    company: "ShoesWorld Inc.",
    email: "admin@shoesworld.com",
    status: "active",
    time: "2m ago",
    messages: [
      { id: 1, sender: "John Doe", role: "Vendor Admin", text: "Hi, we are trying to process payments but getting a 500 error on checkout. It says 'API Key Invalid'. Can you check?", time: "10:30 AM", type: "vendor" },
      { id: 2, sender: "System Bot", role: "Bot", text: "Thank you for reaching out. A Super Admin has been notified and will review your configuration shortly.", time: "10:31 AM", type: "system" },
      { id: 3, sender: "You", role: "Super Admin", text: "Hello John, I checked your configuration. It seems your API Secret Key was rotated yesterday. Please update it in Settings > Payments.", time: "10:45 AM", type: "super_admin" },
      { id: 4, sender: "John Doe", role: "Vendor Admin", text: "Ah, I missed that. Updating it now... verify in a moment.", time: "10:48 AM", type: "vendor" },
    ],
  },
  {
    id: "TK-1025",
    title: "Domain Verification Failed",
    company: "TechWorld Inc.",
    email: "support@techworld.com",
    status: "pending",
    time: "15m ago",
    messages: [
      { id: 1, sender: "Alice Wang", role: "Vendor Admin", text: "We added the CNAME record but domain verification is still showing as failed. Our DNS provider confirmed it is propagated.", time: "11:00 AM", type: "vendor" },
      { id: 2, sender: "System Bot", role: "Bot", text: "Domain verification request received. Checking DNS records...", time: "11:01 AM", type: "system" },
    ],
  },
  {
    id: "TK-1026",
    title: "Request for Limit Increase",
    company: "FashionHub Inc.",
    email: "billing@fashionhub.com",
    status: "closed",
    time: "1h ago",
    messages: [
      { id: 1, sender: "Neha Gupta", role: "Vendor Admin", text: "We need to increase our product listing limit from 500 to 2000. Our catalog has grown significantly.", time: "09:00 AM", type: "vendor" },
      { id: 2, sender: "You", role: "Super Admin", text: "Hi Neha, I've upgraded your plan to Premium which allows up to 5000 listings. The changes are effective immediately.", time: "09:15 AM", type: "super_admin" },
      { id: 3, sender: "Neha Gupta", role: "Vendor Admin", text: "Thank you so much! I can see the new limit now. Closing this ticket.", time: "09:20 AM", type: "vendor" },
    ],
  },
  {
    id: "TK-1027",
    title: "Product Image Upload Failing",
    company: "SoundCraft Audio",
    email: "support@soundcraft.audio",
    status: "active",
    time: "30m ago",
    messages: [
      { id: 1, sender: "Ravi Kumar", role: "Vendor Admin", text: "Images larger than 2MB are failing to upload with a timeout error. This started happening since the last platform update.", time: "10:00 AM", type: "vendor" },
      { id: 2, sender: "System Bot", role: "Bot", text: "Upload issue detected. Escalating to engineering team.", time: "10:01 AM", type: "system" },
    ],
  },
  {
    id: "TK-1028",
    title: "Incorrect Revenue Report",
    company: "AudioPrime Gear",
    email: "accounts@audioprime.com",
    status: "pending",
    time: "45m ago",
    messages: [
      { id: 1, sender: "Deepak Verma", role: "Vendor Admin", text: "The monthly revenue report for February shows ₹0 revenue, but we had over 200 orders. Please investigate.", time: "09:30 AM", type: "vendor" },
    ],
  },
];

// ============================================================
// ADMIN — DASHBOARD CHART DATA
// ============================================================

export const ADMIN_CHART_DATA = {
  monthlyRevenue: [
    { month: "Jan", revenue: 42000, orders: 180 },
    { month: "Feb", revenue: 38000, orders: 165 },
    { month: "Mar", revenue: 50000, orders: 220 },
    { month: "Apr", revenue: 47000, orders: 200 },
    { month: "May", revenue: 55000, orders: 240 },
    { month: "Jun", revenue: 52000, orders: 230 },
    { month: "Jul", revenue: 60000, orders: 280 },
    { month: "Aug", revenue: 58000, orders: 260 },
    { month: "Sep", revenue: 62000, orders: 290 },
    { month: "Oct", revenue: 65000, orders: 310 },
    { month: "Nov", revenue: 70000, orders: 340 },
    { month: "Dec", revenue: 75000, orders: 360 },
  ],
};

// ============================================================
// ADMIN — VENDOR APPLICATIONS MOCK DATA (Approve Vendors)
// ============================================================

export interface VendorApplication {
  business_profile: {
    business_name: string;
    owner_name: string;
    owner_email: string;
    submission_date: string;
    status: 'verified' | 'pending' | 'rejected';
  };
  submitted_documents: {
    file_name: string;
    size: string;
    uploaded_at: string;
  }[];
  instance_details: {
    requested_subdomain: string;
    domain_extension: string;
    dns_check: 'passed' | 'failed';
  };
}

export const VENDOR_APPLICATIONS: VendorApplication[] = [
  {
    business_profile: {
      business_name: "starlight logistics",
      owner_name: "marcus vance",
      owner_email: "vance.logistics@provider.net",
      submission_date: "january 22, 2026",
      status: "verified"
    },
    submitted_documents: [
      { file_name: "fleet_insurance_2026.pdf", size: "4.2 mb", uploaded_at: "10 minutes ago" },
      { file_name: "operational_permit.pdf", size: "1.1 mb", uploaded_at: "12 minutes ago" }
    ],
    instance_details: {
      requested_subdomain: "starlight-track",
      domain_extension: ".platform.com",
      dns_check: "failed"
    }
  },
  {
    business_profile: {
      business_name: "urban green catering",
      owner_name: "elena rodriguez",
      owner_email: "elena@urbangreen.co",
      submission_date: "january 25, 2026",
      status: "pending"
    },
    submitted_documents: [
      { file_name: "health_dept_cert.pdf", size: "2.8 mb", uploaded_at: "1 day ago" },
      { file_name: "vendor_agreement.pdf", size: "1.9 mb", uploaded_at: "1 day ago" }
    ],
    instance_details: {
      requested_subdomain: "urbangreen",
      domain_extension: ".platform.com",
      dns_check: "passed"
    }
  },
  {
    business_profile: {
      business_name: "quantum code labs",
      owner_name: "hiroshi tanaka",
      owner_email: "h.tanaka@quantumlabs.io",
      submission_date: "january 27, 2026",
      status: "verified"
    },
    submitted_documents: [
      { file_name: "ip_declaration.pdf", size: "0.5 mb", uploaded_at: "45 minutes ago" },
      { file_name: "articles_of_assoc.pdf", size: "3.3 mb", uploaded_at: "50 minutes ago" }
    ],
    instance_details: {
      requested_subdomain: "q-code-labs",
      domain_extension: ".platform.com",
      dns_check: "passed"
    }
  }
];

