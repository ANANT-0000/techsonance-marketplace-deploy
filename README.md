# TechSonance Marketplace — Sound Sphere

A comprehensive **multi-tenant e-commerce marketplace** platform where customers can browse and purchase music products, vendors can manage their stores, and admins can oversee the entire platform — all from a single, beautifully crafted **Next.js** application.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.12-764ABC?logo=redux&logoColor=white)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features & Progress](#key-features--progress)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles & Routing (Proxy Fluidifier)](#user-roles--routing-proxy-fluidifier)
- [Flow & UX Fluidifiers](#flow--ux-fluidifiers)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The platform operates on a **multi-tenant architecture** where each vendor operates an isolated storefront under the Sound Sphere umbrella, managed centrally by platform administrators. Rather than jarring page reloads or redirects, the app utilizes Next.js App Router and optimized request proxy to provide a fluid, single-page application experience.

---

## Key Features & Progress

### 🛒 Customer Storefront & Checkout Flow

- **Product Browsing** — Browse by category, filter, and search across all vendor products.
- **Shopping Cart & Wishlist** — Persistent cart and wishlist synced to Redux state and `localStorage`.
- **Razorpay Overlay checkout** — A streamlined, overlay-based Razorpay integration allowing customers to pay directly within the portal without external redirects.
- **Order Tracking & Timeline** — Real-time tracking timeline displaying current shipping status, courier details, and AWB numbers.
- **Order Eligibility Guard** — Automated policies that guard item actions (e.g. cancellation, returns, replacement eligibility check) based on vendor configuration.
- **Responsive Design** — Mobile-first UI with dedicated bottom tab navigation.

### 🏪 Vendor Dashboard

- **Product & Dimension Management** — Full CRUD for product listings, including custom dimensions, pricing, and variants.
- **Order Processing & Shipping** — View orders and manage courier integration.
- **Financial Analytics** — Revenue insights and financial metrics via Recharts.
- **Store Settings** — Manage store location/warehouses, business profiles, and secure billing setups.

### 🛡️ Admin Panel

- **Vendor Management & Onboarding** — Centralized panel to review and approve/reject new vendor requests.
- **Support Tickets & System Logs** — Handle customer/vendor ticket resolutions and monitor system audits.
- **Theme Customization** — Sleek light/dark mode support.

---

## Tech Stack

| Category                  | Technologies                                           |
| ------------------------- | ------------------------------------------------------ |
| **Framework**             | Next.js 16.2 (App Router) · React 19 · TypeScript 6.0  |
| **State Management**      | Redux Toolkit · React Redux                            |
| **Routing & Protection**  | Next.js Proxy & React Router-style Client Guards  |
| **Styling & UI**          | Tailwind CSS v4 · shadcn/ui · Radix UI · Framer Motion |
| **Forms & Validation**    | React Hook Form · Zod                                  |
| **Data Visualisation**    | Recharts                                               |
| **Utilities**             | Axios · date-fns · clsx · tailwind-merge               |
| **Performance Debugging** | React Scan (for tracking rendering bottlenecks)        |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/techsonance-infotech/techsonance-marketplace.git
cd techsonance-marketplace

# Install dependencies
npm install

# Create your environment file
cp  .env.local .env
# → Then fill in the API base URLs (see Environment Variables below)

# Start the Next.js development server
npm run dev
```

The app will be available at **http://localhost:3000** (with custom hosts enabled via `-H 0.0.0.0` for network access).

---

## Project Structure

```
techsonance-marketplace/
├── app/                            # Next.js App Router root
│   ├── (storefront)/               # Customer-facing storefront
│   │   ├── customer/               # Profile, Cart, Checkout, Wishlist, Orders
│   │   │   └── orders/[orderId]/   # Order Details and Tracking Timeline
│   │   └── page.tsx                # Storefront Home Page
│   ├── admin/                      # Admin pages
│   ├── adminAuth/                  # Admin authentication portal
│   ├── auth/                       # Customer and Vendor login/register
│   ├── vendor/                     # Vendor dashboard and settings
│   ├── StoreProvider.tsx           # Redux provider context
│   ├── globals.css                 # Global CSS (Tailwind directive imports)
│   └── layout.tsx                  # Root Next.js layout
├── components/                     # Reusable UI components
│   ├── common/                     # Shared components (ProtectedRoute, Sidebar, modals)
│   ├── customer/                   # Storefront components (ItemActionButtons, TrackingTimeline)
│   ├── admin/                      # Admin navbar and charts
│   ├── vendor/                     # Vendor navbar
│   └── ui/                         # shadcn/ui primitives
├── constants/                      # Text contents and configuration strings
├── hooks/                          # Custom hooks (e.g. useOrderEligibilityGuard, reduxHooks)
├── lib/                            # Helper utilities and Redux store configuration
├── proxy.ts                        # Request path interceptor & guard (Next.js Proxy)
├── public/                         # Static assets (images, icons)
├── utils/                          # API clients, types, and schema validations
├── package.json                    # Scripts and dependencies
└── PROJECT_ARCHITECTURE_UPDATED.md # In-depth details of design patterns
```

---

## User Roles & Routing (Proxy Fluidifier)

The routing flow is dynamically protected by Next.js request proxy (`proxy.ts`):

- **Guest Routes**: `/` (storefront), `/auth/*`
- **Customer Pages**: `/customer/*` (requires role ID `3`)
- **Vendor Dashboard**: `/vendor/*` (requires role ID `2`)
- **Admin Panel**: `/admin/*` (requires role ID `1`)

Next.js proxy intercepts requests to `/vendor/*` and `/admin/*` before rendering:

1. It validates the presence of an access token cookie.
2. If missing or invalid, it redirects the user smoothly to the entry storefront page.
3. Component-level protection (`ProtectedRoute.tsx`) handles secondary role checking to guarantee strict RBAC.

---

## Flow & UX Fluidifiers

To ensure the storefront operates as a premium, fluid marketplace, the application incorporates several transition, state, and tracking helpers:

1. **Request Flow Fluidifier (Proxy)**
   - `proxy.ts` intercepts router transitions, checking authentication tokens server-side before routes resolve to eliminate visual flashing.
2. **Checkout Fluidifier (Razorpay Overlay)**
   - Payment checkout is completed inside a non-disruptive overlay directly overlaying the checkout screen, maintaining customer context and providing a smooth visual path to the order completion page.
3. **Logistics & Timeline Tracking**
   - Incorporates a clean timeline interface showing shipment updates, courier partners (Shiprocket), and AWB tracking numbers directly inside the order details page.
4. **Performance Fluidifier (React Scan)**
   - Uses `react-scan` in development to highlight unnecessary re-renders, enabling developers to optimize state transitions and keep scroll behaviors fluid.
5. **Animation & Transition Fluidifiers**
   - Leverage `framer-motion` (Motion) inside layouts and modals for lightweight, smooth entrance and exit animations.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_VENDOR_BASE_URL=http://api.example.com/vendor
NEXT_PUBLIC_CUSTOMER_BASE_URL=http://api.example.com/customer
NEXT_PUBLIC_ADMIN_BASE_URL=http://api.example.com/admin
```

---

## Available Scripts

| Command         | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Start the Next.js development server with Turbopack |
| `npm run build` | Compile the Next.js production build                |
| `npm run start` | Start the Next.js production server                 |
| `npm run lint`  | Run ESLint checks                                   |

---

## Contributing

1. **Fork** the repository.
2. **Create a feature branch** — `git checkout -b feature/my-feature`
3. **Commit your changes** — `git commit -m "feat: add my feature"`
4. **Push to the branch** — `git push origin feature/my-feature`
5. **Open a Pull Request**.

---

## License

This project is private and proprietary to **TechSonance Infotech**.

---

<p align="center">
  Built with ❤️ by <strong>TechSonance Infotech</strong>
</p>
