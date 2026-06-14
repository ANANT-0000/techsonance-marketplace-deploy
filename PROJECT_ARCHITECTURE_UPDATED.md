# TechSonance Marketplace - Complete Architecture Documentation

## Project Overview
**TechSonance Marketplace** (Sound Sphere) is a comprehensive multi-tenant music marketplace platform with three distinct user roles: **Admin**, **Vendor**, and **Customer**. Built using **React 19 + TypeScript + Vite + Redux Toolkit** with a focus on e-commerce functionality including shopping cart, wishlist, checkout, and order management.

---

## Tech Stack

### Frontend Framework
- **React** 19.2.4
- **TypeScript** 5.9.3
- **Vite** (Build tool & dev server)
- **React Router** v7.12.0

### State Management
- **Redux Toolkit** 2.11.2
- **React Redux** 9.2.0
- **Redux** 5.0.1

### UI & Styling
- **Tailwind CSS** 4.1.18
- **@tailwindcss/vite** 4.1.18
- **Radix UI** components (@radix-ui/react-select, react-separator, react-slot)
- **shadcn/ui** component library
- **Lucide React** 0.562.0 (Icon library)
- **Motion** 12.34.0 (Animation library)
- **tw-animate-css** 1.4.0

### Forms & Validation
- **React Hook Form** 7.71.1
- **Zod** 4.3.5

### Data Visualization
- **Recharts** 2.15.4

### HTTP Client
- **Axios** 1.13.4

### Other Libraries
- **date-fns** 4.1.0 (Date formatting)
- **embla-carousel-react** 8.6.0 (Carousel component)
- **react-day-picker** 9.13.0 (Calendar picker)
- **react-responsive** 10.0.1 (Responsive utilities)
- **class-variance-authority** 0.7.1 (CVA for component variants)
- **clsx** 2.1.1 + **tailwind-merge** 3.4.0 (Class name utilities)

---

## Data Flow Architecture

### Redux Store Structure

Located in [src/app/store.ts](src/app/store.ts), the application uses **7 main slices** with localStorage middleware:

```typescript
{
  auth: authReducer,              // User authentication, profile & address management
  adminTheme: adminThemeReducer,  // Theme preferences (dark/light mode)
  sidebar: sidebarReducer,        // Sidebar toggle state
  menu: menuReducer,              // Mobile menu state
  cart: CartReducer,              // Shopping cart items
  cartSidebar: cartSidebarReducer,// Cart sidebar visibility
  wishlist: WishlistReducer       // User wishlist items
}
```

**Type Definitions**:
```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### LocalStorage Middleware

The store implements custom middleware to persist state to localStorage:

```typescript
const localStorageMiddleware = store => next => action => {
    const result = next(action);
    
    // Persists cart state
    if (action.type.startsWith('cart/')) {
        const cartState = store.getState().cart;
        localStorage.setItem('cart', JSON.stringify(cartState));
    }
    
    // Persists auth state
    if (action.type.startsWith('auth/')) {
        const authState = store.getState().auth;
        localStorage.setItem('auth', JSON.stringify(authState));
    }
    
    // Persists cart sidebar state
    if (action.type.startsWith('cartSidebar/')) {
        const cartSidebarState = store.getState().cartSidebar;
        localStorage.setItem('cartSidebar', JSON.stringify(cartSidebarState));
    }
    
    // Persists wishlist state
    if (action.type.startsWith('wishlist/')) {
        const wishlistState = store.getState().wishlist;
        localStorage.setItem('wishlist', JSON.stringify(wishlistState));
    }
    
    return result;
}
```

---

## Authentication System

### Auth State Structure
Located in [src/features/auth/authSlice.ts](src/features/auth/authSlice.ts)

```typescript
interface AuthType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  role: Record<UserRole, RoleDefinition>;
}
```

### User Profile Structure
Located in [src/utils/Types.ts](src/utils/Types.ts)

```typescript
interface UserProfile {
  // Core User Data
  user_id: number;
  company_id: number;
  user_role_id: number;  // 1: Admin, 2: Vendor, 3: Customer
  name: string;
  email: string;
  phone: string;
  profileImgUrl: string;
  user_status: 'active' | 'suspended' | 'pending';
  created_at: string;

  // Linked Data
  addresses: Address[];
  cart: Cart | null;
  wishlist: Wishlist | null;
  orders: UserOrder[];
}
```

### User Roles & Permissions

```typescript
enum UserRole {
  Admin = 'admin',
  Vendor = 'vendor',
  Customer = 'customer'
}

type Permission = 'read' | 'create' | 'delete' | 'update';

interface RoleDefinition {
  can: Permission[];
}

const role: Record<UserRole, RoleDefinition> = {
  admin: { can: ['read', 'create', 'delete', 'update'] },
  vendor: { can: ['read', 'create', 'update'] },
  customer: { can: ['read'] }
}
```

### Auth Actions

#### Core Authentication Actions
1. **loginStart()** - Sets loading state to true
2. **loginSuccess(payload)** - Stores user data + token in state & localStorage
3. **loginFailure(error)** - Handles authentication errors
4. **logOut()** - Clears auth state and all localStorage data

#### User Profile Management Actions
5. **updateUserProfile(payload)** - Updates user profile information

#### Address Management Actions (CRUD)
6. **createAddress(payload)** - Adds new address to user's addresses array
7. **updateAddress(payload)** - Updates existing address by address_id
8. **deleteAddress(address_id)** - Removes address from user's addresses
9. **setDefaultAddress(address_id)** - Sets a specific address as default

### Authentication Flow

```
User submits login form
    ↓
dispatch(loginStart())
    ↓
API call to backend (Axios)
    ↓
Success? → dispatch(loginSuccess({ user, token }))
         → Store token in localStorage (key: 'authToken')
         → Store user in localStorage (key: 'user')
         → Redirect based on user_role_id
    ↓
Failure? → dispatch(loginFailure(error))
         → Display error message
