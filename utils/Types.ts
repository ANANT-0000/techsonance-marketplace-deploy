export interface UserProfile {
  company_id: string;
  vendor_id: string | null;
  user_id: string;
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


  // Linked Addresses (from 'addresses' table)
  addresses: Address[] | null;

  // Active Shopping State
  cart: Cart | null;
  wishlist: Wishlist | null;

  // History
  orders: UserOrder[];
}

// Supporting Interfaces based on your schema
export interface Address {
  address_id: string;
  name?: string;
  address_for: 'home' | 'work' | 'other';
  address_line1: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  postal_code: string;
  is_default: boolean;
}

export interface Cart {
  cart_id: string;
  items: CartItem[];
  created_at: string;
}

export interface CartItem {
  cart_item_id: number;
  variant_id: number;
  quantity: number;
}

export interface Wishlist {
  wishlist_id: number;
  items: number[]; // Array of product_ids
}

export interface UserOrder {
  order_id: number;
  order_status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  delivered_at?: string;
  shippingTo: Address | string;
  products?: { product_id: string; quantity: number }[];
  total_amount: number;
  address_id: number;
  created_at: string;
}
export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

export interface Order {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  amount: number;
  action: 'Ship Now' | 'View';
}
export enum UserRole {
  Admin = 'admin',
  Vendor = 'vendor',
  Customer = 'customer'
}

export type Permission = 'read' | 'create' | 'delete' | 'update';
export interface RoleDefinition {
  can: Permission[];
}
export const role: Record<UserRole, RoleDefinition> = {
  [UserRole.Admin]: {
    can: ['read', 'create', 'delete', 'update']
  },
  [UserRole.Vendor]: {
    can: ['read', 'create', 'update']
  },
  [UserRole.Customer]: {
    can: ['read']
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

export interface VendorRegisterTypes {
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  store_owner_first_name: string | null;
  store_owner_last_name: string | null;
  company_domain: string | null;
  company_structure: string | null;
  category: string | null;
  country_code?: string | null;
  email: string | null;
  password: string | null;
  confirm_password: string | null;
}
export interface VendorRegisterFormData {
  vendor: VendorRegisterTypes;
  documents: File[] | undefined

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

export type ProductStatus = 'active' | 'inactive' | 'archived'; // Add other status strings here

export type ProductImageType = {
  id: string;
  image_url: string;
  alt_text?: string;
  imgType: string;
  is_primary: boolean;
  product_id: string;
};

export type ProductFeatureType = {
  key: string;
  value: string | boolean | number;
};

export type ProductType = {
  id: string;
  name: string;
  description: string;
  base_price: string;
  discount_percent: string;
  stock_quantity: number;
  has_variants: boolean;
  status: ProductStatus;
  category_id: string;
  company_id: string;
  vendor_id: string;
  features: ProductFeatureType[];
  images: ProductImageType[];
  variants?: VariantType[];
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
}export interface AuditLogEntryType {
  id: number;
  timestamp: string;
  actor: string;
  tenant: string;
  actionType: "Active" | "Inactive" | "Pending" | "Suspended";
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
export interface VendorApplicationType {
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

export interface User {
  id: string;
  profile_picture_url: string | null;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_number: string;
  user_status: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  role_id: string;
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
  user: User;
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
export type OptionType = { name: string; values: string };
export type VariantType = { attributes: Record<string, string>; sku: string; price: number; stock: number };
export type ProductFormValuesType = {
  productName: string;
  description: string;
  features: FeatureType[];
  attributes: OptionType[];
  basePrice: number;
  discountPercent: number;
  stocks: number;
  sku: string;
  has_variants: boolean;
  productMedia: File[];
  featureMedia: File[];
  category: string;
  status: string;
  taxProfile: string;
};

export interface SelectedPaymentMethodProps {
  method: string;
  selectedMethod: string;
  onSelect: (method: string) => void;
  onInputChange: (val: string) => void;
  isValid: boolean;
  value: string; // The UPI ID string
  description?: string; // Optional description
}
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
  discount_type: 'PERCENTAGE' | 'FLAT_AMOUNT';
  value: number;
  currency?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
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
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
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
}
export type OrderDetailType = {
  id: string;
  orderNumber: string;
  dateTime: string;
  customer: {
    name: string;
    location: string;
  };
  status: 'Pending' | 'Shipped' | 'Delivered';
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
  status: "In Stock" | "Low Stock" | "Out of Stock";
}
export interface VendorOrderType {
  orderId: string;
  customerName: string;
  status: "Pending" | "Shipped" | "Delivered";
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
