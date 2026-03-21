export interface UserProfile {
  // Core User Data (from 'users' table)
  user_id: number;
  company_id: number;
  user_role_id: number;
  name: string;
  email: string;
  phone: string;
  profileImgUrl: string;
  user_status: 'active' | 'suspended' | 'pending';
  created_at: string;

  // Linked Addresses (from 'addresses' table)
  addresses: Address[];

  // Active Shopping State
  cart: Cart | null;
  wishlist: Wishlist | null;

  // History
  orders: UserOrder[];
}

// Supporting Interfaces based on your schema
export interface Address {
  address_id: number;
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
  cart_id: number;
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
  store_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  store_owner_first_name: string;
  store_owner_last_name: string;
  category: string;
  country_code?: string;
  email: string;
  password: string;
  confirm_password: string;
  document?: [{
    document_type: VendorDocumentType;
    document: string;
  }];
}

export enum VendorDocumentType {
  BusinessRegistration = 'business_registration',
  FinancialStatements = 'financial_statements',
  InsuranceCoverage = 'insurance_coverage',
  ComplianceCertifications = 'compliance_certifications',
  SecurityDocumentation = 'security_documentation',
  ContractAgreements = 'contract_agreements',
  VendorInformation = 'vendor_information',
  BusinessContinuityPlan = 'business_continuity_plan',
}
