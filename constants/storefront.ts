import { IMAGE_PLACEHOLDER } from "./common";

export const BRAND_HIGHLIGHT_DEFAULT = {
  eyebrow: "Our Promise",
  title: "Precision Engineered for Pure Sound",
  desc: "Every product on our platform is hand-selected for build quality, acoustic performance, and long-term reliability. We partner only with brands that share our obsession with detail.",
  btn_text: "Shop the Collection",
  stats: [
    { value: "500+", label: "Products" },
    { value: "50K+", label: "Happy Customers" },
    { value: "4.9★", label: "Avg. Rating" },
  ],
};

export const NEWSLETTER_DEFAULT = {
  eyebrow: "Stay Connected",
  success_text: "You're in. Welcome to the inner circle.",
  disclaimer: "By subscribing you agree to our Terms of Use and Privacy Policy.",
};

export const VIDEO_HERO_DEFAULT = {
  eyebrow: "Active Feature",
  title: "The Future of Aesthetic Design",
  desc: "Explore an immersive shopping experience defined by curation, precision, and state-of-the-art layout customization.",
  btn_text: "Explore Collection",
  btn_link: "/store",
};

export const TRUST_BADGE_DEFAULT = [
  { icon: "Truck", title: "Free Delivery", subtitle: "On orders above ₹499" },
  { icon: "RotateCcw", title: "Easy Returns", subtitle: "10-day return policy" },
  { icon: "Shield", title: "Secure Payment", subtitle: "100% safe checkout" },
  { icon: "Headphones", title: "24/7 Support", subtitle: "Dedicated help desk" },
];

export const TESTIMONIALS_DEFAULT = [
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    text: "Absolutely premium quality. The packaging was immaculate and delivery was faster than expected.",
  },
  {
    name: "Arjun M.",
    location: "Bangalore",
    rating: 5,
    text: "Best audio gear I have ever bought. Sound quality is extraordinary for the price point.",
  },
  {
    name: "Meera K.",
    location: "Delhi",
    rating: 5,
    text: "Seamless checkout, GST invoice generated instantly. Will definitely be a repeat customer.",
  },
];

export const SCARCITY_BLOCK_DEFAULTS = {
  alert_bg: "#ef4444",
  alert_text_color: "#ffffff",
  btn_text: "Shop the Sale",
  btn_link: "/store",
  timer_title: "FLASH SALE ENDS IN",
};

export const LOOKBOOK_DEFAULTS = {
  title: "Shop The Look",
  subtitle: "Click on the hot-spots to view details and add items to your cart.",
};

export const LOOKBOOK_DEFAULT_HOTSPOTS = [
  {
    id: 1,
    x: 35,
    y: 40,
    name: "Tailored Linen Blazer",
    price: 3499,
    variant_id: "sample-variant-id-1",
    image_url:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300&auto=format&fit=crop",
    description:
      "Luxe blend of breathable linen. Premium fit and structure.",
  },
  {
    id: 2,
    x: 60,
    y: 65,
    name: "Relaxed Silk Trousers",
    price: 2899,
    variant_id: "sample-variant-id-2",
    image_url:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=300&auto=format&fit=crop",
    description:
      "Flowing wide-leg trousers crafted from organic Mulberry silk.",
  },
];

export const CURATED_DISCOVERY_DEFAULTS = {
  title: "Trending Masterpieces",
  subtitle: "Discover our hand-picked selection of high-demand aesthetic creations.",
};

export const SECTION_HEADER_DEFAULTS = {
  hrefLabel: "View All",
};

export const TESTIMONIALS_SLIDER_DEFAULT = [
  {
    id: 1,
    name: 'Aishwarya R.',
    location: 'Delhi',
    rating: 5,
    comment: 'The quality of the linen blazer is absolutely premium. Fits perfectly, packaged with utmost care, and arrived ahead of schedule!',
    avatar_url: ''
  },
  {
    id: 2,
    name: 'Rohan M.',
    location: 'Mumbai',
    rating: 5,
    comment: 'Excellent customer service. I had to resize my trousers and the process was handled within 2 days. Highly recommended!',
    avatar_url: ''
  },
  {
    id: 3,
    name: 'Karan J.',
    location: 'Bangalore',
    rating: 5,
    comment: 'Top-tier fabric and stitch details. It is difficult to find such custom quality at this price point. A true marketplace gem!',
    avatar_url: ''
  }
];

export const TRUST_BADGES_SLIDER_DEFAULT = [
  { id: 1, icon: 'shipping', title: 'Free Shipping', subtitle: 'On all orders above ₹999' },
  { id: 2, icon: 'quality', title: 'Quality Guarantee', subtitle: 'Handcrafted premium fabrics' },
  { id: 3, icon: 'security', title: 'Secure Checkout', subtitle: 'Fully encrypted billing logs' },
  { id: 4, icon: 'support', title: '24/7 Support', subtitle: 'Dedicated stylist support helpline' }
];

export const IMAGE_COLOR_DEFAULTS = {
  bgLight: 'rgb(248, 250, 252)',
  bgDark: 'rgb(15, 23, 42)',
  fallbackColor: 'rgb(15, 23, 42)',
};
