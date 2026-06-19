import {
  CategoryFilterType,
  DeleteMode,
} from "@/components/vendor/category/CategoryManager";
import { VendorRegisterSchema } from "./validation";
import type { LucideIcon } from "lucide-react";
export enum UserStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}
export enum UserRole {
  Admin = "admin",
  Vendor = "vendor",
  Customer = "customer",
}
export enum UserAddressTypeEnum {
  HOME = "home",
  WORK = "work",
  OTHER = "other",
}
export enum OrderStatusEnum {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
  REFUNDED = "refunded",
  REPLACED = "replaced",
}
export enum ActivityType {
  ORDER = "order",
  ADDRESS = "address",
  WISHLIST = "wishlist",
  REVIEW = "review",
  SECURITY = "security",
}
export type OrderStatus =
  (typeof OrderStatusEnum)[keyof typeof OrderStatusEnum];
export enum ProductVariantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
  DRAFT = "draft",
}
export enum ReturnType {
  RETURN = "return",
  REPLACEMENT = "replacement",
}
export enum ReturnStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  QC_FAILED = "qc_failed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
}
export enum PermissionEnum {
  READ = "read",
  CREATE = "create",
  DELETE = "delete",
  UPDATE = "update",
}
export enum InventoryItemStatusEnum {
  IN_STOCK = "in stock",
  LOW_STOCK = "low stock",
  OUT_OF_STOCK = "out of stock",
}
// used in multiple places
export enum AddressOperationEnum {
  ADD = "add",
  EDIT = "edit",
}
//used in multiple places
export enum AddressForEnum {
  HOME = "home",
  WORK = "work",
  OTHER = "other",
}
// used in multiple places
export enum BuyBtnMode {
  CART = "cart",
  QUICK_BUY = "quick-buy",
}
export enum PromotionType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  BUY_X_GET_Y = "buy_x_get_y",
  BOGO = "bogo",
  FREE_SHIPPING = "free_shipping",
  TIERED_DISCOUNT = "tiered_discount",
  BUNDLE_DEAL = "bundle_deal",
}

export enum PromotionStatus {
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  ACTIVE = "active",
  INACTIVE = "inactive",
  PAUSED = "paused",
  SCHEDULED = "scheduled",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum PromotionTargetType {
  ALL_PRODUCTS = "all_products",
  CATEGORY = "category",
  PRODUCT = "product",
  VENDOR = "vendor",
  PRODUCT_VARIANT = "product_variant",
}

export enum PromotionRuleType {
  MIN_CART_VALUE = "min_cart_value",
  MIN_QTY = "min_qty",
  CUSTOMER_SEGMENT = "customer_segment",
  FIRST_ORDER_ONLY = "first_order_only",
  PRODUCT_IN_CART = "product_in_cart",
  NEW_CUSTOMER = "new_customer",
  DATE_RANGE = "date_range",
  MAX_USES_PER_USER = "max_uses_per_user",
}

export enum BannerPlacement {
  HOMEPAGE_HERO = "homepage_hero",
  HOMEPAGE_SECONDARY = "homepage_secondary",
  CATEGORY_TOP = "category_top",
  PRODUCT_PAGE = "product_page",
  CART_SIDEBAR = "cart_sidebar",
  CHECKOUT_TOP = "checkout_top",
  MY_OFFERS_PAGE = "my_offers_page",
}

export enum PromoEventType {
  VIEWED = "viewed",
  CLICKED = "clicked",
  APPLIED = "applied",
  REDEEMED = "redeemed",
  REMOVED = "removed",
  DISMISSED = "dismissed",
}

export enum SegmentCriteriaOperator {
  AND = "AND",
  OR = "OR",
}

export enum ChangelogAction {
  CREATED = "created",
  UPDATED = "updated",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAUSED = "paused",
  RESUMED = "resumed",
  EXPIRED = "expired",
  DELETED = "deleted",
}
export type PercentageConfig = {
  value: number; // e.g. 20 (= 20%)
  cap?: number; // max discount in ₹; undefined = no cap
};

export type FixedAmountConfig = {
  value: number; // flat ₹ discount
};

export type BuyXGetYConfig = {
  buy_qty: number; // items customer must buy
  get_qty: number; // items given free / discounted
  get_product_variant_id?: string; // specific free item; null = cheapest in cart
  get_discount_percent: number; // 100 = free; 50 = half price
};

export type FreeShippingConfig = {
  max_shipping_waived?: number; // cap on shipping fee waived; undefined = all
};

export type TieredDiscountConfig = {
  tiers: Array<{
    min_cart: number; // cart subtotal threshold in ₹
    percent: number; // discount percent at this tier
  }>;
};

export type BundleDealConfig = {
  product_variant_ids: string[]; // all must be in cart
  bundle_price: number; // total price for the bundle
};

export type DiscountConfig =
  | PercentageConfig
  | FixedAmountConfig
  | BuyXGetYConfig
  | FreeShippingConfig
  | TieredDiscountConfig
  | BundleDealConfig;
// ─── Updated Coupon interface (add rules field for findOne response) ───────────

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_to: string;
  max_uses: number | null;
  max_uses_per_user: number | null;
  is_auto_applied?: boolean;
  total_used?: number;
  min_order_amount?: number | null;
  // NEW: rules returned by findOne so the edit form can repopulate them
  rules?: Array<{
    rule_type: PromotionRuleType;
    rule_config: Record<string, unknown>;
    negate: boolean;
  }>;
}

