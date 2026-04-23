export const HOME_SECONDARY_IMG = "https://m.media-amazon.com/images/I/61KcQyhY6SL._SL1200_.jpg";

import { BestSellingProductType, CategoryList, Feedback, FooterSectionType, NavLinkType, OrderFailedStatus, OrderSuccessStatus, Product } from "@/utils/Types"



// Navigation Links

//Cusomter Home hero title and description
export const HOME_HERO_TITLE = "Welcome to Sound Sphere - Your Ultimate Music Marketplace";
export const HOME_HERO_DESC = "Discover, buy, and sell music products with ease. Join our vibrant community of music lovers and elevate your sound experience today!";
export const HERO_BTN_TEXT = "Shop Now";

// Navigation Links
export const NAV_LINKS: NavLinkType[] = [{ Home: '/' }, { Shop: '/shopping' }, { About: '/about' }, { Contact: '/contact' }]
export interface tabLinkType {
    [key: string]: string;
}
export const TAB_LINKS: tabLinkType[] = [
    { title: 'Home', url: '/', iconNames: 'house' },
    { title: 'Shop', url: '/shopping', iconNames: 'shopping-bag' },
    { title: 'Cart', url: '/cart', iconNames: 'shopping-cart' },

    { title: 'Profile', url: '/customerProfile', iconNames: 'user' },
    { title: 'Menu', url: '', iconNames: 'menu' }

]
export const FOOTER_CONTENT: FooterSectionType[] = [
    {
        header: 'Need Help?',
        links: [
            { title: 'Customer Service', url: '/customer_service' },
            { title: 'Returns & Exchanges', url: '/returns_exchanges' },
            { title: 'Shipping Information', url: '/shipping_information' },
            { title: 'FAQs', url: '/faqs' },
            { title: 'Careers', url: '/careers' },

        ]
    }
    , {
        header: 'Company',
        links: [
            { title: 'About Us', url: '/about' },
            { title: 'Blog', url: '/blog' },
            { title: 'Collaboration', url: '/collaboration' },
            { title: 'Media', url: '/media' },
        ]
    }
    , {
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
            { title: 'Email', url: 'mailto:support@soundsphere.com', icon: 'email', category: 'contact' },
            { title: 'Eklingpura Chouraha, Ahmedabad Main Road F(NH 8- Near Mahadev Hotel) Udaipur, India- 313002', url: 'https://www.google.com/maps/place/Sound+Sphere/@37.7749,-122.4194,15z/data=!4m5!3m4!1s0x0:0x0!8m2!3d37.7749!4d-122.4194', icon: 'location', styles: 'text-sm', category: 'contact' },
            // { title: 'Facebook', url: 'https://www.facebook.com/soundsphere', icon: 'facebook', styles: ' bg-blue-500 text-white rounded p-1', category: 'social' },

            // { title: 'Instagram', url: 'https://www.instagram.com/soundsphere', icon: 'instagram', styles: 'bg-pink-500 text-white rounded p-1', category: 'social' },
        ]
    }

]
// Footer Text
export const FOOTER_BOTTOM_TEXT = "Copyright © 2026 Sound Sphere. All rights reserved."
export const ContactList = [
    {
        id: '1',
        type: 'phone',
        title: 'Phone',
        description: '+1 (123) 456-7890',
        icon: 'phone'
    },
    {
        id: '2',
        type: 'email',
        title: 'Email',
        description: 'info@example.com',
        icon: 'mail'
    }, {
        id: '3',
        type: 'address',
        title: 'Address',
        description: '123 Main St, Anytown, India',
        icon: 'map-pin'
    }
]
export const ContactPageContent = {
    heroTitle: "CONTACT US",
    heroDesc: "Let's Connect",
    heroImg: "https://static.vecteezy.com/system/resources/previews/022/281/057/original/halftone-gradient-background-with-dots-abstract-blue-dotted-pop-art-pattern-in-comic-style-illustration-vector.jpg",
}
export const AboutPageContent = {
    heroTitle: "ABOUT US",
    heroDesc: "  We are Passionate About Our Work",
    heroImg: "https://static.vecteezy.com/system/resources/previews/022/281/057/original/halftone-gradient-background-with-dots-abstract-blue-dotted-pop-art-pattern-in-comic-style-illustration-vector.jpg",
    ownThoughtsImg: "https://www.mivi.in/cdn/shop/files/SuperPods_Opera_ENC_-_Blue.png?v=1730114006&width=1500",
    founderImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    founderName: "john doe",
    founderTitle: "Founder & CEO",
    ownThoughtsTitle: "We strive to provide our customers with the highest quality",
    ownThoughtsDesc: "products and services. Our team is dedicated to ensuring that every customer has a positive experience with our brand. We are committed to delivering exceptional value and exceeding our customers' expectations. We believe in building long-term relationships with our customers based on trust, transparency, and mutual respect. Our goal is to create a community of satisfied customers who can rely on us for all their tech needs.",
    coreValuesImg: "https://wallpaper.forfun.com/fetch/d1/d17e24d67388285f8e284a58a36a866f.jpeg?w=1470&r=0.5625&f=webp",
    coreValuesTitle: "Our Core Values that Drive Everything We Do",
    coreValuesDesc: "At Techsonance, our core values are the foundation of our company culture and guide us in everything we do. We are committed to innovation, quality, and customer satisfaction. We believe in fostering a collaborative and inclusive work environment where creativity thrives. Our dedication to excellence drives us to continuously improve and deliver exceptional products and services to our customers.",
    coreValues: [
        {
            "id": 1,
            "title": "Innovation",
            "tagline": "Acoustic Avant-Garde",
            "description": "We are committed to pushing the boundaries of technology and delivering innovative solutions that meet the evolving needs of our customers."
        },
        {
            "id": 2,
            "title": "Quality",
            "tagline": "Uncompromising Fidelity",
            "description": "We prioritize quality in everything we do, from product development to customer service, ensuring that our customers receive the best possible experience."
        },
        {
            "id": 3,
            "title": "Customer Satisfaction",
            "tagline": "The Audiophile Journey",
            "description": "Our customers are at the heart of everything we do, and we are dedicated to providing exceptional service and support to ensure their satisfaction."
        },
        {
            "id": 4,
            "title": "Collaboration",
            "tagline": "Harmonious Synergy",
            "description": "We believe in fostering a collaborative work environment where creativity thrives and diverse perspectives are valued."
        }
    ],
    ourJourneyTitle: "Our Journey: From Humble Beginnings to Tech Excellence",
    ourJourneyDesc: "Techsonance started as a small startup with a vision to revolutionize the tech industry. With a passionate team and a commitment to innovation, we have grown into a leading technology company. Our journey has been marked by milestones, challenges, and successes that have shaped us into the company we are today. We are proud of our achievements and excited for the future as we continue to push the boundaries of technology and deliver exceptional products and services to our customers.",
    missionImg: "https://www.mivi.in/cdn/shop/files/For_Why_section_1_044b23b6-dbbd-4b3b-9307-1970700eb153.png?v=1748874263&width=2500&format=webp&quality=80",
    missionTitle: "Our Mission",
    missionDesc: "To redefine the art of listening by fusing collaborative creativity with innovative acoustic engineering. We are dedicated to crafting audio masterpieces of uncompromising quality, ensuring that the satisfaction of the discerning listener remains the heartbeat of our brand.",
    missionToDeliver: [
        {
            "id": 1,
            "title": "Innovation",
            "tagline": "Acoustic Avant-Garde",
            "description": "We are committed to pushing the boundaries of technology and delivering innovative solutions that meet the evolving needs of our customers."
        },
        {
            "id": 2,
            "title": "Quality",
            "tagline": "Uncompromising Fidelity",
            "description": "We prioritize quality in everything we do, from product development to customer service, ensuring that our customers receive the best possible experience."
        },
        {
            "id": 3,
            "title": "Customer Satisfaction",
            "tagline": "The Audiophile Journey",
            "description": "Our customers are at the heart of everything we do, and we are dedicated to providing exceptional service and support to ensure their satisfaction."
        },
        {
            "id": 4,
            "title": "Collaboration",
            "tagline": "Harmonious Synergy",
            "description": "We believe in fostering a collaborative work environment where creativity thrives and diverse perspectives are valued."
        }]

}
// export const mockSuccessStatus: OrderSuccessStatus = {
//     orderId: "#345-9204268-1845104",
//     orderDate: "Jan 1",
//     estimatedDelivery: "Jan 4",
//     shippingAddress: {
//         line1: "flat no 202, bblossom the presidency,"
//         line2: "vesu, near raguver spectrum building",
//         city: "SURAT",
//         state: "GUJARAT",
//         postalCode: "395007",
//         country: "India"
//     },
//     paymentMethod: {
//         type: "UPI",
//         details: "bankofindia@1313yap"
//     },
//     items: [
//         {
//             id: "1",
//             name: "Sound Sphere Bass Pro",
//             image: "/product-image.png",
//             color: "Midnight Black",
//             quantity: 1,
//             price: 1399
//         }
//     ],
//     subtotal: 1399,
//     discount: 300,
//     delivery: 0,
//     total: 1099,

