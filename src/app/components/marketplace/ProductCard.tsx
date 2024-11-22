import { Product } from '../../../types';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover rounded-t-xl"
        />
        <span className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {product.type}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-semibold">
              {product.price} {product.currency}
            </span>
          </div>
          <button className="btn-primary">
            Purchase
          </button>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            {product.seller.name}
          </div>
          <div className="flex items-center">
            ★ {product.rating}
          </div>
        </div>
      </div>
    </div>
  );
}; 