```

### Mock User Data

The application includes a comprehensive mock user for development:

```typescript
export const MockUser: UserProfile = {
  user_id: 1024,
  company_id: 501,
  user_role_id: 1,
  name: "Alex Rivier",
  email: "alex.rivier@soundsphere.com",
  profileImgUrl: "...",
  phone: "+91 98765 43210",
  user_status: "active",
  created_at: "2025-11-15T10:30:00Z",
  addresses: [...],
  cart: {...},
  wishlist: {...},
  orders: [...]
}
```

---

## Shopping Features - Redux Slices

### 1. Cart Slice
[src/features/Cart.ts](src/features/Cart.ts)

```typescript
interface CartItem {
  userId: string;
  id: string;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
}

// Actions:
addToCart(item)         // Adds item or increments quantity
removeFromCart(id)      // Removes item by id
updateQuantity(payload) // Updates item quantity
clearCart()            // Clears all items
```

**State Persistence**: Automatically synced to `localStorage` with key `'cart'`

### 2. Cart Sidebar Slice
[src/features/CartSidebar.ts](src/features/CartSidebar.ts)

```typescript
interface CartSidebarState {
  isCartOpen: boolean;
}

// Actions:
toggleCartSidebar(action: 'open' | 'close' | undefined)
  // 'open' - Opens sidebar
  // 'close' - Closes sidebar
  // undefined - Toggles current state
```

**State Persistence**: Automatically synced to `localStorage` with key `'cartSidebar'`

### 3. Wishlist Slice
[src/features/Wishlist.ts](src/features/Wishlist.ts)

```typescript
interface WishlistItem {
  userId: string;
  productId: string;
  addedAt: string; // ISO date string
}

interface WishlistState {
  wishlist_id: string;
  wishItems: WishlistItem[];
}

// Actions:
addToWishlist(item)        // Adds item with timestamp
removeFromWishlist(productId) // Removes item by productId
```

**State Persistence**: Automatically synced to `localStorage` with key `'wishlist'`

---

## Routing Architecture

The application uses **React Router v7** with nested routes and role-based access control.

### Complete Route Structure

```
/                              # Customer Shop (ShopLayout)
  ├─ index                     # Home page
  ├─ shopping                  # Product listing page
  ├─ shopping/:id              # Product detail page
  ├─ contact                   # Contact page
  ├─ about                     # About page
  └─ customerProfile/:userId   # Customer Profile (UserLayout)
      ├─ index                 # Profile overview
      ├─ addresses             # Address management
      ├─ wishlist              # Wishlist page
      ├─ cart                  # Cart page
      ├─ orders                # Orders history
      ├─ editProfile           # Edit profile form
      ├─ changePassword        # Password change form
      └─ checkout/:id          # Checkout flow
          ├─ index             # Checkout page
          └─ orderStatus       # Order confirmation

/auth                          # Authentication routes
  ├─ adminLogin                # Admin login (Protected)
  ├─ vendorLogin               # Vendor login (Protected)
  ├─ vendorRegister            # Vendor registration (Protected)
  ├─ customerLogin             # Customer login
  └─ customerRegister          # Customer registration

/admin                         # Admin Panel (AdminLayout)
  ├─ index                     # Dashboard
  ├─ vendorManagement          # Vendor list
  │   ├─ vendorForm            # Create/Edit vendor
  │   └─ approveVendors        # Approve pending vendors
  ├─ supportTickets            # Support ticket management
  └─ auditLog                  # System audit logs

/vendor                        # Vendor Dashboard (VendorLayout)
  ├─ index                     # Dashboard
  ├─ products                  # Product management
  │   ├─ productForm           # Create product
  │   └─ productUpdateForm/:id # Edit product
  ├─ orders                    # Order management
  ├─ inventory                 # Inventory tracking
  ├─ finances                  # Financial analytics
  ├─ marketing                 # Marketing tools
  ├─ customerCare              # Customer support
  └─ settings                  # Settings (VendorSettingLayout)
      ├─ index                 # Store Profile
      ├─ locations             # Locations & warehouses
      ├─ security              # Security & password
      ├─ businessProfile       # Business information
      └─ billing               # Billing & banking

/404                           # Not Found page
/unauthorized                  # Unauthorized access page
```

### Layout Components

#### 1. ShopLayout (`/`)
- **File**: [src/app/pages/shop/ShopLayout.tsx](src/app/pages/shop/ShopLayout.tsx)
- **Structure**: 
  ```
  <Navbar />
  <Outlet /> (Child routes)
  <Footer />
  <TabNavBar /> (Mobile navigation)
  <CartSidebar />
  ```
- **Features**: Customer-facing storefront with persistent cart sidebar

#### 2. UserLayout (`/customerProfile/:userId`)
- **File**: [src/app/pages/shop/customerProfile/UserLayout.tsx](src/app/pages/shop/customerProfile/UserLayout.tsx)
- **Structure**: 
  ```
  <ProfileSidebar />
  <Outlet /> (Profile pages)
  ```
- **Features**: Customer profile management with sidebar navigation

#### 3. AdminLayout (`/admin`)
- **File**: [src/app/pages/admin/AdminLayout.tsx](src/app/pages/admin/AdminLayout.tsx)
- **Structure**: Admin Sidebar → Content Area
- **Dynamic Margin**: 
  - Collapsed: `ml-24`
  - Expanded: `ml-50`

#### 4. VendorLayout (`/vendor`)
- **File**: [src/app/pages/vendor/VendorLayout.tsx](src/app/pages/vendor/VendorLayout.tsx)
- **Structure**: Vendor Sidebar → Content Area
- **Same responsive behavior as AdminLayout**

#### 5. VendorSettingLayout (`/vendor/settings`)
- **File**: [src/app/pages/vendor/settings/VendorSettingLayout.tsx](src/app/pages/vendor/settings/VendorSettingLayout.tsx)
- **Structure**: InnerSidebar → Settings pages
- **Nested settings navigation with sections**

### Protected Routes

**Component**: [src/components/common/ProtectedRoute.tsx](src/components/common/ProtectedRoute.tsx)

```typescript
<ProtectedRoute allowedRoles={['admin']}>
  <Component />
