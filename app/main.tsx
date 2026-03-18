// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import NotFound from './not-found.tsx'
// import { Provider } from 'react-redux'
// import { store } from './store.ts'
// import { BrowserRouter, Route, Routes } from "react-router";
// import { ProtectedRoute } from '../components/common/ProtectedRoute.tsx'
// import { Login, VendorLogin, VendorRegister, CustomerRegister, CustomerLogin, DashBoard, VendorManagement, VendorForm, ApproveVendor, SupportTickets, AuditLog, Dashboard, Orders, Inventory, Products, ProductForm, ProductUpdateForm, Finances, Marketing, CustomerCare, Profile, Locations, BillingAndBanking, BusinessProfile, Security, Home, WishList, Checkout, Shopping, Product, Addresses, UserProfile, UserRole, Contact, AboutAs, CartList, OrderStatus, } from '../utils/constants.ts';
// import { AdminLayout } from './admin/AdminLayout.tsx'
// import { VendorLayout } from './vendor/VendorLayout.tsx'
// import { VendorSettingLayout } from './vendor/settings/VendorSettingLayout.tsx'
// import { ShopLayout } from './shop/ShopLayout.tsx'
// import { UserLayout } from './shop/customerProfile/UserLayout.tsx'
// import { Unauthorized } from './shop/customerProfile/Unauthorized.tsx'
// import { CustomersOrders } from './shop/customerProfile/CustomersOrders.tsx'
// import PasswordForm from './shop/customerProfile/PasswordForm.tsx'
// import { ProfileForm } from './shop/customerProfile/ProfileForm.tsx'
// import ScrollToTop from '../components/common/ScrollToTop.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <Provider store={store}>
//       <BrowserRouter>
//         <ScrollToTop />
//         <Routes>
//           <Route path='/404' element={<NotFound />} />
//           <Route path='/' element={<ShopLayout />} >
//             <Route index element={<Home />} />
//             <Route path='shopping' element={<Shopping />} />
//             <Route path='shopping/:id' element={<Product />} />
//             <Route path='*' element={<Unauthorized />} />
//             <Route path='contact' element={<Contact />} />
//             <Route path='about' element={<AboutAs />} />
//             <Route path='customerProfile/:userId' element={<UserLayout />} >
//               <Route index element={<UserProfile />} />
//               <Route path='addresses' element={<Addresses />} />
//               <Route path='wishlist' element={< WishList />} />
//               <Route path='cart' element={< CartList />} />
//               <Route path='orders' element={<CustomersOrders />} />
//               <Route path='editProfile' element={<ProfileForm />} />
//               <Route path='changePassword' element={<PasswordForm />} />
//               <Route path='checkout/:id' >
//                 <Route index element={<Checkout />} />
//                 <Route path='orderStatus' element={<OrderStatus />} />
//               </Route>
//             </Route>
//           </Route>
//           <Route path='auth'>
//             <Route path="*" element={<NotFound />} />
//             <Route path="adminLogin" element={<Login />} />
//             <Route path="vendorLogin" element={<VendorLogin />} />
//             <Route path="vendorRegister" element={<VendorRegister />} />
//             <Route path="customerRegister" element={<CustomerRegister />} />
//             <Route path="customerLogin" element={<CustomerLogin />} />
//           </Route>
//           <Route path='admin' element={<AdminLayout />} >
//             <Route path="*" element={<NotFound />} />
//             <Route index element={<DashBoard />} />
//             <Route path='vendorManagement' >
//               <Route index element={<VendorManagement />} />
//               <Route path="vendorForm" element={<VendorForm />} />
//               <Route path="approveVendors" element={<ApproveVendor />} />
//             </Route>
//             <Route path="supportTickets" element={<SupportTickets />} />
//             <Route path="auditLog" element={<AuditLog />} />
//           </Route>
//           <Route path='vendor' element={<ProtectedRoute allowedRoles={[UserRole.Vendor]}><VendorLayout /></ProtectedRoute>} >
//             <Route index element={<Dashboard />} />
//             <Route path='products'   >
//               <Route index element={<Products />} />
//               <Route path='productForm' element={<ProductForm />} />
//               <Route path='productUpdateForm/:id' element={<ProductUpdateForm />} />
//             </Route>
//             <Route path='orders' element={<Orders />} />
//             <Route path='inventory' element={<Inventory />} />
//             <Route path='finances' element={<Finances />} />
//             <Route path='marketing' element={<Marketing />} />
//             <Route path='customerCare' element={<CustomerCare />} />
//             <Route path='settings' element={<VendorSettingLayout />}>
//               <Route index element={<Profile />} />
//               <Route path='locations' element={<Locations />} />
//               <Route path='security' element={<Security />} />
//               <Route path='businessProfile' element={<BusinessProfile />} />
//               <Route path='billing' element={<BillingAndBanking />} />
//             </Route>
//           </Route>
//         </Routes>

//       </BrowserRouter>
//     </Provider>
//   </StrictMode>,
// )
