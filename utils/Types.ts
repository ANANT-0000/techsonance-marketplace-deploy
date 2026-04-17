
import { VendorRegisterSchemaType } from "./validation";
export enum UserStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}
export enum UserRole {
  Admin = 'admin',
  Vendor = 'vendor',
  Customer = 'customer'
}
export enum UserAddressTypeEnum {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other'
}
export const OrderStatusEnum = {
  DELIVERED: 'delivered',
  SHIPPING: 'shipping',
  PENDING: 'pending',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled'
} as const;

export type OrderStatusEnum = typeof OrderStatusEnum[keyof typeof OrderStatusEnum]

export enum PermissionEnum {
  READ = 'read',
  CREATE = 'create',
  DELETE = 'delete',
  UPDATE = 'update',
}
export enum InventoryItemStatusEnum {
  IN_STOCK = 'in stock',
  LOW_STOCK = 'low stock',
  OUT_OF_STOCK = 'out of stock'
}
// used in multiple places
export enum AddressOperationEnum {
  ADD = 'add',
  EDIT = 'edit'
}
//used in multiple places
export enum AddressForEnum {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other'
}
// used in multiple places
export enum BuyBtnMode {
  CART = 'cart',
  QUICK_BUY = 'quick-buy',
}
export interface VendorUserType {
  company_id: string;
  vendor_id: string | null;
  id: string;
  role: string;
  email: string;
  phone: string;
  // profileImgUrl: string;
  // user_status: 'active' | 'suspended' | 'pending';
  first_name: string;
  last_name: string;
  country_code: string
  phone_number: string
  store_name: string
  category: string
  vendor_status: string
  joined_at: Date;
}

export interface UserType {
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
}
// Supporting Interfaces based on your schema
// used in multiple places
export interface AddressType {
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
  items: CartItemType[];
  created_at: string;
}
//used in cart 
export interface CartItemType {
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
  order_status: OrderStatusEnum;
  delivered_at?: string;
  shippingTo: AddressType | string;
  products?: { product_id: string; quantity: number }[];
  total_amount: number;
  address_id: number;
  created_at: string;
}


export interface Order {
  orderId: string;
  customerName: string;
  status: OrderStatusEnum;
  amount: number;
  action: 'Ship Now' | 'View';
}



export interface RoleDefinition {
  can: PermissionEnum[];
}
export const role: Record<UserRole, RoleDefinition> = {
  [UserRole.Admin]: {
    can: [PermissionEnum.CREATE, PermissionEnum.READ, PermissionEnum.UPDATE, PermissionEnum.DELETE]
  },
  [UserRole.Vendor]: {
    can: [PermissionEnum.CREATE, PermissionEnum.READ, PermissionEnum.UPDATE, PermissionEnum.DELETE]
  },
  [UserRole.Customer]: {
    can: [PermissionEnum.READ,]
  }
}

export interface Product {
  id: string; // Used for React keys and API calls
  productName: string;
  sku: string;
  stock: number;
  price: number;
  status: 'Active' | 'Inactive';
  imageUrl: string;
}
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
}export interface BestSellingProductType {
  title: string;
  url: string;
  description: string;
  satisfaction: string;
}
export interface CATEGORY_LIST_TYPE {
  title: string;
  url: string;
}