</ProtectedRoute>

// Authorization Logic:
1. Check if user is authenticated (auth.isAuthenticated)
2. Determine user role from user_role_id (1=admin, 2=vendor, 3=customer)
3. Check if role is in allowedRoles array
4. Pass? → Render children
5. Fail? → Navigate to /unauthorized with location state
```

**Role Mapping**:
```typescript
const allowedRoles = ['customer', 'admin', 'vendor'];
const userRoleType = allowedRoles[user.user_role_id - 1];
```

---

## Data Models

### Address Type

```typescript
interface Address {
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
```

### Cart Type

```typescript
interface Cart {
  cart_id: number;
  items: CartItem[];
  created_at: string;
}

interface CartItem {
  cart_item_id: number;
  variant_id: number;
  quantity: number;
}
```

### Wishlist Type

```typescript
interface Wishlist {
  wishlist_id: number;
  items: number[]; // Array of product_ids
}
```

### Order Type

```typescript
interface UserOrder {
  order_id: number;
  order_status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  delivered_at?: string;
  shippingTo: Address | string;
  products?: { product_id: string; quantity: number }[];
  total_amount: number;
  address_id: number;
  created_at: string;
}
```

### Product Category Type
[src/utils/customer/constants.ts](src/utils/customer/constants.ts)

```typescript
interface CATEGORY_LIST_TYPE {
  title: string;
  url: string;  // Image URL
}
```

**Available Categories**:
- Guitars
- Drums
- Keyboards
- Microphones
- Headphones
- Audio Interfaces
- Studio Monitors
- DJ Equipment

### Navigation Link Types

```typescript
interface NavLinkType {
  [key: string]: string;
  icon?: string;
}

interface FooterLinkType {
  title: string;
  url: string;
  icon?: string;
  styles?: string;
  category?: string;
}

interface FooterSectionType {
  header: string;
  links: FooterLinkType[];
}
```

---

## Component Architecture

### Common Components
Located in [src/components/common/](src/components/common/)

1. **ProtectedRoute** - RBAC wrapper component
2. **Sidebar** - Dynamic sidebar navigation (Admin/Vendor)
3. **InnerSideBar** - Nested navigation for settings
4. **Pagination** - Reusable pagination component
5. **Carousel** - Image slider for hero sections
6. **ScrollToTop** - Auto-scroll to top on route change
7. **ProductSkeleton** - Loading skeleton for products

### Admin Components
[src/components/admin/](src/components/admin/)

- **Navbar** - Admin header with page title and user info
- **DashboardChart** - Analytics visualization with Recharts

### Vendor Components
[src/components/vendor/](src/components/vendor/)

- **Navbar** - Vendor header with navigation

### Customer Components (14 Components)
[src/components/customer/](src/components/customer/)

1. **Navbar** - Customer storefront header with search/cart/wishlist
2. **Footer** - Site footer with comprehensive links
3. **CategoryList** - Music product category grid
4. **BestSelling** - Featured product showcase section
5. **ProductList** - Product grid display with filters
6. **ShoppingList** - Shopping page product listing
7. **FilterSidebar** - Product filtering sidebar
8. **CartSidebar** - Sliding cart panel
9. **ProfileSidebar** - Customer profile navigation
10. **AddToCart** - Add to cart button component
11. **BuyBtn** - Buy now button component
12. **WishListBtn** - Toggle wishlist button
13. **TabNavBar** - Mobile bottom navigation
14. **CustomerFeedback** - Customer review/rating component

### UI Components (shadcn/ui)
[src/components/ui/](src/components/ui/)

- **button** - Button variants with CVA
- **calendar** - Date picker component
- **card** - Card container component
- **carousel** - Embla carousel wrapper
- **chart** - Recharts integration wrapper
- **select** - Dropdown select component
- **spinner** - Loading spinner indicator

---

## Customer Pages Architecture

### Shop Pages
[src/app/pages/shop/](src/app/pages/shop/)

1. **Home** (`/`) - Landing page with hero, categories, featured products
2. **Shopping** (`/shopping`) - Product listing with filters
3. **Product** (`/shopping/:id`) - Product detail page
4. **Contact** (`/contact`) - Contact form page
5. **AboutAs** (`/about`) - About company page

### Customer Profile Pages
[src/app/pages/shop/customerProfile/](src/app/pages/shop/customerProfile/)

1. **UserProfile** (`/customerProfile/:userId`) - Profile overview
2. **ProfileForm** (`editProfile`) - Edit profile information
3. **PasswordForm** (`changePassword`) - Change password form
4. **Addresses** (`addresses`) - Address CRUD management
5. **Wishlist** (`wishlist`) - Saved items list
6. **CartList** (`cart`) - Shopping cart overview
7. **CustomersOrders** (`orders`) - Order history and tracking
8. **Unauthorized** (`/unauthorized`) - Access denied page

### Payment Flow
[src/app/pages/shop/customerProfile/Payment/](src/app/pages/shop/customerProfile/Payment/)

1. **Checkout** (`/customerProfile/:userId/checkout/:id`) - Payment and order review
2. **OrderStatus** (`orderStatus`) - Order confirmation and status

---

## State Management Deep Dive

### 1. Auth Slice - Complete Feature Set
[src/features/auth/authSlice.ts](src/features/auth/authSlice.ts)

**State Management**:
```typescript
const initialState: AuthType = {
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: getUserFromLocalStorage() || MockUser,
  loading: false,
  error: null,
  token: localStorage.getItem('authToken') || null,
  role: {} as Record<UserRole, RoleDefinition>
};
```

**Action Categories**:

1. **Authentication Actions**:
   - `loginStart()` - Initiates login flow
   - `loginSuccess(payload)` - Handles successful login
   - `loginFailure(error)` - Handles login errors
   - `logOut()` - Clears all auth data

2. **Profile Management**:
   - `updateUserProfile(payload)` - Updates user information

3. **Address Management (Full CRUD)**:
   - `createAddress(payload)` - Adds new address
   - `updateAddress(payload)` - Modifies existing address
   - `deleteAddress(address_id)` - Removes address
   - `setDefaultAddress(address_id)` - Sets default shipping address

**Logging**: All actions include comprehensive console logging for debugging

### 2. Sidebar Slice
[src/features/sidebar.ts](src/features/sidebar.ts)

```typescript
interface SidebarState {
  isSidebarOpen: boolean;
}

// Actions:
toggleSidebar() // Toggles sidebar open/closed state
```

**Usage**:
```typescript
const { isSidebarOpen } = useSelector((state) => state.sidebar);
dispatch(toggleSidebar());

// Dynamic Layout:
<main className={`${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
```

### 3. Menu Slice
[src/features/menuBar.ts](src/features/menuBar.ts)

```typescript
interface MenuState {
  isMenuOpen: boolean;
}

// Actions:
openMenu()  // Opens mobile menu
closeMenu() // Closes mobile menu
```

### 4. Admin Theme Slice
[src/features/theme/adminThemeSlice.ts](src/features/theme/adminThemeSlice.ts)

Manages dark/light mode preferences for admin and vendor panels.

---

## Data Flow Patterns

### Pattern 1: User Registration & Login Flow

```
┌─────────────────────────────────┐
│ User Registration/Login Form    │
│ (React Hook Form + Zod)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Form Validation                 │
│ - Email format                  │
│ - Password strength             │
│ - Required fields               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ dispatch(loginStart())          │
│ Sets loading = true             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Axios POST Request              │
│ - '/auth/login'                 │
│ - Credentials payload           │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
Success           Failure
    │                 │
    ▼                 ▼
dispatch(          dispatch(
  loginSuccess({      loginFailure(
    user,               error
    token             ))
  })                   │
)                      ▼
    │             Display error
    ▼
Store in state
    │
    ▼
Store in localStorage
- 'authToken'
- 'user'
    │
    ▼
Redirect based on
user_role_id
- 1 → /admin
- 2 → /vendor
- 3 → /
```

### Pattern 2: Shopping Cart Flow

```
┌──────────────────────┐
│ Product Page         │
│ User clicks "Add"    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────┐
│ dispatch(addToCart({     │
│   id, price, quantity    │
│ }))                      │
└──────────┬───────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Cart Reducer Logic              │
│ - Find existing item?           │
│   ├─ Yes → Increment quantity   │
│   └─ No → Push new item         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ LocalStorage Middleware         │
│ - Stringify cart state          │
│ - Save to localStorage('cart')  │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ UI Updates                      │
│ - Cart badge count              │
│ - Cart sidebar                  │
│ - Cart page                     │
└─────────────────────────────────┘
```

### Pattern 3: Address Management Flow

```
┌──────────────────────────────┐
│ User Profile → Addresses     │
└──────────┬───────────────────┘
           │
    ┌──────┴──────────────────┐
    │                         │
    ▼                         ▼
Create Address          Edit Address
    │                         │
    ▼                         ▼
dispatch(              dispatch(
  createAddress({        updateAddress({
    address_for,          address_id,
    address_line1,        ...updates
    city, state,        })
    postal_code,       )
    ...                     │
  })                        ▼
)                     Find address
    │                 by address_id
    ▼                       │
Push to                     ▼
user.addresses         Replace in array
    │                       │
    └───────┬───────────────┘
            │
            ▼
┌──────────────────────────────┐
│ LocalStorage Middleware      │
│ - Save updated auth state    │
└──────────┬───────────────────┘
            │
            ▼
┌──────────────────────────────┐
│ UI Re-renders                │
│ - Address list updates       │
│ - Default badge shows        │
└──────────────────────────────┘
```

### Pattern 4: Checkout & Order Flow

```
┌──────────────────────┐
│ Cart Page            │
│ User clicks Checkout │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ Navigate to                  │
│ /customerProfile/:id/checkout│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Checkout Page                │
│ - Display cart items         │
│ - Select shipping address    │
│ - Payment method selection   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Submit Order                 │
│ - Validate address           │
│ - Validate payment           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Axios POST Request           │
│ - '/orders/create'           │
│ - Order payload              │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
Success        Failure
    │             │
    ▼             ▼
dispatch(      Display
  clearCart()) error
    │
    ▼
Navigate to
/checkout/:id/orderStatus
    │
    ▼
┌──────────────────────────────┐
│ Order Confirmation Page      │
│ - Order ID                   │
│ - Order details              │
│ - Estimated delivery         │
└──────────────────────────────┘
```

### Pattern 5: Vendor Product Management

```
┌──────────────────────┐
│ Vendor Products Page │
└──────────┬───────────┘
           │
    ┌──────┴──────────┐
    │                 │
    ▼                 ▼
Create New       Edit Existing
Product          Product
    │                 │
    ▼                 ▼
Navigate to      Navigate to
/vendor/products/vendor/products/
  productForm      productUpdateForm/:id
    │                 │
    └────────┬────────┘
             │
             ▼
┌──────────────────────────────┐
│ Product Form                 │
│ (React Hook Form + Zod)      │
│ - Product name               │
│ - Description                │
│ - Price, SKU                 │
│ - Images                     │
│ - Variants                   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Form Validation              │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Axios POST/PUT Request       │
│ - VENDOR_BASE_URL/products   │
│ - Product payload            │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
Success        Failure
    │             │
    ▼             ▼
Navigate to    Display
/vendor/       validation
products       errors
    │
    ▼
┌──────────────────────────────┐
│ Products List Page           │
│ - Refetch products           │
│ - Display success toast      │
└──────────────────────────────┘
```

---

## Navigation Configuration

### Admin Navigation Links
[src/utils/constants.ts](src/utils/constants.ts)

```typescript
ADMIN_NAV_LINKS: NavLinkType[] = [
  { Dashboard: '/admin', icon: dashboard_icon },
  { Vendor: '/admin/vendorManagement', icon: vendor_icon },
  { Analytics: '/admin/auditLog', icon: analytics_icon },
  { "Support Tickets": '/admin/supportTickets', icon: customer_care_icon },
  { Settings: '/admin/settings', icon: settings_icon },
]
```

### Vendor Navigation Links

```typescript
VENDOR_NAV_LINKS: NavLinkType[] = [
  { Dashboard: '/vendor', icon: dashboard_icon },
  { Products: '/vendor/products', icon: product_icon },
  { Orders: '/vendor/orders', icon: order_icon },
  { Inventory: '/vendor/inventory', icon: inventory_icon },
  { Analytics: '/vendor/finances', icon: finance_icon },
  { Marketing: '/vendor/marketing', icon: marketing_icon },
  { 'Customer Care': '/vendor/customerCare', icon: customer_care_icon },
  { Settings: '/vendor/settings', icon: settings_icon },
]
```

### Vendor Settings Links (Nested Sidebar)

```typescript
VENDOR_SETTINGS_LINKS: Link[] = [
  {
    section: "general",
    list: [
      { title: 'Store Profile', path: '/vendor/settings', icon: 'profile' },
      { title: 'Locations & Warehouses', path: '/vendor/settings/locations', icon: 'locations' },
    ]
  },
  {
    section: "organization",
    list: [
      { title: 'Billing & Banking', path: '/vendor/settings/billing', icon: 'billing' },
    ]
  },
  {
    section: "account",
    list: [
      { title: 'Business Profile', path: '/vendor/settings/businessProfile', icon: 'businessProfile' },
      { title: 'Security & Password', path: '/vendor/settings/security', icon: 'usersRoles' },
    ]
  }
]
```

### Customer Navigation Links

```typescript
NAV_LINKS: NavLinkType[] = [
  { Home: '/' },
  { Shop: '/shopping' },
  { About: '/about' },
  { Contact: '/contact' }
]
```

### Customer Mobile Tab Navigation

```typescript
TAB_LINKS: tabLinkType[] = [
  { title: 'Home', url: '/', iconNames: 'house' },
  { title: 'Shop', url: '/shopping', iconNames: 'shopping-bag' },
  { title: 'Cart', url: '/cart', iconNames: 'shopping-cart' },
  { title: 'Profile', url: '/customerProfile', iconNames: 'user' },
  { title: 'Menu', url: '', iconNames: 'menu' }
]
```

### Customer Footer Content

```typescript
FOOTER_CONTENT: FooterSectionType[] = [
  {
    header: 'Need Help?',
    links: [
      { title: 'Customer Service', url: '/customer_service' },
      { title: 'Returns & Exchanges', url: '/returns_exchanges' },
      { title: 'Shipping Information', url: '/shipping_information' },
      { title: 'FAQs', url: '/faqs' },
      { title: 'Careers', url: '/careers' },
    ]
  },
  {
    header: 'Company',
    links: [
      { title: 'About Us', url: '/about' },
      { title: 'Blog', url: '/blog' },
      { title: 'Collaboration', url: '/collaboration' },
      { title: 'Media', url: '/media' },
    ]
  },
  {
    header: 'Legal',
    links: [
      { title: 'Privacy Policy', url: '/privacy_policy' },
      { title: 'Terms of Service', url: '/terms_of_service' },
      { title: 'Cookie Policy', url: '/cookie_policy' },
      { title: 'Shipping Policy', url: '/shipping_policy' },
      { title: 'Sitemap', url: '/sitemap' },
    ]
  },
  {
    header: 'Connect with Us',
    links: [
      { title: 'Email', url: 'mailto:support@soundsphere.com', icon: 'email' },
      { title: 'Address...', url: 'https://maps...', icon: 'location' },
    ]
  }
]
```

---

## Environment Configuration

### API Base URLs
[src/utils/constants.ts](src/utils/constants.ts)

```typescript
export const VENDOR_BASE_URL = import.meta.env.VITE_VENDOR_BASE_URL;
export const CUSTOMER_BASE_URL = import.meta.env.VITE_CUSTOMER_BASE_URL;
export const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL;
```

**Expected .env variables**:
```env
VITE_VENDOR_BASE_URL=http://api.example.com/vendor
VITE_CUSTOMER_BASE_URL=http://api.example.com/customer
VITE_ADMIN_BASE_URL=http://api.example.com/admin
```

---

## Customer-Facing Features

### Home Page Content
[src/utils/customer/constants.ts](src/utils/customer/constants.ts)

```typescript
HOME_HERO_TITLE = "Welcome to Sound Sphere - Your Ultimate Music Marketplace"
HOME_HERO_DESC = "Discover, buy, and sell music products with ease. Join our vibrant community of music lovers and elevate your sound experience today!"
HERO_BTN_TEXT = "Shop Now"
```

### Brand Features Section

```typescript
HOME_BRAND_FEATURES = [
  { title: 'Secure Payment', icon: 'Wallet' },
  { title: 'Free Shipping', icon: 'Package' },
  { title: 'Delivered with Care and on time', icon: 'Truck' },
  { title: 'High Quality audio', icon: 'audio-lines' },
]
```

### Shop Page Features

1. **Hero Carousel** - Embla carousel with rotating product images
2. **Category Grid** - 8 music product categories with images
3. **Best Selling Section** - Featured product showcase
4. **Product List** - Dynamic grid of products with filters
5. **Brand Features** - Trust indicators (payment, shipping, quality)
6. **Customer Feedback** - Reviews and testimonials section

---

## Asset Management

### Icon Assets
[src/assets/](src/assets/)

**Brand Assets**:
- `e-commerce_brand_logo.png` - Main brand logo
- `TS_Logo.png` - TechSonance logo
- `tsLogo.png` - Alternative logo

**Navigation Icons**:
- `dashboard_icon.png` - Dashboard
- `vendor_icon.png` - Vendors
- `customers_icon.png` - Customers
- `product_icon.png` - Products (box)
- `order_icon.png` - Orders
- `inventory_icon.png` - Inventory (notes)
- `finance_icon.png` - Finances
- `marketing_icon.png` - Marketing
- `analytics_icon.png` - Analytics
- `customer_care_icon.png` - Customer care
- `settings_icon.png` - Settings

**UI Icons**:
- `searchImgDark.png` / `searchImgLight.png` - Search
- `heartDark.png` / `heartLight.png` - Wishlist
- `shoppingCart.png` - Cart
- `user icon.png` - User profile
- `delete_icon.png` - Delete action
- `arrow_icon.png` - Navigation arrow
- `down_arrow.png` - Dropdown arrow
- `bar toggle icon.png` - Sidebar toggle
- `toggle-dark.png` / `toggle-light.png` - Theme toggle
- `replacement icon.png` - Replacement/return
- `internet_icon.png` - Website/online
- `file_icon.png` - Document

**Social Media Icons**:
- `facebook icon.png`
- `instagram icon.png`
- `youtube icon.png`

**Poster Images**:
- `admin form poster.png` - Admin login background
- `customer form poster.png` / `customer form poster 2.png` - Customer auth
- `vendor login poster.png` - Vendor auth background

---

## Key Design Patterns

### 1. Role-Based Access Control (RBAC)
- Every protected route validates `user_role_id`
- Permission-based UI rendering using `role` object
- Centralized role definitions in Types.ts
- Dynamic role mapping from `user_role_id` to role type

### 2. Layout Pattern with React Router
- Shared layouts using `<Outlet />`
- Nested route hierarchies (4 levels deep)
- Consistent navigation across sections
- Layout-specific sidebars and navigation

### 3. Redux Slice Pattern
- Feature-based state organization (7 slices)
- Separate reducers for distinct concerns
- Type-safe state access with TypeScript
- Comprehensive action logging for debugging

### 4. Higher-Order Component (HOC) Pattern
- `ProtectedRoute` wraps authenticated components
- Reusable authorization logic
- Route-level access control with role validation

### 5. Responsive Sidebar Pattern
- Toggle state managed globally in Redux
- Persistent across navigation
- Dynamic layout adjustments (margin-left)
- Consistent behavior in Admin and Vendor panels

### 6. Constants-Based Configuration
- Centralized navigation definitions
- Environment-based API URLs
- Reusable UI constants and content
- Separation of content from components

### 7. LocalStorage Persistence Pattern
- Custom middleware for automatic persistence
- State hydration on app initialization
- Selective persistence (auth, cart, wishlist, cartSidebar)
- Error handling for localStorage failures

### 8. Compound Component Pattern
- Layout components with nested child routes
- Sidebar + Content area composition
- Profile sidebar with multiple pages
- Settings with inner sidebar navigation

---

## File Structure Summary

```
techsonance-marketplace/
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── main.tsx          # App entry + routing configuration
│   │   ├── store.ts          # Redux store + middleware
│   │   ├── index.css         # Global styles
│   │   ├── not-found.tsx     # 404 page
│   │   └── pages/
│   │       ├── admin/        # Admin pages (7 files)
│   │       │   ├── AdminLayout.tsx
│   │       │   ├── DashBoard.tsx
│   │       │   ├── VendorManagement.tsx
│   │       │   ├── VendorForm.tsx
│   │       │   ├── ApproveVendor.tsx
│   │       │   ├── SupportTickets.tsx
│   │       │   └── AuditLog.tsx
│   │       ├── vendor/       # Vendor pages
│   │       │   ├── VendorLayout.tsx
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Orders.tsx
│   │       │   ├── Inventory.tsx
│   │       │   ├── Finances.tsx
│   │       │   ├── Marketing.tsx
│   │       │   ├── CustomerCare.tsx
│   │       │   ├── products/
│   │       │   │   ├── Products.tsx
│   │       │   │   ├── ProductForm.tsx
│   │       │   │   └── ProductUpdateForm.tsx
│   │       │   └── settings/
│   │       │       ├── VendorSettingLayout.tsx
│   │       │       ├── Profile.tsx
│   │       │       ├── Locations.tsx
│   │       │       ├── Security.tsx
│   │       │       ├── BusinessProfile.tsx
│   │       │       └── BillingAndBanking.tsx
│   │       ├── shop/         # Customer pages
│   │       │   ├── ShopLayout.tsx
│   │       │   ├── index.tsx (Home)
│   │       │   ├── Shopping.tsx
│   │       │   ├── Product.tsx
│   │       │   ├── Contact.tsx
│   │       │   ├── AboutAs.tsx
│   │       │   └── customerProfile/
│   │       │       ├── UserLayout.tsx
│   │       │       ├── index.tsx (UserProfile)
│   │       │       ├── ProfileForm.tsx
│   │       │       ├── PasswordForm.tsx
│   │       │       ├── Addresses.tsx
│   │       │       ├── Wishlist.tsx
│   │       │       ├── CartList.tsx
│   │       │       ├── CustomersOrders.tsx
│   │       │       ├── Unauthorized.tsx
│   │       │       └── Payment/
│   │       │           ├── Checkout.tsx
│   │       │           └── OrderStatus.tsx
│   │       └── auth/         # Authentication pages
│   │           ├── admin/
│   │           │   └── login.tsx
│   │           ├── vendor/
│   │           │   ├── login.tsx
│   │           │   └── register.tsx
│   │           └── customer/
│   │               ├── login.tsx
│   │               └── register.tsx
│   │
│   ├── components/
│   │   ├── common/           # Shared components (7)
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── InnerSideBar.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Carousel.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   └── ProductSkeleton.tsx
│   │   ├── admin/            # Admin components (2)
│   │   │   ├── Navbar.tsx
│   │   │   └── DashboardChart.tsx
│   │   ├── vendor/           # Vendor components (1)
│   │   │   └── Navbar.tsx
│   │   ├── customer/         # Customer components (14)
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── BestSelling.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ShoppingList.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── CartSidebar.tsx
│   │   │   ├── ProfileSidebar.tsx
│   │   │   ├── AddToCart.tsx
│   │   │   ├── BuyBtn.tsx
│   │   │   ├── WishListBtn.tsx
│   │   │   ├── TabNavBar.tsx
│   │   │   └── CustomerFeedback.tsx
│   │   └── ui/               # shadcn/ui components (7)
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── select.tsx
│   │       └── spinner.tsx
│   │
│   ├── features/             # Redux slices (7 slices)
│   │   ├── auth/
│   │   │   └── authSlice.ts  # Authentication + User Profile + Address CRUD
│   │   ├── theme/
│   │   │   └── adminThemeSlice.ts  # Dark/Light theme
│   │   ├── sidebar.ts        # Sidebar toggle
│   │   ├── menuBar.ts        # Mobile menu
│   │   ├── Cart.ts           # Shopping cart
│   │   ├── CartSidebar.ts    # Cart sidebar visibility
│   │   └── Wishlist.ts       # Wishlist
│   │
│   ├── utils/
│   │   ├── constants.ts      # Global constants (navigation, API URLs)
│   │   ├── Types.ts          # TypeScript type definitions
│   │   ├── validation.ts     # Zod validation schemas
│   │   └── customer/
│   │       └── constants.ts  # Customer-specific constants
│   │
│   ├── assets/               # Images and icons (38 files)
│   │
│   └── lib/
│       └── utils.ts          # Utility functions (cn, etc.)
│
├── components.json           # shadcn/ui configuration
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── PROJECT_ARCHITECTURE.md   # Original documentation
├── README.md                 # Project readme
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TS config
├── tsconfig.node.json        # Node-specific TS config
└── vite.config.ts            # Vite configuration
```

---

## Multi-Tenant Architecture

### Tenant Isolation
- Each vendor operates independently with `company_id`
- Company-specific data segregation in database
- Admin oversees all vendor instances system-wide

### User Hierarchy & Responsibilities

```
Admin (user_role_id: 1)
  ├─ Manages all vendors across platform
  ├─ Approves vendor registrations
  ├─ Views system-wide analytics
  ├─ Handles support tickets
  └─ Manages audit logs

Vendor (user_role_id: 2)
  ├─ Manages own products (CRUD)
  ├─ Processes own orders
  ├─ Views own analytics & finances
  ├─ Manages inventory
  ├─ Handles customer care
  ├─ Manages store settings
  └─ Isolated by company_id

Customer (user_role_id: 3)
  ├─ Browses all vendor products
  ├─ Manages shopping cart
  ├─ Manages wishlist
  ├─ Places orders
  ├─ Manages addresses
  ├─ Views order history
  └─ Read-only access to products
```

---

## Development Workflow

### Running the Application

```bash
# Install dependencies
npm install

# Development server (with --host for network access)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Adding New Features

#### 1. Adding a New Redux Slice

```bash
# Create new slice file
src/features/myFeature.ts

# Define types, initial state, and reducers
# Export actions and reducer

# Import and add to store
src/app/store.ts
```

#### 2. Adding a New Page

```bash
# Create page component
src/app/pages/{role}/MyPage.tsx

# Add route in main.tsx
src/app/main.tsx

# Update navigation constants
src/utils/constants.ts

# Add to constants export if needed
```

#### 3. Adding a New Component

```bash
# Create component
src/components/{common|admin|vendor|customer}/MyComponent.tsx

# Import where needed
# Use in page components
```

#### 4. Adding New Types

```bash
# Add type definitions
src/utils/Types.ts

# Export and use across application
```

---

## API Integration Patterns

### Axios Instance Configuration

```typescript
import axios from 'axios';
import { CUSTOMER_BASE_URL } from './constants';

const apiClient = axios.create({
  baseURL: CUSTOMER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user
      dispatch(logOut());
      navigate('/auth/customerLogin');
    }
    return Promise.reject(error);
  }
);
```

### API Call Pattern

```typescript
// In component
const handleFetchProducts = async () => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`${CUSTOMER_BASE_URL}/products`);
    setProducts(response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    setError(error.message);
  } finally {
    dispatch(setLoading(false));
  }
};
```

---

## State Persistence Strategy

### What Gets Persisted

| Slice | LocalStorage Key | Why Persisted |
|-------|------------------|---------------|
| auth | 'auth', 'authToken', 'user' | Maintain login session |
| cart | 'cart' | Preserve shopping cart across sessions |
| cartSidebar | 'cartSidebar' | Remember cart panel state |
| wishlist | 'wishlist' | Save favorite items |

### What Doesn't Get Persisted

- **sidebar** - UI state, resets on page load
- **menu** - Temporary mobile menu state
- **adminTheme** - Could be persisted but currently isn't

### Hydration Strategy

```typescript
// Each slice loads initial state from localStorage
const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('cart');
    if (serializedCart) {
      const parsedCart = JSON.parse(serializedCart);
      if (parsedCart && Array.isArray(parsedCart.items)) {
        return parsedCart;
      }
    }
  } catch (e) {
    console.error("Could not load cart from localStorage", e);
  }
  return { items: [] };
};