export interface AppliedPromotion {
  id: string;
  promotion_id: string;
  code: string;
  discount_type: PromotionType;
  discount_value: number;
  max_discount_amount: Object | null;
  isGlobal: boolean;
  applicableProducts: string[] | null;
  discount_config: DiscountConfig;
  rule: {
    id: string;
    created_at: Date;
    promotion_id: string;
    rule_type: PromotionRuleType;
    rule_config: unknown;
    negate: boolean;
  }[];
}
export interface RuleConfig_MinCartValue {
  amount: number;
}
export interface RuleConfig_MinQty {
  qty: number;
}
export interface RuleConfig_CustomerSegment {
  segment_id: string;
}
export interface RuleConfig_FirstOrderOnly {} // no extra fields
export interface RuleConfig_ProductInCart {
  product_id: string;
}
export interface RuleConfig_NewCustomer {
  registered_within_days: number;
}
export interface RuleConfig_DateRange {
  days_of_week: number[];
} // 0=Sun … 6=Sat
export interface RuleConfig_MaxUsesPerUser {
  max: number;
}

/** Discriminated union — rule_type narrows the exact rule_config shape */
export type PromotionRule =
  | {
      rule_type: PromotionRuleType.MIN_CART_VALUE;
      rule_config: RuleConfig_MinCartValue;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.MIN_QTY;
      rule_config: RuleConfig_MinQty;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.CUSTOMER_SEGMENT;
      rule_config: RuleConfig_CustomerSegment;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.FIRST_ORDER_ONLY;
      rule_config: RuleConfig_FirstOrderOnly;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.PRODUCT_IN_CART;
      rule_config: RuleConfig_ProductInCart;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.NEW_CUSTOMER;
      rule_config: RuleConfig_NewCustomer;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.DATE_RANGE;
      rule_config: RuleConfig_DateRange;
      negate?: boolean;
    }
  | {
      rule_type: PromotionRuleType.MAX_USES_PER_USER;
      rule_config: RuleConfig_MaxUsesPerUser;
      negate?: boolean;
    };

/** What the UI form holds per rule row before submitting */
export interface PromotionRuleFormRow {
  rule_type: PromotionRuleType;
  // Each rule_config field stored flat so react-hook-form can bind them
  amount?: number; // MIN_CART_VALUE
  qty?: number; // MIN_QTY
  segment_id?: string; // CUSTOMER_SEGMENT
  product_id?: string; // PRODUCT_IN_CART
  registered_within_days?: number; // NEW_CUSTOMER
  days_of_week?: number[]; // DATE_RANGE
  max?: number; // MAX_USES_PER_USER
  negate: boolean;
}
export interface VendorUser {
  company_id: string;
  vendor_id: string | null;
  user_id: string;
  id: string;
  role: string;
  email: string;
  phone: string;
  // profileImgUrl: string;
  // user_status: 'active' | 'suspended' | 'pending';
  first_name: string;
  last_name: string;
  country_code: string;
  phone_number: string;
  store_name: string;
  category: string;
  vendor_status: string;
  joined_at: Date;
  password_change_required?: boolean;
}

