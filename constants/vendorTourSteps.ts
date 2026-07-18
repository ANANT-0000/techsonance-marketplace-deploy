import { Step } from "react-joyride";

export interface VendorTourStep extends Step {
  icon?: string;
  title?: string;
}

export const dashboardTourSteps: VendorTourStep[] = [
  {
    icon: '👋',
    title: 'Welcome to Your Store!',
    content: 'We are thrilled to have you here! Your dashboard is a blank canvas right now, but this is exactly where you will manage everything once your business takes off. Let\'s show you around!',
    target: '#tour-dashboard-welcome',
    placement: 'center',
    skipBeacon: true,
  },
  {
    icon: '📊',
    title: 'Your Overview Stats',
    content: 'Get a quick glance at your total revenue, orders, and active products here. It’s quiet now, but soon these numbers will light up!',
    target: '#tour-analytics-overview',
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    icon: '📈',
    title: 'Revenue Chart',
    content: 'Watch your business grow! This chart will display your daily revenue trends so you can easily track your progress over time.',
    target: '#tour-revenue-chart',
    placement: 'top',
    skipBeacon: true,
  },
  {
    icon: '🏆',
    title: 'Top Performers',
    content: 'Discover what your customers love the most. Your best-selling products will be ranked here automatically.',
    target: '#tour-top-products',
    placement: 'top',
    skipBeacon: true,
  },
  {
    icon: '📦',
    title: 'Recent Orders',
    content: 'Keep track of all your latest incoming orders in one place. You can print invoices or filter by status right from this table.',
    target: '#tour-recent-orders',
    placement: 'top',
    skipBeacon: true,
  },
  {
    icon: '🧭',
    title: 'Your Control Center',
    content: 'Use this menu to jump between your virtual shelves, incoming orders, and store design. Go ahead and explore whenever you are ready!',
    target: '#tour-sidebar-nav',
    placement: 'right',
    skipBeacon: true,
  }
];

export const ordersTourSteps: VendorTourStep[] = [
  {
    icon: '🛍️',
    title: 'Your Order Inbox',
    content: 'This is your future command center! Once your store is live, every new customer order will pop up right here so you can easily pack and ship them.',
    target: '#tour-orders-table',
    placement: 'top',
    skipBeacon: true,
  },
  {
    icon: '🚚',
    title: 'Keep Customers Happy',
    content: 'When you ship an item, you can click here to let your customers know their package is on the way. Happy customers always come back!',
    target: '#tour-order-status-action',
    placement: 'left',
    skipBeacon: true,
  }
];

export const productsDirectoryTourSteps: VendorTourStep[] = [
  {
    icon: '📚',
    title: 'Your Virtual Shelves',
    content: 'Your shelves are currently empty, but this is where all the wonderful things you sell will live. You will be able to see prices, stock levels, and organize everything perfectly.',
    target: '#tour-products-filter',
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    icon: '✨',
    title: 'Add Your First Item',
    content: 'Every great store starts with a single item. Click this button to add photos, prices, and details for your very first product. Let\'s get it on the shelf!',
    target: '#tour-products-add',
    placement: 'left',
    skipBeacon: true,
  },
  {
    icon: '🎨',
    title: 'Offer More Choices',
    content: 'Selling a shirt in different colors or sizes? Once you add products, you can manage all those extra choices right from here.',
    target: '#tour-products-table',
    placement: 'top',
    skipBeacon: true,
  }
];

export const productCreationTourSteps: VendorTourStep[] = [
  {
    icon: '📝',
    title: 'Tell Your Story',
    content: 'What makes your item special? Give it a catchy name and write a description that makes people want to buy it right away.',
    target: '#tour-product-basic',
    placement: 'right',
    skipBeacon: true,
  },
  {
    icon: '📁',
    title: 'Help Shoppers Find It',
    content: 'Think of this like putting your item in the right aisle of a grocery store. Pick the best category so customers can easily discover what you are selling!',
    target: '#tour-product-category',
    placement: 'left',
    skipBeacon: true,
  }
];

export const variantCreationTourSteps: VendorTourStep[] = [
  {
    icon: '🏷️',
    title: 'Price It Right',
    content: 'How much will your customers pay for this? Enter your price here. Don\'t worry, you can always change it later or run a special sale!',
    target: '#tour-variant-pricing',
    placement: 'right',
    skipBeacon: true,
  },
  {
    icon: '🧮',
    title: 'Track Your Stock',
    content: 'Tell us how many of these you have on hand. We will count them down as you sell so you never accidentally promise something you do not have.',
    target: '#tour-variant-inventory',
    placement: 'left',
    skipBeacon: true,
  },
  {
    icon: '📸',
    title: 'Show It Off',
    content: 'Customers love to see what they are buying! Upload bright, clear photos to show off the very best angles of your item.',
    target: '#tour-variant-images',
    placement: 'top',
    skipBeacon: true,
  }
];

export const cmsTourSteps: VendorTourStep[] = [
  {
    icon: '🏬',
    title: 'Design Your Store',
    content: 'Ready to decorate? Use these tabs to add your logo, pick your colors, and make your store\'s homepage look incredibly professional.',
    target: '#tour-cms-tabs',
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    icon: '🌎',
    title: 'Welcome Everyone',
    content: 'Want to sell to people all over the world? You can use this area to easily translate your website into different languages.',
    target: '#tour-cms-lang',
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    icon: '🚀',
    title: 'Publish to the World',
    content: 'After you finish making your store look beautiful, click here to save your work. Your customers are going to love it!',
    target: '#tour-cms-save',
    placement: 'left',
    skipBeacon: true,
  }
];
