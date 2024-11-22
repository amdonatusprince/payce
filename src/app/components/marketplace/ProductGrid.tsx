import { ProductCard } from './ProductCard';
import { dummyProducts } from '../../../lib/dummyData';

export const ProductGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dummyProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}; 