export interface User {
  id: string;
  profile_picture_url: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  country_code: string | null;
  phone_number: string | null;
  password_hash: string;
  user_status: UserStatusEnum | null;
  created_at: Date;
  updated_at: Date;
  company_id: string | null;
  role_id: string | null;
  password_change_required?: boolean;
}
// Supporting Interfaces based on your schema
// used in multiple places
export interface Address {
  address_line1: string;
  address_line2: string;
  address_type: string;
  city: string;
  company_id: string | null;
  country: string;
  created_at: string;
  id: string;
  is_default: boolean;
  landmark: string;
  name: string;
  number: string;
  postal_code: string;
  state: string;
  street: string;
  updated_at: string;
  user_id: string;
}

export interface Cart {
  cart_id: string;
  items: CartItem[];
  created_at: string;
}
//used in cart
export interface CartItem {
  cartId: string;
  cartItemId: string;
  quantity: number;
  productVariantId: string;
}

export interface Wishlist {
  wishlist_id: string;
  items: string[];
}

export interface UserOrder {
  order_id: number;
  order_status: OrderStatus;
  delivered_at?: string;
  shippingTo: Address | string;
  products?: { product_id: string; quantity: number }[];
  total_amount: number;
  address_id: number;
  created_at: string;
}

export enum OrderAction {
  SHIP_NOW = "Ship Now",
  VIEW = "View",
}

export interface Order {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  amount: number;
  action: OrderAction;
}

export interface RoleDefinition {
  can: PermissionEnum[];
}
export const role: Record<UserRole, RoleDefinition> = {
  [UserRole.Admin]: {
    can: [
      PermissionEnum.CREATE,
      PermissionEnum.READ,
      PermissionEnum.UPDATE,
      PermissionEnum.DELETE,
    ],
  },
  [UserRole.Vendor]: {
    can: [
      PermissionEnum.CREATE,
      PermissionEnum.READ,
      PermissionEnum.UPDATE,
      PermissionEnum.DELETE,
    ],
  },
  [UserRole.Customer]: {
    can: [PermissionEnum.READ],
  },
};

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  color: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  type: string;
  details: string;
}
export interface BestSellingProduct {
  title: string;
  url: string;
  description: string;
  satisfaction: string;
}
export interface CategoryList {
  title: string;
  url: string;
}

export interface Feedback {
  customerName: string;
  feedback: string;
  rating: number;
}
export interface CATEGORY_LIST {
  title: string;
  url: string;
}
export interface OrderSuccessStatus {
  orderId?: string;
  orderDate?: string;
  estimatedDelivery?: string;
  shippingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  items?: OrderItem[];
  subtotal?: number;
  discount?: number;
  delivery?: number;
  total?: number;
}

export interface OrderFailedStatus {
  errorCode?: string;
  transactionId?: string;
  attemptedAmount?: number;
  possibleReasons?: string[];
}

export interface VendorRegisterFormData {
  vendor: VendorRegisterSchema;
  documents: File[] | undefined | FormData;
}

export interface CATEGORY_LIST {
  title: string;
  url: string;
}

export interface BestSellingProductType {
  title: string;
  url: string;
  description: string;
  satisfaction: string;
}

export interface Feedback {
  customerName: string;
  feedback: string;
  rating: number;
}

export enum ProductStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ProductImageType {
  MAIN = "main",
  GALLERY = "gallery",
}

export interface Feature {
  title: string;
  description: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  imgType: ProductImageType;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  product_id: string;
  variant_id: string;
}

export interface Inventory {
  stock_quantity: number;
  warehouse_id: string;
}
export interface Review {
  id: string;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
  product_variant_id: string;
  user_id: string;
}
// export interface Category {
//   id: string;
//   name: string;
//   description: string;
//   parent_id: string | null;
//   created_at: string;
//   updated_at: string;
//   company_id: string;
// }
// used in vendor product list and product details page
export interface Product {
  id: string;
  name: string;
  description: string;
  features: Feature[];
  base_price: string;
  discount_percent: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  vendor_id: string;
  category_id: string;
  variants: Variant[];
  category: Category;
}

export interface Vendor {
  id: string;
  store_owner_first_name: string;
  store_owner_last_name: string;
  store_name: string;
  store_description: string;
  category: string;
  vendor_status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  user_id: string;
}

export enum InstanceStatus {
  HEALTHY = "Healthy",
  HIGH_LOAD = "High Load",
  DEGRADED = "Degraded",
}

export interface ActiveInstanceType {
  id: number;
  name: string;
  email: string;
  status: InstanceStatus;
}

export enum VendorManagementStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  SUSPENDED = "Suspended",
}

