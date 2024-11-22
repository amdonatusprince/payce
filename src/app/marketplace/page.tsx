import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MarketplaceFilters } from '../components/marketplace/MarketplaceFilters';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { CategoryNav } from '../components/marketplace/CategoryNav';

export default function MarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pt-6 sm:pt-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Payce Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold">Payce Marketplace</h1>
          </div>
          <button className="btn-primary w-full sm:w-auto">List Product</button>
        </div>
      </div>

      <CategoryNav />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <MarketplaceFilters />
        </aside>
        
        <main className="flex-1">
          <ProductGrid />
        </main>
      </div>
    </div>
  );
} 