'use client';

import { useState, useEffect } from 'react';
import { Product } from '../../../types';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PaymentWidget = dynamic(
  () => import('@requestnetwork/payment-widget/react'),
  { ssr: false }
);

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (showPaymentModal) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showPaymentModal]);

  const handlePaymentSuccess = (request: any) => {
    console.log('Payment successful:', request);
    setShowPaymentModal(false);
    setPaymentStatus('success');
    setTimeout(() => setPaymentStatus(null), 3000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
    setTimeout(() => setPaymentStatus(null), 3000);
  };

  return (
    <>
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
            <button 
              className="btn-primary"
              onClick={() => setShowPaymentModal(true)}
            >
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Complete Purchase</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <PaymentWidget
                sellerInfo={{
                  name: product.seller.name,
                }}
                productInfo={{
                  name: product.title,
                  description: product.description,
                  image: product.image
                }}
                amountInUSD={product.price}
                sellerAddress={product.seller.address}
                supportedCurrencies={['ETH-sepolia-sepolia']}
                onPaymentSuccess={handlePaymentSuccess}
                persistRequest={true}
                onError={handlePaymentError}
                enablePdfReceipt={true}
                enableRequestScanLink={true}
                feeAmountInUSD={product.price * 0.005}
                feeAddress="0x546A5cB5c0AdD53efbC60000644AA70204B20576"
              />
            )}
          </div>
        </div>
      )}

      {paymentStatus && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`${
            paymentStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
          } p-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in`}>
            {paymentStatus === 'success' ? (
              <>
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-green-800 font-medium">Payment Successful!</h3>
                  <p className="text-green-600 text-sm">Your transaction has been completed.</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">Payment Failed</h3>
                  <p className="text-red-600 text-sm">There was an error processing your payment.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 