export interface VendorManagementEntryType {
  id: number;
  name: string;
  email: string;
  domain: string;
  status: VendorManagementStatus;
  revenue: number;
}

export enum VendorRequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export interface VendorRequestEntryType {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  submittedAt: string;
  status: VendorRequestStatus;
}

export interface AuditLogEntryType {
  id: number;
  timestamp: string;
  actor: string;
  tenant: string;
  actionType: UserStatusEnum;
  targetEntity: string;
  details: string;
  ipAddress: string;
}

export enum TicketMessageTypeEnum {
  VENDOR = "vendor",
  SYSTEM = "system",
  SUPER_ADMIN = "super_admin",
}

export interface TicketMessageType {
  id: number;
  sender: string;
  role: string;
  text: string;
  time: string;
  type: TicketMessageTypeEnum;
}

export enum SupportTicketStatus {
  ACTIVE = "active",
  PENDING = "pending",
  CLOSED = "closed",
}

export interface SupportTicketType {
  id: string;
  title: string;
  company: string;
  email: string;
  status: SupportTicketStatus;
  time: string;
  messages: TicketMessageType[];
}
export enum VendorApplicationStatusEnum {
  PENDING = "pending",
  REJECTED = "rejected",
  ACCEPTED = "accepted",
}

export interface VendorApplicationType {
  business_profile: {
    business_name: string;
    owner_name: string;
    owner_email: string;
    submission_date: string;
    status: VendorApplicationStatusEnum;
  };
  submitted_documents: {
    file_name: string;
    size: string;
    uploaded_at: string;
  }[];
  instance_details: {
    requested_subdomain: string;
    domain_extension: string;
    dns_check: "passed" | "failed";
  };
}

export interface Company {
  id: string;
  company_name: string;
  company_domain: string;
  company_structure: string;
  company_status: string;
  created_at: string;
  updated_at: string;
}
export interface VendorDocument {
  id: string;
  document_type: string;
  document_url: string;
  document_status: string;
  created_at: string;
  updated_at: string;
  vendor_id: string;
}

export interface VendorApplication {
  id: string;
  store_owner_first_name: string;
  store_owner_last_name: string;
  store_name: string;
  store_description: string;
  category: string;
  vendor_status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  user_id: string;
  user: User;
  company: Company;
  documents: VendorDocument[];
}
export interface NavLinkType {
  [label: string]: string | null | boolean | undefined;
  icon?: string;
  section?: string;
  divider?: boolean;
}
export interface FooterLinkType {
  title: string;
  url: string;
  icon?: string;
  styles?: string;
  category?: string;
}

export interface FooterSectionType {
  header: string;
  links: FooterLinkType[];
}

export interface tabLinkType {
  [key: string]: string | null;
}

export type ProductFeature = { title: string; description: string };
// export type ProductFormValuesType = {
//   productName: string;
//   description: string;
//   features: ProductFeatureType[];
//   attributes: AttributesType[];
//   basePrice: string;
//   discountPercent: string;
//   stocks: string;
//   sku: string;
//   productMedia: FileOrProductImage[];
//   featureMedia: FileOrProductImage[];
//   category: string;
//   status: string;
//   taxProfile: string;
// };

export enum CustomerTicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

export enum CustomerTicketPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export interface CustomerTicket {
  id: number;
  ticket_number: string;
  customer_name: string;
  related_order?: string;
  subject: string;
  description: string;
  status: CustomerTicketStatus;
  priority: CustomerTicketPriority;
  created: string;
}
export interface UserReview {
  id: number;
  user_name: string;
  purchased_item: string;
  rating: number;
  review_text: string;
  time_posted: string;
  actions: { can_reply: boolean; can_report: boolean };
}

export interface GstInvoice {
  id: number;
  date: string;
  invoice_no: string;
  order_ref: string;
  taxable_value: number;
  total_tax: number;
  currency: string;
  download_available: boolean;
}

export enum InventoryWarehouse {
  MAIN_WAREHOUSE = "Main Warehouse",
  NORTH_HUB = "North Hub",
}

export interface InventoryProduct {
  id: string;
  productName: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  warehouse: InventoryWarehouse;
  status: InventoryItemStatusEnum;
  imageUrl: string;
}

export enum WarehouseType {
  WAREHOUSE = "Warehouse",
  HUB = "Hub",
}

