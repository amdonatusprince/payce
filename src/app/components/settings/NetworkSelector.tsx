'use client';

import Image from 'next/image';
import { useAppKitAccount } from "@reown/appkit/react";

export const NetworkSelector = () => {
  const { isConnected } = useAppKitAccount();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Supported Networks</h3>
      
      <div className="space-y-4">
        {/* Network Cards Container - Always Side by Side with better spacing */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* Solana Network Card */}
          <div className="bg-white rounded-xl border-2 p-4 md:p-5 w-full">
            <div className="flex items-start space-x-3 md:space-x-4">
              <div className="w-8 h-8 md:w-10 md:h-10 relative flex-shrink-0">
                <Image
                  src="/solana_logo.svg"
                  alt="Solana"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-base md:text-lg whitespace-nowrap">Solana</h4>
                <p className="hidden lg:block text-sm md:text-base text-gray-500 whitespace-normal">
                  High-performance blockchain
                </p>
              </div>
            </div>
          </div>

          {/* Base Network Card */}
          <div className="bg-white rounded-xl border-2 p-4 md:p-5 w-full">
            <div className="flex items-start space-x-3 md:space-x-4">
              <div className="w-8 h-8 md:w-10 md:h-10 relative flex-shrink-0">
                <Image
                  src="/base_logo.svg"
                  alt="Base"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-base md:text-lg whitespace-nowrap">Base</h4>
                <p className="hidden lg:block text-sm md:text-base text-gray-500 whitespace-normal">
                  Ethereum L2 solution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connect Wallet Section - Full Width */}
        <div className="bg-white rounded-lg border p-4 md:p-5">
          <div className="flex flex-col items-center text-center gap-4">
            {!isConnected && (
              <div>
                <p className="font-medium text-base md:text-lg">Connect Wallet</p>
                <p className="text-sm md:text-base text-gray-600">
                  Connect your wallet to interact with both networks
                </p>
              </div>
            )}
            <div className={`rounded-lg px-4 py-2 ${isConnected ? 'bg-purple-50' : ''}`}>
              <appkit-button />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
