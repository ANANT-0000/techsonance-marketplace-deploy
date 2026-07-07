import type {
  LandingCtaContent,
  LandingFaqContent,
  LandingFeaturesContent,
  LandingFooterContent,
  LandingHeroContent,
  LandingIntegrationsContent,
  LandingNavbarContent,
  LandingPageContent,
  LandingPricingContent,
  LandingShowcaseContent,
  LandingStatsContent,
  LandingTestimonialsContent,
  LandingTickerContent,
} from "@/utils/Types";

export const LANDING_METADATA = {
  title: "Techsonance | Your Brand, Your Platform",
  description:
    "The independent, customizable platform for sellers to establish their own online store.",
};

export const LANDING_NAVBAR: LandingNavbarContent = {
  logo: {
    text: "Techso",
    highlight: "nance",
  },
  links: [
    { label: "App", href: "#screens" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Reviews", href: "#testimonials" },
    { label: "Integrations", href: "#integrations" },
    { label: "FAQ", href: "#faq" },
  ],
  ctas: {
    login: "Sign in",
    signup: "Start Free Trial",
  },
};

export const LANDING_HERO: LandingHeroContent = {
  badge: "Launch faster",
  titlePart1: "Launch Your Branded ",
  titleHighlight: "Online Store",
  titlePart2: " in Minutes.",
  subtitle:
    "No coding required. Sell to customers globally with your own domain and branding.",
  ctaPrimary: "Start Free Trial",
  ctaSecondary: "Build My Store",
  trustBadges: [
    { label: "Tenant-scoped data", icon: "shield" },
    { label: "Role-based access", icon: "users" },
    { label: "Proxy-friendly onboarding", icon: "server" },
  ],
  visual: {
    title: "Overview",
    status: "Live",
    media: {
      type: "image",
      src: "/assets/landing/marketplace-dashboard.jpg",
      alt: "Techsonance merchant dashboard showing revenue, orders, products, and analytics.",
    },
  },
};

export const LANDING_TICKER: LandingTickerContent = {
  label: "Trusted by forward-thinking brands",
  brands: ["Nexaflow", "Meridian", "Vanta Labs", "Pulsar HQ", "Arclight"],
};

export const LANDING_SHOWCASE: LandingShowcaseContent = {
  header: {
    label: "Mobile App",
    titlePart1: "Your storefront,",
    titleHighlight: "in your pocket",
    titlePart2: "",
    subtitle:
      "The Techsonance mobile app brings every dashboard, order, and notification to you - beautifully adapted for any screen.",
  },
  images: [
    {
      src: "/assets/landing/tm-622-screen-01.jpg",
      alt: "Techsonance mobile app screen showing the storefront overview.",
    },
    {
      src: "/assets/landing/tm-622-screen-02.jpg",
      alt: "Techsonance mobile app screen showing performance analytics.",
    },
    {
      src: "/assets/landing/tm-622-screen-04.jpg",
      alt: "Techsonance mobile app screen showing customer engagement details.",
    },
    {
      src: "/assets/landing/tm-622-screen-05.jpg",
      alt: "Techsonance mobile app screen showing storefront notifications.",
    },
  ],
};

export const LANDING_FEATURES: LandingFeaturesContent = {
  header: {
    label: "BUILT FOR GROWING BRANDS",
    titlePart1: "Everything you need to ",
    titleHighlight: "launch, manage and grow",
    titlePart2: " your online business.",
    subtitle:
      "Create your branded storefront, manage products and inventory, accept payments, automate shipping, and scale operations from one platform built for modern ecommerce businesses.",
  },
  items: [
    {
      id: "storefront",
      number: "01 - STOREFRONT",
      title: "Launch a storefront customers trust.",
      description:
        "Your store is 100% yours—custom domain, unique branding, and isolated data. Build a professional ecommerce website without developers.",
      checklist: [
        "Fully branded storefront",
        "Custom domain support",
        "Drag & drop page builder",
        "Mobile-first responsive themes",
      ],
      visual: {
        type: "storefront",
        title: "Storefront Overview",
      },
    },
    {
      id: "product-management",
      number: "02 - PRODUCT MANAGEMENT",
      title: "Manage thousands of products effortlessly.",
      description:
        "Organize products, variants, collections and inventory across multiple warehouses without spreadsheets or manual updates.",
      checklist: [
        "Unlimited products",
        "Variant management",
        "Bulk import/export",
        "Inventory tracking",
        "Warehouse support",
        "SEO ready pages",
      ],
      visual: {
        type: "inventory",
        title: "Inventory Control",
      },
    },
    {
      id: "operations",
      number: "03 - SMART OPERATIONS",
      title: "From checkout to doorstep—automated.",
      description:
        "Accept payments from day one with automatic payouts to your bank. Automate shipping and keep customers updated throughout the entire order lifecycle.",
      checklist: [
        "Razorpay Integration",
        "Shiprocket Shipping",
        "Automatic invoices",
        "Order tracking",
        "Return management",
        "Exchange workflow",
      ],
      visual: {
        type: "timeline",
        title: "Order Fulfillment",
      },
    },
    {
      id: "promotions",
      number: "04 - PROMOTIONS & GROWTH",
      title: "Turn visitors into repeat customers.",
      description:
        "Get found on Google and drive organic traffic without hiring an agency. Run discounts, coupons, and flash sales natively.",
      checklist: [
        "Coupons",
        "Referral rewards",
        "Flash sales",
        "Product bundles",
        "Email campaigns",
        "Abandoned cart recovery",
      ],
      visual: {
        type: "marketing",
        title: "Marketing Dashboard",
      },
    },
    {
      id: "insights",
      number: "05 - INSIGHTS",
      title: "Know exactly what's driving your business.",
      description:
        "Track sales, orders, customers and inventory in real time so you can make faster, smarter business decisions.",
      checklist: [
        "Sales analytics",
        "Revenue trends",
        "Top products",
        "Customer insights",
        "Inventory reports",
        "Performance dashboards",
      ],
      visual: {
        type: "analytics",
        title: "Revenue Insights",
      },
    },
  ],
};

export const LANDING_STATS: LandingStatsContent = {
  items: [
    {
      value: "10",
      suffix: "M+",
      label: "Processed in Sales",
      sublabel: "Securely managed every year",
    },
    {
      value: "500",
      suffix: "+",
      label: "Stores Launched",
      sublabel: "Growing their brand with us",
    },
    {
      value: "99.9",
      suffix: "%",
      label: "Platform Uptime",
      sublabel: "Built for high-traffic sales",
    },
    {
      value: "2",
      suffix: "M+",
      label: "Orders Fulfilled",
      sublabel: "Automatically routed & tracked",
    },
  ],
};

export const LANDING_PRICING: LandingPricingContent = {
  header: {
    label: "Pricing",
    titlePart1: "Simple, ",
    titleHighlight: "transparent",
    titlePart2: " pricing",
    subtitle: "No hidden fees. No surprise overages. Cancel anytime. No credit card required.",
  },
  toggle: {
    monthly: "Monthly",
    annual: "Annual",
    badge: "Save 35%",
  },
  currency: "₹",
  planOverrides: {
    trial: {
      description: "Full access for 14 days. No credit card required.",
      features: [
        "All features unlocked",
        "Up to 50 products",
        "500 orders/month",
        "Email support",
      ],
      ctaLabel: "Start Free Trial",
      ctaHref: "/auth/vendorRegister",
      isFeatured: false,
    },
    starter: {
      description: "For individuals and small businesses getting started with their own branded store.",
      features: [
        "Up to 100 products",
        "1,000 orders/month",
        "Custom domain",
        "Basic analytics",
        "Email support",
      ],
      ctaLabel: "Get Started",
      ctaHref: "/auth/vendorRegister",
      isFeatured: false,
    },
    pro: {
      badge: "Most Popular",
      description: "For growing teams that need advanced features and priority support.",
      features: [
        "Unlimited products",
        "Unlimited orders",
        "Custom domain + branding",
        "Advanced analytics",
        "Promotions & coupons",
        "Priority support",
      ],
      ctaLabel: "Start Free Trial",
      ctaHref: "/auth/vendorRegister",
      isFeatured: true,
    },
  },
};


export const LANDING_TESTIMONIALS: LandingTestimonialsContent = {
  header: {
    label: "Customer Stories",
    titlePart1: "Teams that ",
    titleHighlight: "love",
    titlePart2: " Techsonance",
    subtitle:
      "Don't take our word for it - here's what real vendors say after 90 days.",
  },
  reviews: [
    {
      id: "review-1",
      quote:
        "My sales doubled after switching to a dedicated storefront on Techsonance. The customization options are endless, and accepting payments was completely seamless from day one.",
      author: "Sarah J.",
      role: "Owner - GreenHome Decor",
      avatar: "SJ",
      isTall: true,
    },
    {
      id: "review-2",
      quote:
        "The mobile app alone justified the switch. I can review dashboards and approve tasks between meetings without opening my laptop.",
      author: "Marcus Reyes",
      role: "Product Director - Meridian",
      avatar: "MR",
      isTall: false,
    },
    {
      id: "review-3",
      quote:
        "Onboarding our 30-person team took one afternoon. The learning curve is genuinely flat.",
      author: "Priya Kapoor",
      role: "Engineering Lead - Vanta Labs",
      avatar: "PK",
      isTall: false,
    },
    {
      id: "review-4",
      quote:
        "The reporting features are leagues ahead of what we had. We can finally show stakeholders live data instead of preparing decks.",
      author: "Tom Wainwright",
      role: "CFO - Pulsar HQ",
      avatar: "TW",
      isTall: false,
    },
    {
      id: "review-5",
      quote:
        "Customer support actually reads your message. Had a custom integration question answered in under two hours.",
      author: "Aiko Nakamura",
      role: "CTO - Nexaflow",
      avatar: "AN",
      isTall: false,
    },
  ],
};

export const LANDING_INTEGRATIONS: LandingIntegrationsContent = {
  header: {
    label: "Integrations",
    titlePart1: "Connects with your ",
    titleHighlight: "existing stack",
    subtitle:
      "One-click integrations with the tools your team already uses. No dev work required.",
  },
  tools: [
    "Slack",
    "Google Sheets",
    "Google Drive",
    "Zapier",
    "Stripe",
    "GitHub",
    "Notion",
    "Mailchimp",
    "HubSpot",
    "Airtable",
    "Intercom",
    "Salesforce",
    "Figma",
    "Linear",
    "Jira",
    "Webflow",
  ],
};

export const LANDING_FAQ: LandingFaqContent = {
  header: {
    label: "FAQ",
    titlePart1: "Questions, ",
    titleHighlight: "answered",
    subtitle:
      "Can't find what you're looking for? Reach our team at support@techsonance.com - we reply within 2 hours.",
  },
  controls: {
    expand: "Expand all",
    collapse: "Collapse all",
  },
  questions: [
    {
      id: "faq-1",
      q: "Is there a free trial?",
      a: "Yes - every plan starts with a 14-day free trial, no credit card required. You get full access to all features in your chosen tier so you can make a real evaluation before committing.",
    },
    {
      id: "faq-2",
      q: "Can I use my own domain?",
      a: "Absolutely! You can easily connect your own custom domain (e.g., yourstore.com) to your Techsonance storefront on all paid plans.",
    },
    {
      id: "faq-3",
      q: "How do I get paid?",
      a: "We integrate with leading payment gateways like Razorpay and Stripe. Payouts are deposited directly into your linked bank account automatically.",
    },
    {
      id: "faq-4",
      q: "Is there a transaction fee?",
      a: "We charge absolutely zero transaction fees. You keep 100% of your revenue. You only pay standard processing rates to your payment gateway provider.",
    },
    {
      id: "faq-5",
      q: "Can I migrate from Shopify?",
      a: "Yes. Our bulk import tool allows you to easily bring over all your products, inventory, and customer data directly from Shopify via CSV.",
    },
    {
      id: "faq-6",
      q: "Can I cancel anytime?",
      a: "Yes. There are no lock-in contracts on monthly plans. Cancel from your account settings at any time and you won't be charged again. Annual plans are non-refundable but can be cancelled to stop renewal.",
    },
  ],
};

export const LANDING_CTA: LandingCtaContent = {
  label: "Get Started Today",
  titlePart1: "Ready for your ",
  titleHighlight: "independent storefront?",
  subtitle:
    "Join thousands of sellers who replaced marketplace noise with their own brand. Set up in under 10 minutes.",
  ctaPrimary: "Start Free Trial",
  ctaSecondary: "Schedule a demo",
};

export const LANDING_FOOTER: LandingFooterContent = {
  brandDesc:
    "The independent, customizable platform for sellers to establish their own online store.",
  socials: [
    { id: "twitter", label: "Twitter / X", url: "#" },
    { id: "linkedin", label: "LinkedIn", url: "#" },
    { id: "youtube", label: "YouTube", url: "#" },
    { id: "tiktok", label: "TikTok", url: "#" },
  ],
  columns: [
    {
      label: "Product",
      links: [
        { label: "Features", url: "#features" },
        { label: "Mobile App", url: "#screens" },
        { label: "Pricing", url: "#pricing" },
        { label: "Integrations", url: "#integrations" },
        { label: "Changelog", url: "#" },
      ],
    },
    {
      label: "Company",
      links: [
        { label: "About", url: "/about" },
        { label: "Blog", url: "#" },
        { label: "Careers", url: "#" },
        { label: "Press Kit", url: "#" },
        { label: "Status", url: "#" },
      ],
    },
    {
      label: "Support",
      links: [
        { label: "Help Center", url: "#" },
        { label: "Documentation", url: "#" },
        { label: "Security", url: "#" },
        { label: "Contact", url: "/contact" },
        { label: "Community", url: "#" },
      ],
    },
  ],
  legal: [
    { label: "Privacy Policy", url: "#" },
    { label: "Terms of Service", url: "#" },
    { label: "Cookie Policy", url: "#" },
  ],
  copyright: `Copyright ${new Date().getFullYear()} Techsonance. All rights reserved.`,
};

export const LANDING_PAGE_CONTENT: LandingPageContent = {
  metadata: LANDING_METADATA,
  navbar: LANDING_NAVBAR,
  hero: LANDING_HERO,
  ticker: LANDING_TICKER,
  showcase: LANDING_SHOWCASE,
  features: LANDING_FEATURES,
  stats: LANDING_STATS,
  pricing: LANDING_PRICING,
  testimonials: LANDING_TESTIMONIALS,
  integrations: LANDING_INTEGRATIONS,
  faq: LANDING_FAQ,
  cta: LANDING_CTA,
  footer: LANDING_FOOTER,
};
