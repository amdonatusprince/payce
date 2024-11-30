import { Product } from "@/types";

export const dummyProducts: Product[] = [

  {
    id: '1',
    title: 'Pro Social Media Mastery',
    description: 'Complete guide to growing your brand on social platforms',
    price: 79,
    currency: 'USDC',
    type: 'digital',
    image: '/assets/profiles/Jane-writes.jpg',
    rating: 4.8,
    seller: {
      name: 'Jane Writes',
      avatar: '/assets/profiles/Jane-writes.jpg',
      rating: 4.7,
      address: '0x03E15BD74ee8AdBef0C58584fc6d2b859Cd053E6'
    }
  },

  {
    id: '3',
    title: 'Custom Logo Design Service',
    description: 'Professional branding and logo design with unlimited revisions',
    price: 149,
    currency: 'USDC',
    type: 'service',
    image: '/assets/logo-design.jpg',
    rating: 4.7,
    seller: {
      name: 'Creative Minds Studio',
      avatar: '/assets/digitaldreams.jpg',
      rating: 4.8,
      address: '0x03E15BD74ee8AdBef0C58584fc6d2b859Cd053E6'
    }
  },
  {
    id: '2',
    title: 'Handcrafted Wooden Watch',
    description: 'Unique handmade timepiece crafted from sustainable bamboo',
    price: 199,
    currency: 'USDC',
    type: 'physical',
    image: '/assets/watch.png',
    rating: 4.9,
    seller: {
      name: 'EcoWood Crafts',
      avatar: '/assets/watch-shop.jpg',
      rating: 4.9,
      address: '0x03E15BD74ee8AdBef0C58584fc6d2b859Cd053E6'
    }
  },
  // Add more dummy products...
];

export const dummyTransactions = [
  {
    id: '1',
    type: 'incoming',
    amount: 1500,
    currency: 'USDC',
    description: 'Payment for design work',
    date: new Date(),
    status: 'completed',
    from: '0x1234...5678'
  },
  // Add more dummy transactions...
]; 