export interface Warehouse {
  warehouse_id: number;
  company_id: number;
  name: string;
  type: WarehouseType; // Type of location
  address: string; // Street/area address
  city: string;
  is_active: boolean;
  total_units: number;
  is_default: boolean;
  contactPerson?: string; // Optional contact person
  phone?: string;
  location: string;
}
export type OrderDetail = {
  id: string;
  orderNumber: string;
  dateTime: string;
  customer: {
    name: string;
    location: string;
  };
  status: OrderStatus;
  total: number;
  paymentMethod: "Paid (UPI)" | "COD" | "Refunded" | "Card payment";
};
export enum VendorProductStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
  ARCHIVED = "Archived",
}

export interface VendorProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: VendorProductStatus;
  imageUrl: string;
  sales: number;
}
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderLevel: number;
  price: number;
  status: InventoryItemStatusEnum;
}

export interface VendorOrder {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  amount: number;
  action: OrderAction;
  date?: string;
  items?: number;
}
export interface ComplianceField {
  value: string;
  label: string;
  placeholder: string;
  required: boolean;
  helperText: string;
}

export interface CountryCompliance {
  country_code: string;
  country_name: string;
  fields: ComplianceField[];
}

export type FileOrProductImage = File | ProductImage;

export type VariantFormValues = {
  variantName: string;
  attributes: { name: string; value: string }[];
  basePrice: string;
  discountPercent: string;
  stocks: string;
  sku: string;
  variantMediaMain: FileOrProductImage[];
  variantMediaGallery: FileOrProductImage[];
  status: string;
  productId: string;
  warehouseId?: string;
};

export type ProductAttributes = {
  name: string;
  value: string;
};
//used
export type Variant = {
  id: string;
  variant_name: string;
  sku: string;
  attributes: ProductAttributes[];
  product_id: string;
  price: string;
  stock_quantity: number;
  status: ProductStatusEnum;
  seo_meta: string | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  inventory: Inventory;
  reviews?: Review[];
};
export type ProductResponseType = {
  id: string;
  name: string;
  description: string;
  features: ProductFeature[];
  base_price: string;
  discount_percent: string;
  stock_quantity: string;
  status: ProductStatusEnum;
  has_variants: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  vendor_id: string;
  category_id: string;
  images: ProductImage[];
  variants: Variant[];
  tax_profile: string;
};
// USED
export interface ComplianceFieldPayload {
  country_code: string;
  field_key: string;
  field_value: string;
  is_active?: boolean;
  valid_until?: string | null;
}

export interface ComplianceDocumentPayload {
  label?: string;
}

export interface CompanyComplianceField {
  id: string;
  company_id: string;
  country_code: string;
  field_key: string;
  field_value: string;
  is_active: boolean;
  valid_until: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
}

export enum ComplianceDocumentStatus {
  PENDING_REVIEW = "pending_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface ComplianceDocument {
  id: string;
  compliance_field_id: string;
  company_id: string;
  document_url: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number | null;
  label: string | null;
  status: ComplianceDocumentStatus;
  rejection_reason: string | null;
  created_at: string;
}

export interface CartItemDisplay {
  id: string;
  cart_id: string;
  product_variant_id: string;
  quantity: number;
  productVariant: Variant;
}
export interface VariantDetails {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  status: string;
  stock_quantity: number;
  images?: { image_url: string }[] | string;
  product_id?: string;
}
export enum FieldType {
  TEXT = "text",
  TEXTAREA = "textarea",
  CHECKBOX = "checkbox",
  SELECT = "select",
  DATE = "date",
  NUMBER = "number",
}
export enum GridSpan {
  ONE = 1,
  TWO = 2,
}
export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  note?: string;
  step?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  gridSpan?: GridSpan;
};

// ── Reducer Enums & Interfaces ──────────────────────────────────

// ── Core Entity ──────────────────────────────────────────────
/** Represents a single product category as returned from the API. */
export interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  productCount: number;
  updated_at: string;
}

/** A parent category node augmented with its direct children for tree rendering. */
export interface CategoryTreeNode extends Category {
  children: Category[];
}

/** Drawer-specific view model with resolved parent name and children. */
export interface CategoryDrawerData extends Category {
  parentName: string;
  children: Category[];
}

// ── Form State ───────────────────────────────────────────────
/** Tracks the current state of the Create/Edit category form. */
export interface CategoryFormState {
  name: string;
  description: string;
  parentId: string;
  editingId: string | null;
}

/** Payload shape sent to the create/update API. */
export interface CategoryPayload {
  name: string;
  description: string;
  parent_id: string | null;
}

