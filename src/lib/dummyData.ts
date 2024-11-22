import { Product } from "@/types";

export const dummyProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Website Template',
    description: 'Modern and responsive website template for businesses',
    price: 99,
    currency: 'USDC',
    type: 'digital',
    image: '/images/products/template1.jpg',
    rating: 4.8,
    seller: {
      id: '1',
      name: 'Digital Studios',
      avatar: '/images/avatars/seller1.jpg',
      rating: 4.9
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