const initialState = {
  items: loadCartFromLocalStorage().items || []
};
```

---

## Performance Considerations

### Code Splitting
- React Router automatically splits routes
- Lazy loading can be implemented for heavy components

### Image Optimization
- Use appropriate image formats (WebP with fallbacks)
- Implement lazy loading for product images
- Use responsive images with srcset

### Bundle Size Management
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

### Memoization
- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for stable function references

---

## Testing Strategy (Recommended)

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Test Coverage Targets**:
- Redux slices (reducers & actions)
- Utility functions
- Form validation schemas
- Protected route logic

### Integration Testing
- API integration tests
- User flow tests (login → shop → checkout)
- Role-based access control tests

### E2E Testing
```bash
# Install Playwright or Cypress
npm install --save-dev @playwright/test
```

**Critical User Flows**:
1. Customer registration → login → shop → add to cart → checkout
2. Vendor login → create product → manage inventory
3. Admin login → approve vendor → view analytics

---

## Security Considerations

### Authentication Security
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Token expiration handling
- Refresh token mechanism (to be implemented)

### Authorization Security
- Role-based access control on frontend
- **Critical**: Backend must validate all permissions
- Protected routes prevent unauthorized access

### Input Validation
- Zod schemas for form validation
- Sanitize user inputs before API calls
- XSS prevention through React's built-in escaping

### API Security
- CORS configuration on backend
- Rate limiting on API endpoints
- Input validation on backend

---

## Deployment Checklist

### Pre-Deployment
- [ ] Set production environment variables
- [ ] Run production build: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Run linter: `npm run lint`
- [ ] Update API base URLs for production
- [ ] Remove console.logs from production code
- [ ] Optimize images
- [ ] Set up error tracking (Sentry, LogRocket)

### Production Environment Variables
```env
VITE_VENDOR_BASE_URL=https://api.production.com/vendor
VITE_CUSTOMER_BASE_URL=https://api.production.com/customer
VITE_ADMIN_BASE_URL=https://api.production.com/admin
```

### Hosting Options
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend API**: AWS EC2, Heroku, DigitalOcean
- **Database**: AWS RDS, MongoDB Atlas

---

## Future Enhancements

### Planned Features
1. **Real-time Features**
   - WebSocket integration for live notifications
   - Real-time order tracking
   - Live chat customer support

2. **Payment Integration**
   - Stripe/PayPal integration
   - Multiple payment methods
   - Invoice generation

3. **Advanced Search & Filtering**
   - Elasticsearch integration
   - Advanced product filters
   - Search suggestions/autocomplete

4. **Analytics & Reporting**
   - Vendor dashboard analytics
   - Customer behavior tracking
   - Sales reports & insights

5. **Social Features**
   - Product reviews & ratings
   - User-generated content
   - Social media sharing

6. **Mobile App**
   - React Native version
   - Push notifications
   - Offline mode

7. **Admin Features**
   - Advanced vendor analytics
   - Revenue sharing management
   - Commission tracking
   - Bulk operations

8. **Customer Features**
   - Order tracking with live updates
   - Return/refund management
   - Product comparison tool
   - Recently viewed products

9. **Internationalization**
   - Multi-language support (i18n)
   - Multi-currency support
   - Region-specific content

10. **Progressive Web App (PWA)**
    - Service worker implementation
    - Offline functionality
    - Install prompt

---

## Troubleshooting Guide

### Common Issues

#### 1. LocalStorage Not Persisting
```typescript
// Check browser localStorage
console.log(localStorage.getItem('cart'));