// }

// export const mockFailedStatus: OrderFailedStatusTypes = {
//     errorCode: "PAYMENT_DECLINED",
//     transactionId: "TXN123456789",
//     attemptedAmount: 1099,
//     possibleReasons: [
//         "Insufficient funds in the account.",
//         "Incorrect card details entered.",
//         "Bank's fraud detection system flagged the transaction.",
//         "Technical issues with the payment gateway."
//     ]
// }
export const HOME_BRAND_FEATURES: { title: string; icon: string }[] = [
    {
        title: 'Secure Payment',
        icon: 'wallet'
    },
    {
        title: 'Free Shipping',
        icon: 'package'
    },
    {
        title: 'Delivered with Care and on time',
        icon: 'truck'
    },
    {
        title: 'High Quality audio',
        icon: 'audio-lines'
    },
]

export const CATEGORY_LIST: CategoryList[] = [
    {
        title: 'Guitars',
        url: 'https://m.media-amazon.com/images/I/61KcQyhY6SL._SL1200_.jpg'
    },
    {
        title: 'Drums',
        url: 'https://m.media-amazon.com/images/I/71YenZNhuPL._SL1500_.jpg'
    },
    {
        title: 'Keyboards',
        url: 'https://m.media-amazon.com/images/I/61En6OhNqNL._SL1200_.jpg'
    },
    {
        title: 'Microphones',
        url: 'https://m.media-amazon.com/images/I/61KcQyhY6SL._SL1200_.jpg'
    },
    {
        title: 'Headphones',
        url: 'https://m.media-amazon.com/images/I/71YenZNhuPL._SL1500_.jpg'
    },
    {
        title: 'Audio Interfaces',
        url: 'https://m.media-amazon.com/images/I/61En6OhNqNL._SL1200_.jpg'
    },
    {
        title: 'Studio Monitors',
        url: 'https://m.media-amazon.com/images/I/61KcQyhY6SL._SL1200_.jpg'
    },
    {
        title: 'DJ Equipment',
        url: 'https://m.media-amazon.com/images/I/71YenZNhuPL._SL1500_.jpg'
    }
]

