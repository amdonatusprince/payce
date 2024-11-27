import { Product } from "@/types";

export const dummyProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Website Template',
    description: 'Modern and responsive website template for businesses',
    price: 27,
    currency: 'USDC',
    type: 'digital',
    image: '/assets/digitaldreams.jpg',
    rating: 4.8,
    seller: {
      id: '1',
      name: 'Jane Writes',
      avatar: '/assets/profiles/Jane-writes.jpg',
      rating: 4.9
    }
  },

  {
    id: '2',
    title: 'Premium Website Template',
    description: 'Modern and responsive website template for businesses',
    price: 99,
    currency: 'USDC',
    type: 'service',
    image: '/assets/digitaldreams.jpg',
    rating: 4.8,
    seller: {
      id: '1',
      name: 'Digital Studios',
      avatar: '/assets/profiles/Jane-writes.jpg',
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