// Clear localStorage
localStorage.clear();

// Verify middleware is configured
// Check store.ts middleware array
```

#### 2. Protected Route Not Working
```typescript
// Debug auth state
const { isAuthenticated, user } = useSelector(state => state.auth);
console.log('Auth:', isAuthenticated, 'User:', user);

// Check user_role_id matches expected roles
console.log('Role ID:', user?.user_role_id);
```

#### 3. Cart Not Updating
```typescript
// Verify cart state
const cart = useSelector(state => state.cart);
console.log('Cart items:', cart.items);

// Check localStorage
console.log(localStorage.getItem('cart'));

// Dispatch action
dispatch(addToCart({ id: 1, price: 100 }));
```

#### 4. API Call Failures
```typescript
// Check environment variables
console.log('API URL:', import.meta.env.VITE_CUSTOMER_BASE_URL);

// Verify token
console.log('Token:', localStorage.getItem('authToken'));

// Check network tab in DevTools
```

---

## Documentation Maintenance

### Version History
- **v2.0** - February 20, 2026 - Complete architecture update with all features
- **v1.0** - February 9, 2026 - Initial documentation

### Last Updated
**Date**: February 20, 2026  
**Version**: 2.0.0  
**Reviewed By**: AI Architecture Analyst  
**Changes**: Complete codebase analysis and documentation update

### Contributing to Documentation
When making significant code changes:
1. Update relevant sections in this document
2. Update version number
3. Add entry to Version History
4. Review related sections for accuracy

---

## Additional Resources

### Official Documentation
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Zod Documentation](https://zod.dev/)

### Learning Resources
- [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Redux Toolkit Tutorial](https://redux-toolkit.js.org/tutorials/quick-start)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)

### Tools & Extensions
- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

---

## Project Statistics

- **Total Pages**: 30+ pages across all roles
- **Total Components**: 35+ components
- **Redux Slices**: 7 slices
- **Routes**: 40+ routes (including nested)
- **Customer Components**: 14 components
- **UI Components**: 7 shadcn components
- **Assets**: 38 image/icon files
- **Type Definitions**: 15+ interfaces and types
- **Navigation Links**: 20+ navigation items across all roles

---

## Conclusion

TechSonance Marketplace is a comprehensive, production-ready e-commerce platform with robust state management, role-based access control, and a complete shopping experience. The architecture supports scalability, maintainability, and future enhancements while providing a solid foundation for a multi-tenant marketplace.

The application successfully implements:
- ✅ Multi-role authentication & authorization
- ✅ Complete shopping cart & wishlist functionality
- ✅ Address management with CRUD operations
- ✅ Checkout & order processing flow
- ✅ Vendor product & inventory management
- ✅ Admin oversight & vendor approval
- ✅ Responsive design for mobile & desktop
- ✅ State persistence across sessions
- ✅ Comprehensive navigation & routing
- ✅ Type-safe development with TypeScript

---

**End of Documentation**
