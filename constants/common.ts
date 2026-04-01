// ============================================================
// ASSET PATHS (served from /public/assets/)
// ============================================================

import { CountryComplianceType, Product } from "@/utils/Types";

export const BRAND_LOGO = "/assets/e-commerce_brand_logo.png";
export const CUSTOMER_LOGIN_POSTER = "/assets/customer form poster 2.png";
export const TS_LOGO = "/assets/TS_Logo.png";
export const BAR_TOGGLE_ICON = "/assets/bar toggle icon.png";
export const CUSTOMER_REGISTRATION_POSTER = "/assets/customer form poster.png";
// Role Icons
export const vendor_icon = "/assets/vendor icon.png";
export const customers_icon = "/assets/customers icon.png";
export const analytics_icon = "/assets/analytics icon.png";
export const settings_icon = "/assets/settings icon.png";
export const customer_care_icon = "/assets/customer care icon.png";
export const dashboard_icon = "/assets/dashboard icon.png";

// Search / UI Icons
export const searchImgDark = "/assets/Search dark.png";
export const searchImgLight = "/assets/Search light.png";
export const heartLight = "/assets/icons-heart-light.png";
export const heartDark = "/assets/icons-heart-dark.png";
export const cartImgDark = "/assets/shoppingCart.png";
export const userIcon = "/assets/user icon.png";
export const delete_icon = "/assets/delete_icon.png";
export const arrow = "/assets/arrow_icon.png";
export const down_arrow = "/assets/down_arrow.png";
export const internet_icon = "/assets/internet_icon.png";
export const file_icon = "/assets/file_icon.png";
export const product_icon = "/assets/box_icon.png";
export const order_icon = "/assets/order_icon.png";
export const marketing_icon = "/assets/marketing_icon.png";
export const finance_icon = "/assets/finance_icon.png";
export const inventory_icon = "/assets/notes_icon.png";
export const replacement_icon = "/assets/replacement icon.png";

// Social Media Icons
export const instagram = "/assets/instagram icon.png";
export const facebook = "/assets/facebook icon.png";
export const youtube = "/assets/youtube icon.png";

// Theme Toggle Icons
export const toggle_light = "/assets/toggle-light.png";
export const toggle_dark = "/assets/toggle-dark.png";

// ============================================================
// TYPES  (Re-exported from utils/Types.ts)
// ============================================================

export { UserRole } from "@/utils/Types";
export type { UserProfile, Address, Cart, CartItem, Wishlist, UserOrder, OrderStatus, Order, Permission, RoleDefinition } from "@/utils/Types";

// ============================================================
// SHARED INTERFACES
// ============================================================

export const productData: Product[] = [
  {
    "id": "prod-001",
    "productName": "Noise Air Clips Wireless Open Ear Earbuds",
    "sku": "AUD-MIC-001",
    "stock": 90,
    "price": 8999,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-MIC-001/200/200"
  },
  {
    "id": "prod-002",
    "productName": "boAt 2025 Launch Rockerz 113",
    "sku": "AUD-HDP-002",
    "stock": 183,
    "price": 2099,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-HDP-002/200/200"
  },
  {
    "id": "prod-003",
    "productName": "Noise Airwave Bluetooth in Ear Neckband",
    "sku": "AUD-SPK-003",
    "stock": 45,
    "price": 12999,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SPK-003/200/200"
  },
  {
    "id": "prod-004",
    "productName": "OnePlus Bullets Wireless Z3 in-Ear Neckband",
    "sku": "AUD-SND-004",
    "stock": 46,
    "price": 4099,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SND-004/200/200"
  },
  {
    "id": "prod-005",
    "productName": "pTron Tangent Buzz w",
    "sku": "AUD-SND-005",
    "stock": 22,
    "price": 4099,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SND-005/200/200"
  },
  {
    "id": "prod-006",
    "productName": "ZEBRONICS Duke Plus, Wireless Over Ear Headphone",
    "sku": "AUD-SND-006",
    "stock": 196,
    "price": 1299,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SND-006/200/200"
  },
  {
    "id": "prod-007",
    "productName": "Sony WF-C510 Wireless Bluetooth Earbuds",
    "sku": "AUD-SND-007",
    "stock": 172,
    "price": 3499,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SND-007/200/200"
  },
  {
    "id": "prod-008",
    "productName": "Boat New Launch Rockerz 650 Pro",
    "sku": "AUD-SND-008",
    "stock": 237,
    "price": 3499,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SND-008/200/200"
  },
  {
    "id": "prod-009",
    "productName": "JBL Tune 760NC",
    "sku": "AUD-HDP-009",
    "stock": 36,
    "price": 2099,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-HDP-009/200/200"
  },
  {
    "id": "prod-010",
    "productName": "Sennheiser Momentum 4",
    "sku": "AUD-HDP-010",
    "stock": 183,
    "price": 4099,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-HDP-010/200/200"
  },
  {
    "id": "prod-011",
    "productName": "Samsung Galaxy Buds2 Pro",
    "sku": "AUD-WLS-011",
    "stock": 91,
    "price": 1499,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-WLS-011/200/200"
  },
  {
    "id": "prod-012",
    "productName": "Bose QuietComfort Ultra",
    "sku": "AUD-HDP-012",
    "stock": 198,
    "price": 2099,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-HDP-012/200/200"
  },
  {
    "id": "prod-013",
    "productName": "Realme Buds Air 5",
    "sku": "AUD-WLS-013",
    "stock": 197,
    "price": 24999,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-WLS-013/200/200"
  },
  {
    "id": "prod-014",
    "productName": "Skullcandy Crusher ANC 2",
    "sku": "AUD-SND-014",
    "stock": 181,
    "price": 12999,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-SND-014/200/200"
  },
  {
    "id": "prod-015",
    "productName": "Marshall Major IV",
    "sku": "AUD-HDP-015",
    "stock": 248,
    "price": 12999,
    "status": "Active",
    "imageUrl": "https://picsum.photos/seed/AUD-HDP-015/200/200"
  }
]