// ── Filter & Pagination ─────────────────────────────────────
/** Tracks the current search, filter, and pagination state. */
export interface CategoryFilterState {
  searchQuery: string;
  filterType: CategoryFilterType;
  currentPage: number;
  pageSize: number;
}

// ── Delete Modal ─────────────────────────────────────────────
/** Configuration for the complex delete modal when a parent has subcategories. */
export interface DeleteModalConfig {
  id: string;
  name: string;
  subcategories: Category[];
}

/** Tracks user's choice in the complex delete modal. */
export interface DeleteModalState {
  config: DeleteModalConfig | null;
  modeChoice: DeleteMode;
  moveTargetParentId: string;
}

// ── Drag & Drop ──────────────────────────────────────────────
/** Tracks the current drag-and-drop state for hierarchy reordering. */
export interface DragDropState {
  draggedCategoryId: string | null;
  dragOverCategoryId: string | null;
}

// ── Stats ────────────────────────────────────────────────────
/** Computed statistics displayed in the stats cards. */
export interface CategoryStatsData {
  totalCategories: number;
  parentCategoriesCount: number;
  subcategoriesCount: number;
  totalAssignedProducts: number;
}

/** Configuration for a single stat card. */
export interface StatCardConfig {
  titleKey: keyof CategoryStatsData;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

// ── Component Props ──────────────────────────────────────────
/** Props for the top-level CategoryManager composition root. */
export interface CategoryManagerProps {
  categories: Category[];
  setCheckChange: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Props for the page header component. */
export interface CategoryPageHeaderProps {
  onAddNew: () => void;
}

/** Props for the stats cards component. */
export interface CategoryStatsCardsProps {
  stats: CategoryStatsData;
}

/** Props for the Create/Edit form component. */
export interface CategoryFormProps {
  formState: CategoryFormState;
  categories: Category[];
  isPending: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onParentIdChange: (value: string) => void;
  onSubmit: (e: React.SubmitEvent) => void;
  onReset: () => void;
}

/** Props for the hierarchical tree table. */
export interface CategoryTreeTableProps {
  paginatedRoots: CategoryTreeNode[];
  treeData: CategoryTreeNode[];
  filterState: CategoryFilterState;
  selectedIds: string[];
  expandedIds: string[];
  dragOverCategoryId: string | null;
  isPending: boolean;
  totalPages: number;
  categories: Category[];
  bulkParentId: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: CategoryFilterType) => void;
  onPageChange: (page: number) => void;
  onToggleExpand: (id: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string, isChecked: boolean) => void;
  onEditClick: (cat: Category) => void;
  onDeleteClick: (cat: Category) => void;
  onDrawerOpen: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, targetId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetParentId: string) => void;
  onAddNew: () => void;
  onBulkParentIdChange: (value: string) => void;
  onBulkMove: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
}

/** Props for the bulk actions bar. */
export interface CategoryBulkActionsProps {
  selectedCount: number;
  categories: Category[];
  bulkParentId: string;
  onBulkParentIdChange: (value: string) => void;
  onBulkMove: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
}

/** Props for the right-side detail drawer. */
export interface CategoryDetailDrawerProps {
  drawerData: CategoryDrawerData | null;
  onClose: () => void;
  onEdit: (cat: Category) => void;
}

/** Props for the complex delete modal. */
export interface CategoryDeleteModalProps {
  deleteState: DeleteModalState;
  categories: Category[];
  onModeChange: (mode: DeleteMode) => void;
  onMoveTargetChange: (parentId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Props for the empty state placeholder. */
export interface CategoryEmptyStateProps {
  onAddNew: () => void;
}
export enum NavItemType {
  CUSTOM_LINK = "custom_link",
  CATEGORY = "category",
}
export enum NavItemDisplayType {
  CATEGORY_LISTING = "category_listing",
  DYNAMIC_SUBCATEGORIES = "dynamic_subcategories",
  PRODUCT_RANGES = "product_ranges",
}
export enum NavItemColType {
  SUBCATEGORIES = "subcategories",
  BRANDS = "brands",
  PROMOTION = "promotion",
  PRODUCTS = "products",
}
export enum NavMenuPosition {
  STICKY = "sticky",
  RELATIVE = "relative",
}
export enum NavMenuLogoAlignment {
  LEFT = "left",
  CENTER = "center",
}
export enum NavMenuType {
  SIMPLE = "simple",
  MEGA = "mega",
}