export interface FeedbackType {
  customerName: string;
  feedback: string;
  rating: number;
}
export interface CATEGORY_LIST_TYPE {
  title: string;
  url: string;
}
export interface OrderSuccessStatusTypes {
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

export interface OrderFailedStatusTypes {
  errorCode?: string;
  transactionId?: string;
  attemptedAmount?: number;
  possibleReasons?: string[];
}

export interface VendorRegisterFormData {
  vendor: VendorRegisterSchemaType;
  documents: File[] | undefined | FormData

}

export interface CATEGORY_LIST_TYPE {
  title: string;
  url: string;
}

export interface BestSellingProductType {
  title: string;
  url: string;
  description: string;
  satisfaction: string;
}

export interface FeedbackType {
  customerName: string;
  feedback: string;
  rating: number;
}

export interface ReviewType {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

export enum ProductStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export type ProductImageType = {
  id: string;
  image_url: string;
  alt_text?: string;
  imgType: "main" | "gallery";
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
  product_id: string;
  variant_id: string;
};

export type ProductFeatureType = {
  title: string;
  description: string | boolean | number;
};

export type ProductType = {
  id: string;
  name: string;
  description: string;
  base_price: string;
  discount_percent: string;
  stock_quantity: number;
  has_variants: boolean;
  status: ProductStatusEnum;
  category_id: string;
  company_id: string;
  vendor_id: string;
  features: ProductFeatureType[];
  images: ProductImageType[];
  variants?: VariantsType[];
  reviews?: ReviewType[];
  created_at: string;
  updated_at: string;
};
//Deleted the old PRODUCT_LIST_TYPE and replaced it with ProductType which is more comprehensive and closely aligned with the expected product data structure in a marketplace application.
// export interface PRODUCT_LIST_TYPE {
//   id: string;
//   title: string;
//   price: number;
//   discount: number;
//   category: string;
//   imgUrl: string;
//   description: string;
//   satisfaction: string;
//   rating?: number;
//   reviewCount?: number;
//   productDetails?: {
//     brand: string;
//     model: string;
//     specifications: {
//       [key: string]: string;
//     };
//   };
//   specificationsImgUrl?: string[];
//   reviews?: ReviewType[];
// }

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
export interface ActiveInstanceType {
  id: number;
  name: string;
  email: string;
  status: "Healthy" | "High Load" | "Degraded";
}
export interface VendorManagementEntryType {
  id: number;
  name: string;
  email: string;
  domain: string;
  status: "Active" | "Pending" | "Suspended";
  revenue: number;
}
export interface VendorRequestEntryType {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface AuditLogEntryType {
  id: number;
  timestamp: string;
  actor: string;
  tenant: string;
  actionType: UserStatusEnum
  targetEntity: string;
  details: string;
  ipAddress: string;
}
export interface TicketMessageType {
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
  messages: TicketMessageType[];
}
export enum VendorApplicationStatusEnum {
  PENDING = 'pending',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted'
}
export enum CouponDiscountTypeEum {
  PERCENTAGE = 'percentage',
  FLAT_AMOUNT = 'flat amount'
}
export enum CouponStatusEnum {
  ACTIVE = 'active', EXPIRED = 'expired', INACTIVE = 'inactive'
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
    dns_check: 'passed' | 'failed';
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

export interface VendorApplication {
  vendor: Vendor;
  user: UserType;
  company: Company;
}
export interface NavLinkType {
  [key: string]: string | null;
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

export type FeatureType = { title: string; description: string };
// export type ProductFormValuesType = {
//   productName: string;
//   description: string;
//   features: FeatureType[];
//   attributes: AttributesType[];
//   basePrice: string;
//   discountPercent: string;
//   stocks: string;
//   sku: string;
//   productMedia: FileOrImage[];
//   featureMedia: FileOrImage[];
//   category: string;
//   status: string;
//   taxProfile: string;
// };


export interface CustomerTicketType {
  id: number;
  ticket_number: string;
  customer_name: string;
  related_order?: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  created: string;
}
export interface UserReviewType {
  id: number;
  user_name: string;
  purchased_item: string;
  rating: number;
  review_text: string;
  time_posted: string;
  actions: { can_reply: boolean; can_report: boolean };
}

export interface CouponType {
  id: number;
  code: string;
  discount_type: CouponDiscountTypeEum;
  value: number;
  currency?: string;
  status: CouponStatusEnum;
  conditions: {
    min_purchase_amount?: number;
    customer_segment?: 'ALL' | 'NEW_CUSTOMERS';
    expiry_text: string;
  };
}export interface GstInvoiceType {
  id: number;
  date: string;
  invoice_no: string;
  order_ref: string;
  taxable_value: number;
  total_tax: number;
  currency: string;
  download_available: boolean;
}
export interface InventoryProductType {
  id: string;
  productName: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  warehouse: 'Main Warehouse' | 'North Hub';
  status: InventoryItemStatusEnum;
  imageUrl: string;
}export interface WarehouseType {
  warehouse_id: number;
  company_id: number;
  name: string;
  type: "Warehouse" | "Hub"; // Type of location
  address: string;         // Street/area address
  city: string;
  is_active: boolean;
  total_units: number;
  is_default: boolean;
  contactPerson?: string;  // Optional contact person
  phone?: string;
  location: string
}
export type OrderDetailType = {
  id: string;
  orderNumber: string;
  dateTime: string;
  customer: {
    name: string;
    location: string;
  };
  status: OrderStatusEnum;
  total: number;
  paymentMethod: 'Paid (UPI)' | 'COD' | 'Refunded' | 'Card payment';
};
export interface VendorProductType {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Draft" | "Archived";
  imageUrl: string;
  sales: number;
}export interface InventoryItemType {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderLevel: number;
  price: number;
  status: InventoryItemStatusEnum;
}


export interface VendorOrderType {
  orderId: string;
  customerName: string;
  status: OrderStatusEnum,
  amount: number;
  action: "Ship Now" | "View";
  date?: string;
  items?: number;
}
export interface ComplianceFieldType {
  value: string;
  label: string;
  placeholder: string;
  required: boolean;
  helperText: string;
}

export interface CountryComplianceType {
  country_code: string;
  country_name: string;
  fields: ComplianceFieldType[];
}


export type FileOrImage = File | ProductImageType;

export type VariantFormValuesType = {
  variantName: string;
  attributes: { name: string; value: string }[];
  basePrice: string;
  discountPercent: string;
  stocks: string;
  sku: string;
  variantMediaMain: FileOrImage[];
  variantMediaGallery: FileOrImage[];
  status: string;
};

export type AttributesType = {
  name: string,
  values: string
}
//used
export type VariantsType = {
  id: string
  variant_name: string,
  sku: string,
  attributes: AttributesType[],
  product_id: string;
  price: string;
  stock_quantity: number;
  images: ProductImageType[];
}
//used
export type ProductResponseType = {
  id: string;
  name: string;
  description: string;
  features: ProductFeatureType[];
  base_price: string;
  discount_percent: string;
  stock_quantity: string;
  status: "active" | "inactive";
  has_variants: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  vendor_id: string;
  category_id: string;
  images: ProductImageType[];
  variants: VariantsType;
  tax_profile: string,

};