export const ORGANIZATION_TAXATION_OPTIONS =
  [

    { value: "standard", label: "GST Standard (18%)" },
    { value: "reduced", label: "GST Reduced (5%)" },
    { value: "zero", label: "Zero Rated (0%)" },
  ];

// ============================================================
// CATEGORY OPTIONS (for vendor registration)
// ============================================================


export const categoryOptions: { value: string; label: string }[] = [
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "home_and_garden", label: "Home & Garden" },
  { value: "health_and_beauty", label: "Health & Beauty" },
  { value: "sports_and_outdoors", label: "Sports & Outdoors" },
  { value: "toys_and_games", label: "Toys & Games" },
  { value: "automotive", label: "Automotive" },
  { value: "books_and_media", label: "Books & Media" },
  { value: "food_and_beverage", label: "Food & Beverage" },
  { value: "art_and_collectibles", label: "Art & Collectibles" }
];

export const BusinessStructure: { value: string; label: string }[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "corporation", label: "Corporation" },
  { value: "llc", label: "LLC" }
];
// ============================================================
// COUNTRY CODES
// ============================================================

export const COUNTRY_CODES = [
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+91", label: "🇮🇳 +91" },
  { value: "+61", label: "🇦🇺 +61" },
  { value: "+33", label: "🇫🇷 +33" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+81", label: "🇯🇵 +81" },
  { value: "+86", label: "🇨🇳 +86" },
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+52", label: "🇲🇽 +52" },
  { value: "+27", label: "🇿🇦 +27" },
  { value: "+971", label: "🇦🇪 +971" },
];

export const COUNTRIES: CountryComplianceType[] = [
  {
    country_code: "IN",
    country_name: "India",
    fields: [
      { value: "gstin", label: "GSTIN", placeholder: "15-digit GST Number", required: true, helperText: "Mandatory for all e-commerce. Regulated by GSTN." },
      { value: "pan", label: "Business PAN", placeholder: "ABCDE1234F", required: true, helperText: "Linked to GSTIN for tax tracking." },
      { value: "fssai", label: "FSSAI License", placeholder: "14-digit License No.", required: false, helperText: "Only required for food/supplement categories." },
      { value: "dpdp_dpo", label: "Data Protection Officer", placeholder: "Name of DPO", required: true, helperText: "Mandatory compliance with DPDP Act 2023 Rules." }
    ]
  },
  {
    country_code: "BD",
    country_name: "Bangladesh",
    fields: [
      { value: "bin", label: "BIN (VAT Reg)", placeholder: "Business Identification No.", required: true, helperText: "Regulated by NBR. Mushak 6.3 required on invoices." },
      { value: "tin", label: "TIN Number", placeholder: "Taxpayer Identification No.", required: true, helperText: "Standard income tax registration." }
    ]
  },
  {
    country_code: "LK",
    country_name: "Sri Lanka",
    fields: [
      { value: "tin", label: "TIN Number", placeholder: "Taxpayer Identification No.", required: true, helperText: "Inland Revenue Board (IRB) registration." },
      { value: "vat_reg", label: "VAT Number", placeholder: "Enter VAT No.", required: false, helperText: "2026 Threshold: LKR 36M annual turnover." }
    ]
  },
  {
    country_code: "AE",
    country_name: "United Arab Emirates",
    fields: [
      { value: "trn", label: "TRN (VAT ID)", placeholder: "Tax Registration Number", required: true, helperText: "Federal Tax Authority (FTA) registration." },
      { value: "trade_license", label: "Trade License No.", placeholder: "Enter License Number", required: true, helperText: "Issued by DED or Free Zone Authority." },
      { value: "vara_status", label: "VARA Permit ID", placeholder: "Virtual Asset License", required: false, helperText: "Required for digital asset/crypto services." }
    ]
  },
  {
    country_code: "SA",
    country_name: "Saudi Arabia",
    fields: [
      { value: "cr_no", label: "CR Number", placeholder: "Commercial Registration", required: true, helperText: "Ministry of Commerce (MISA) prerequisite." },
      { value: "zatca_id", label: "ZATCA E-Invoice ID", placeholder: "FATOORA Integration ID", required: true, helperText: "Mandatory Phase 2 E-Invoicing compliance." },
      { value: "ubo_disclosure", label: "UBO Reference", placeholder: "Ultimate Beneficial Owner ID", required: true, helperText: "Ministerial Decision 235 compliance." }
    ]
  },
  {
    country_code: "KW",
    country_name: "Kuwait",
    fields: [
      { value: "moci_license", label: "MOCI License", placeholder: "Ministry of Commerce No.", required: true, helperText: "Primary trade license." },
      { value: "aml_ref", label: "AML Rulebook ID", placeholder: "Law 106 Compliance ID", required: true, helperText: "Regulated by CBK/KWFIU." }
    ]
  },
  {
    country_code: "QA",
    country_name: "Qatar",
    fields: [
      { value: "qfc_id", label: "QFC License", placeholder: "Qatar Financial Centre No.", required: false, helperText: "For financial/regulated entities." },
      { value: "tax_card", label: "Tax Card ID", placeholder: "Enter Tax Card No.", required: true, helperText: "Ministry of Justice/Tax Authority." }
    ]
  },
  {
    country_code: "OM",
    country_name: "Oman",
    fields: [
      { value: "cr_id", label: "CR Number", placeholder: "Commercial Registration", required: true, helperText: "Ministry of Commerce registration." },
      { value: "cma_license", label: "CMA License", placeholder: "Capital Market ID", required: false, helperText: "Required for investment-related services." }
    ]
  },
  {
    country_code: "BH",
    country_name: "Bahrain",
    fields: [
      { value: "cbb_license", label: "CBB License", placeholder: "Central Bank Reference", required: true, helperText: "Regulated by Central Bank of Bahrain." },
      { value: "cr_number", label: "CR Number", placeholder: "Commercial Registration", required: true, helperText: "Ministry of Industry & Commerce." }
    ]
  },
  {
    country_code: "CN",
    country_name: "China",
    fields: [
      { value: "samr_id", label: "Unified Social Credit Code", placeholder: "Business License No.", required: true, helperText: "Regulated by SAMR." },
      { value: "pipl_compliance", label: "PIPL ID", placeholder: "Data Privacy Officer", required: true, helperText: "Compliance with Cybersecurity Law & PIPL." }
    ]
  },
  {
    country_code: "JP",
    country_name: "Japan",
    fields: [
      { value: "corp_no", label: "Corporate Number", placeholder: "13-digit ID", required: true, helperText: "Legal Affairs Bureau registration." },
      { value: "jct_id", label: "JCT Number", placeholder: "Japan Consumption Tax ID", required: false, helperText: "Mandatory if turnover > ¥10M (NTA)." }
    ]
  },
  {
    country_code: "SG",
    country_name: "Singapore",
    fields: [
      { value: "uen", label: "UEN", placeholder: "Unique Entity Number", required: true, helperText: "Accounting and Corporate Regulatory Authority (ACRA)." },
      { value: "pdpa_rep", label: "PDPA Officer", placeholder: "Data Protection Representative", required: true, helperText: "Mandatory under Personal Data Protection Act." }
    ]
  },
  {
    country_code: "US",
    country_name: "United States",
    fields: [
      { value: "ein", label: "EIN", placeholder: "XX-XXXXXXX", required: true, helperText: "Federal Employer Identification Number (IRS)." },
      { value: "sales_tax", label: "State Sales Tax ID", placeholder: "Enter State ID", required: true, helperText: "Required for nexus-based selling." },
      { value: "fincen_boi", label: "BOI Report ID", placeholder: "FinCEN Tracking ID", required: true, helperText: "Required for all non-exempt entities (CTA 2026)." }
    ]
  },
  {
    country_code: "CA",
    country_name: "Canada",
    fields: [
      { value: "bn", label: "Business Number", placeholder: "9-digit BN", required: true, helperText: "Issued by Canada Revenue Agency (CRA)." },
      { value: "gst_hst", label: "GST/HST No.", placeholder: "12345 6789 RT0001", required: false, helperText: "Mandatory if turnover > CAD 30K." }
    ]
  },
  {
    country_code: "BR",
    country_name: "Brazil",
    fields: [
      { value: "cnpj", label: "CNPJ", placeholder: "Alphanumeric Format (2026)", required: true, helperText: "Receita Federal (Transitioned to Alphanumeric in 2026)." },
      { value: "lgpd_dpo", label: "LGPD DPO", placeholder: "Data Protection Officer", required: true, helperText: "General Data Protection Law (ANPD)." }
    ]
  },
  {
    country_code: "MX",
    country_name: "Mexico",
    fields: [
      { value: "rfc", label: "RFC ID", placeholder: "Tax ID Number", required: true, helperText: "SAT (Tax Administration Service) registration." },
      { value: "data_privacy", label: "Data Privacy Officer", placeholder: "Legal Rep Name", required: true, helperText: "Regulated by INAI." }
    ]
  },
  {
    country_code: "HK",
    country_name: "Hong Kong",
    fields: [
      { value: "brn", label: "BRN", placeholder: "Business Registration No.", required: true, helperText: "Inland Revenue Department (IRD)." },
      { value: "pdpo_status", label: "PDPO Compliance", placeholder: "Privacy Officer Name", required: true, helperText: "Privacy Commissioner (PCPD) rules." }
    ]
  },
  {
    country_code: "MY",
    country_name: "Malaysia",
    fields: [
      { value: "ssm_no", label: "SSM Registration No.", placeholder: "Enter 12-digit Co. No.", required: true, helperText: "Managed by Companies Commission (SSM)." },
      { value: "sst_id", label: "SST Number", placeholder: "Sales/Service Tax ID", required: false, helperText: "Mandatory if taxable services > MYR 500k (Customs)." },
      { value: "pdpa_cert", label: "PDPA Reg. Certificate", placeholder: "JPDP Registration No.", required: true, helperText: "Personal Data Protection Act (Act 709) compliance." }
    ]
  },
  {
    country_code: "TH",
    country_name: "Thailand",
    fields: [
      { value: "dbd_id", label: "DBD Business ID", placeholder: "13-digit Registration No.", required: true, helperText: "Department of Business Development." },
      { value: "thai_tin", label: "Thai Tax ID", placeholder: "Revenue Dept Tax ID", required: true, helperText: "Used for VAT and withholding (RD)." },
      { value: "pdpa_officer", label: "PDPA Compliance Lead", placeholder: "Assigned DPO Name", required: true, helperText: "Regulated by PDPC (Personal Data Protection Committee)." }
    ]
  },
  {
    country_code: "ID",
    country_name: "Indonesia",
    fields: [
      { value: "nib", label: "NIB (Business ID)", placeholder: "Nomor Induk Berusaha", required: true, helperText: "Primary ID from the OSS-RBA System." },
      { value: "npwp", label: "NPWP (Tax ID)", placeholder: "15-digit Taxpayer ID", required: true, helperText: "Directorate General of Taxes (DJP)." },
      { value: "pse_id", label: "PSE Registration", placeholder: "Electronic System Provider ID", required: true, helperText: "Mandatory for all digital platforms (Kominfo)." }
    ]
  },
  {
    country_code: "PH",
    country_name: "Philippines",
    fields: [
      { value: "tin_no", label: "BIR TIN", placeholder: "Taxpayer ID Number", required: true, helperText: "Bureau of Internal Revenue (BIR) registration." },
      { value: "sec_dti", label: "SEC/DTI Number", placeholder: "Registration Certificate No.", required: true, helperText: "Securities and Exchange Commission (Corporations) or DTI (Soles)." },
      { value: "npc_reg", label: "NPC Seal of Reg.", placeholder: "Data Privacy ID", required: true, helperText: "National Privacy Commission compliance." }
    ]
  },
  {
    country_code: "KR",
    country_name: "South Korea",
    fields: [
      { value: "biz_reg", label: "Business Reg. No.", placeholder: "XXX-XX-XXXXX", required: true, helperText: "Issued by the National Tax Service." },
      { value: "pipa_dpo", label: "Chief Privacy Officer", placeholder: "Designated CPO Name", required: true, helperText: "PIPA 2026 Update: Mandatory reporting to PIPC." }
    ]
  },
  // --- LATIN AMERICA ---
  {
    country_code: "AR",
    country_name: "Argentina",
    fields: [
      { value: "cuit", label: "CUIT", placeholder: "XX-XXXXXXXX-X", required: true, helperText: "Tax ID from ARCA (formerly AFIP)." },
      { value: "aaip_id", label: "Data Protection Reg.", placeholder: "AAIP Registration Number", required: true, helperText: "Agencia de Acceso a la Información Pública." }
    ]
  },
  {
    country_code: "CO",
    country_name: "Colombia",
    fields: [
      { value: "nit", label: "NIT Number", placeholder: "Tax Identification Number", required: true, helperText: "Managed by DIAN." },
      { value: "rues_id", label: "RUES / Cámara ID", placeholder: "Chamber of Commerce No.", required: true, helperText: "Commercial Registry compliance." }
    ]
  },
  {
    country_code: "CL",
    country_name: "Chile",
    fields: [
      { value: "rut", label: "RUT / RUN", placeholder: "XX.XXX.XXX-X", required: true, helperText: "SII (Internal Revenue Service) Tax ID." },
      { value: "uaf_aml", label: "UAF AML ID", placeholder: "Anti-Money Laundering Ref", required: true, helperText: "Financial Intelligence Unit (UIF) reporting." }
    ]
  },
  {
    country_code: "PE",
    country_name: "Peru",
    fields: [
      { value: "ruc", label: "RUC Number", placeholder: "11-digit Tax ID", required: true, helperText: "Issued by SUNAT." },
      { value: "apdp_reg", label: "Personal Data ID", placeholder: "DPA Registration No.", required: true, helperText: "Regulated by the Ministry of Justice (APDP)." }
    ]
  },
  // --- EUROPEAN UNION (REMAINING) ---
  {
    country_code: "IT",
    country_name: "Italy",
    fields: [
      { value: "partita_iva", label: "Partita IVA", placeholder: "ITXXXXXXXXXXX", required: true, helperText: "Agenzia delle Entrate Tax ID." },
      { value: "privacy_guarantor", label: "GDPR DPO", placeholder: "Responsabile Protezione Dati", required: true, helperText: "Garante per la Protezione dei Dati Personali." },
      { value: "ai_compliance", label: "Law 132/2025 AI Ref", placeholder: "AI Risk Assessment ID", required: false, helperText: "Italy’s 2026 AI Act alignment mandate." }
    ]
  },
  {
    country_code: "ES",
    country_name: "Spain",
    fields: [
      { value: "nif_cif", label: "NIF/CIF", placeholder: "Tax ID Number", required: true, helperText: "Tax Agency (AEAT) ID." },
      { value: "aesia_reg", label: "AESIA Registry No.", placeholder: "AI Supervision ID", required: false, helperText: "Spanish Agency for AI Supervision (AESIA) - mandatory for high-risk." }
    ]
  },
  {
    country_code: "NL",
    country_name: "Netherlands",
    fields: [
      { value: "kvk", label: "KvK Number", placeholder: "8-digit Chamber of Commerce No.", required: true, helperText: "Kamer van Koophandel (KvK)." },
      { value: "btw_id", placeholder: "NLXXXXXXXXXBXX", label: "BTW Identification", required: true, helperText: "Dutch VAT identification (Belastingdienst)." }
    ]
  },
  // --- PACIFIC ISLANDS ---
  {
    country_code: "FJ",
    country_name: "Fiji",
    fields: [
      { value: "roc_id", label: "ROC Pass Number", placeholder: "e-Profile/ROC ID", required: true, helperText: "Registrar of Companies (ROC) Digital Fiji." },
      { value: "fiji_tin", label: "TIN", placeholder: "Fiji Tax ID", required: true, helperText: "Fiji Revenue and Customs Service (FRCS)." }
    ]
  },
  {
    country_code: "PG",
    country_name: "Papua New Guinea",
    fields: [
      { value: "ipa_reg", label: "IPA Number", placeholder: "Co. Registration No.", required: true, helperText: "Investment Promotion Authority (IPA)." },
      { value: "png_tin", label: "TIN", placeholder: "Tax ID Number", required: true, helperText: "Internal Revenue Commission (IRC)." }
    ]
  }

];