export const BEST_SELLING_PRODUCTS: BestSellingProductType = {

    title: 'Fender Stratocaster Electric Guitar',
    url: 'https://m.media-amazon.com/images/I/61KcQyhY6SL._SL1200_.jpg',
    description: 'Experience the iconic sound and playability of the Fender Stratocaster Electric Guitar. Perfect for musicians of all levels, this guitar delivers classic tones and exceptional performance. Whether you\'re a beginner or a seasoned pro, the Stratocaster is your ticket to musical greatness.',
    satisfaction: '98%  ',
}

export const FEEDBACK_LIST: Feedback[] = [
    {
        customerName: 'John Doe',
        feedback: 'I had an amazing experience shopping at Sound Sphere! The website is user-friendly, and the customer service was top-notch. I found exactly what I was looking for and received my order quickly. Highly recommend!',
        rating: 5
    },
    {
        customerName: 'Jane Smith',
        feedback: 'Sound Sphere has a fantastic selection of music products. I was able to find rare vinyl records that I couldn\'t find anywhere else. The checkout process was smooth, and my order arrived in perfect condition. Will definitely shop here again!',
        rating: 4
    },
    {
        customerName: 'Mike Johnson',
        feedback: 'I had a minor issue with my order, but the customer support team at Sound Sphere was incredibly responsive and helpful. They resolved my issue quickly and even offered a discount on my next purchase. I appreciate their dedication to customer satisfaction.',
        rating: 5
    },
]
// export const PRODUCT_LIST: ProductType[] = [
//     {
//         id: "hd-001",
//         name: "Sony WH-1000XM5 Noise Canceling Headphones",
//         price: 29990,
//         discount: 10,
//         category: "Headphones",
//         imgUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=300&q=80",
//         description: "Industry-leading noise cancellation with two processors controlling eight microphones for unprecedented noise cancellation.",
//         satisfaction: "4.8/5"
//     },
//     {
//         id: "hpx-cloud-ps",
//         title: "HyperX Cloud Stinger 2 Core Gaming Headset PS White",
//         price: 3790,
//         discount: 18, // Estimated based on typical MRP vs price
//         category: "Gaming Headsets",
//         imgUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
//         description: "Essential Headset for PlayStation Gaming. HyperX Cloud Stinger 2 Core is the essential entry-level headset for the PlayStation gamer who wants great sound at an affordable price. It features a lightweight design, soft ear cushions, and a swivel-to-mute microphone.",
//         satisfaction: "4.5/5",
//         rating: 4.5,
//         reviewCount: 128,
//         productDetails: {
//             brand: "HyperX",
//             model: "Cloud Stinger 2 Core",
//             specifications: {
//                 "Headphone Driver": "40mm",
//                 "Frequency Response": "10Hz – 25kHz",
//                 "Impedance": "32.5 Ω",
//                 "Weight": "275g",
//                 "Microphone Pattern": "Bi-directional, Noise-cancelling",
//                 "Cable Length": "1.3m headset cable",
//                 "Connection Type": "Wired 3.5mm (4-pole CTIA)",
//                 "Compatibility": "PlayStation 4, PlayStation 5"
//             }
//         },
//         specificationsImgUrl: [
//             "https://images.unsplash.com/photo-1593121925328-369cc8459c08?auto=format&fit=crop&w=800&q=80", // "Hear it all" banner placeholder
//             "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"  // "Keep your game" banner placeholder
//         ],
//         reviews: [
//             {
//                 id: "rev-001",
//                 userName: "Isabella D.",
//                 rating: 5,
//                 date: "August 14, 2023",
//                 comment: "I absolutely love these! The sound quality is amazing for the price, and they are super comfortable to wear for long gaming sessions. The white color looks sleek with my PS5."
//             },
//             {
//                 id: "rev-002",
//                 userName: "Alex M.",
//                 rating: 4,
//                 date: "October 02, 2023",
//                 comment: "Great headset for the price. The mic is clear and the swivel-to-mute feature is very handy. Just wish the cable was a tiny bit longer."
//             },
//             {
//                 id: "rev-003",
//                 userName: "David K.",
//                 rating: 5,
//                 date: "September 20, 2023",
//                 comment: "Perfect entry level headset. It's lightweight and doesn't hurt my ears after hours of playing. Highly recommend for casual gamers."
//             }
//         ]
//     },
//     {
//         id: "sp-003",
//         title: "Marshall Emberton Portable Speaker",
//         price: 14999,
//         discount: 15,
//         category: "Speakers",
//         imgUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=300&q=80",
//         description: "Compact portable speaker with the loud and vibrant sound only Marshall can deliver. IPX7 water-resistance rating.",
//         satisfaction: "4.7/5"
//     },
//     {
//         id: "mc-004",
//         title: "Blue Yeti USB Microphone",
//         price: 10999,
//         discount: 0,
//         category: "Microphones",
//         imgUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=300&q=80",
//         description: "The world's #1 USB microphone. Create unparalleled recordings with your computer using Blue's best-selling Yeti family of mic.",
//         satisfaction: "4.6/5"
//     },
//     {
//         id: "hd-005",
//         title: "Beats Studio3 Wireless Over-Ear",
//         price: 25900,
//         discount: 20,
//         category: "Headphones",
//         imgUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80",
//         description: "High-performance wireless noise cancelling headphones. Compatible with iOS and Android devices.",
//         satisfaction: "4.5/5"
//     },
//     {
//         id: "eb-006",
//         title: "Samsung Galaxy Buds2 Pro",
//         price: 16999,
//         discount: 12,
//         category: "Earbuds",
//         imgUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80",
//         description: "Intelligent Active Noise Cancellation quiets even the loudest outside sounds. Studio quality sound.",
//         satisfaction: "4.4/5"
//     },
//     {
//         id: "sp-007",
//         title: "JBL Flip 6 Waterproof Speaker",
//         price: 9999,
//         discount: 10,
//         category: "Speakers",
//         imgUrl: "https://placehold.net/10.png",
//         description: "Bold sound for every adventure. The beat goes on with the JBL Flip 6 2-way speaker system.",
//         satisfaction: "4.8/5"
//     },
//     {
//         id: "hd-008",
//         title: "Sennheiser HD 560S Audiophile",
//         price: 18990,
//         discount: 8,
//         category: "Headphones",
//         imgUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
//         description: "Linear acoustics tailored for extended listening sessions. Smooth, deep bass performance.",
//         satisfaction: "4.9/5"
//     },
//     {
//         id: "tr-009",
//         title: "Audio-Technica AT-LP60X Turntable",
//         price: 13999,
//         discount: 5,
//         category: "Audio Players",
//         imgUrl: "https://images.unsplash.com/photo-1539375665275-f9de0e5e66f9?auto=format&fit=crop&w=300&q=80",
//         description: "Fully automatic belt-drive stereo turntable. Experience the high-fidelity audio of vinyl.",
//         satisfaction: "4.7/5"
//     },
//     {
//         id: "gm-010",
//         title: "HyperX Cloud II Gaming Headset",
//         price: 8490,
//         discount: 15,
//         category: "Gaming Audio",
//         imgUrl: "https://images.unsplash.com/photo-1612444530582-fc661f235946?auto=format&fit=crop&w=300&q=80",
//         description: "Comfortable memory foam ear cushions with padded leatherette headband. 7.1 virtual surround sound.",
//         satisfaction: "4.6/5"
//     },
//     {
//         id: "eb-011",
//         title: "Powerbeats Pro Wireless",
//         price: 21500,
//         discount: 10,
//         category: "Earbuds",
//         imgUrl: "https://images.unsplash.com/photo-1616866164287-6e4b85750059?auto=format&fit=crop&w=300&q=80",
//         description: "Totally wireless high-performance earphones. Up to 9 hours of listening time.",
//         satisfaction: "4.5/5"
//     },
//     {
//         id: "sp-012",
//         title: "Sonos Roam Smart Speaker",
//         price: 19999,
//         discount: 0,
//         category: "Speakers",
//         imgUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80",
//         description: "The portable smart speaker for all your listening adventures. Take incredible sound everywhere with Roam.",
//         satisfaction: "4.3/5"
//     },
//     {
//         id: "mc-013",
//         title: "Shure SM7B Vocal Microphone",
//         price: 36500,
//         discount: 5,
//         category: "Microphones",
//         imgUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=300&q=80",
//         description: "The SM7B is a selectable frequency response microphone that delivers warm and smooth audio for close-talk applications.",
//         satisfaction: "5.0/5"
//     },
//     {
//         id: "hd-014",
//         title: "Bose QuietComfort 45",
//         price: 29900,
//         discount: 18,
//         category: "Headphones",
//         imgUrl: "https://placehold.net/10.png",
//         description: "Iconic quiet, comfort, and sound. The perfect balance of quiet, comfort, and sound.",
//         satisfaction: "4.7/5"
//     },
//     {
//         id: "eb-015",
//         title: "Jabra Elite 7 Pro",
//         price: 14999,
//         discount: 25,
//         category: "Earbuds",
//         imgUrl: "https://images.unsplash.com/photo-1572569028738-411a5431bf15?auto=format&fit=crop&w=300&q=80",
//         description: "Advanced audio engineering. Jabra MultiSensor Voice for revolutionary call performance.",
//         satisfaction: "4.2/5"
//     },
//     {
//         id: "sp-016",
//         title: "Bose SoundLink Flex",
//         price: 15900,
//         discount: 5,
//         category: "Speakers",
//         imgUrl: "https://images.unsplash.com/photo-1622396347108-a8775df54722?auto=format&fit=crop&w=300&q=80",
//         description: "State-of-the-art design. SoundLink Flex is packed with exclusive technologies and a custom-engineered transducer.",
//         satisfaction: "4.6/5"
//     },
//     {
//         id: "hd-017",
//         title: "AKG Pro Audio K702",
//         price: 22500,
//         discount: 30,
//         category: "Headphones",
//         imgUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=300&q=80",
//         description: "Reference studio headphones for precision listening, mixing and mastering.",
//         satisfaction: "4.5/5"
//     },
//     {
//         id: "eb-018",
//         title: "Nothing Ear (2)",
//         price: 9999,
//         discount: 0,
//         category: "Earbuds",
//         imgUrl: "https://images.unsplash.com/photo-1662645607062-094186595304?auto=format&fit=crop&w=300&q=80",
//         description: "Ultra-light at just 4.5g. Powerful 11.6mm custom driver. 24bit Hi-Res Audio certified.",
//         satisfaction: "4.4/5"
//     },
//     {
//         id: "ac-019",
//         title: "Wooden Headphone Stand",
//         price: 1999,
//         discount: 0,
//         category: "Accessories",
//         imgUrl: "https://images.unsplash.com/photo-1610433276633-8a9d18b3684d?auto=format&fit=crop&w=300&q=80",
//         description: "Universal wooden headphone stand holder walnut finish with aluminum base.",
//         satisfaction: "4.3/5"
//     },
//     {
//         id: "hd-020",
//         title: "Philips SHP9500 HiFi",
//         price: 7990,
//         discount: 10,
//         category: "Headphones",
//         imgUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=300&q=80",
//         description: "50mm neodymium drivers deliver full spectrum of sound. Breathable ear cushion for longer wearing comfort.",
//         satisfaction: "4.8/5"
//     },
//     {
//         id: "sp-021",
//         title: "Harman Kardon Aura Studio 3",
//         price: 25999,
//         discount: 5,
//         category: "Speakers",
//         imgUrl: "https://images.unsplash.com/photo-1559406041-c7d2b2e986a2?auto=format&fit=crop&w=300&q=80",
//         description: "Visually stunning sound. Elevate your home with the timeless, iconic design of the Aura Studio 3.",
//         satisfaction: "4.7/5"
//     },
//     {
//         id: "eb-022",
//         title: "Google Pixel Buds A-Series",
//         price: 7999,
//         discount: 15,
//         category: "Earbuds",
//         imgUrl: "https://images.unsplash.com/photo-1627914801334-722a96934c02?auto=format&fit=crop&w=300&q=80",
//         description: "Rich sound for less. Custom-designed 12mm dynamic speaker drivers deliver rich, high-quality audio.",
//         satisfaction: "4.5/5"
//     },
//     {
//         id: "mc-023",
//         title: "Rode PodMic Cardioid Dynamic",
//         price: 9500,
//         discount: 0,
//         category: "Microphones",
//         imgUrl: "https://images.unsplash.com/photo-1557063673-0493e5bd3d13?auto=format&fit=crop&w=300&q=80",
//         description: "Broadcast-quality dynamic microphone optimized for podcasting. Rich, balanced sound.",
//         satisfaction: "4.8/5"
//     },
//     {
//         id: "hd-024",
//         title: "Logitech G733 LIGHTSPEED",
//         price: 11995,
//         discount: 15,
//         category: "Gaming Audio",
//         imgUrl: "https://images.unsplash.com/photo-1628236162359-21b790d56569?auto=format&fit=crop&w=300&q=80",
//         description: "Wireless gaming headset with suspension headband and Blue VO!CE mic technology.",
//         satisfaction: "4.6/5"
//     },
//     {
//         id: "sp-025",
//         title: "UE Wonderboom 3",
//         price: 7995,
//         discount: 5,
//         category: "Speakers",
//         imgUrl: "https://images.unsplash.com/photo-1614912803300-835694297316?auto=format&fit=crop&w=300&q=80",
//         description: "Ultraportable Bluetooth speaker with a surprisingly bigger 360-degree sound that's crisp and bassy.",
//         satisfaction: "4.7/5"
//     }
// ];