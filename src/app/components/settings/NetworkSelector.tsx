'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { modal } from '@/context/AppKitProvider';

type Network = 'Solana' | 'Base';

interface NetworkOption {
  id: Network;
  name: string;
  icon: string;
  description: string;
}



export const NetworkSelector = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('Solana');

  return (
    <div className="space-y-4">
      {/* Network Selection Tabs - Mashed together on small screens */}
      <div className="flex rounded-lg border-2 border-gray-200 p-1 space-x-1">
        {/* Solana Option */}
        <button
          onClick={() => setSelectedNetwork('Solana')}
          className={`relative flex-1 flex items-center justify-center p-2 sm:p-3 rounded-md transition-all ${
            selectedNetwork === 'Solana'
              ? 'bg-primary-50 border-2 border-primary-200'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 relative flex-shrink-0">
              <Image
                src="/solana_logo.svg"
                alt="Solana"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className={`font-medium text-sm sm:text-base ${
                selectedNetwork === 'Solana' ? 'text-primary-900' : 'text-gray-900'
              }`}>Solana</span>
              <span className="hidden sm:block text-xs text-gray-500">High-performance blockchain</span>
            </div>
          </div>
          <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 transition-colors ${
            selectedNetwork === 'Solana'
              ? 'border-primary-600 bg-primary-600'
              : 'border-gray-300 bg-white'
          }`}>
            {selectedNetwork === 'Solana' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>
        </button>

        {/* Base Option */}
        <button
          onClick={() => setSelectedNetwork('Base')}
          className={`relative flex-1 flex items-center justify-center p-2 sm:p-3 rounded-md transition-all ${
            selectedNetwork === 'Base'
              ? 'bg-primary-50 border-2 border-primary-200'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 relative flex-shrink-0">
              <Image
                src="/base_logo.svg"
                alt="Base"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className={`font-medium text-sm sm:text-base ${
                selectedNetwork === 'Base' ? 'text-primary-900' : 'text-gray-900'
              }`}>Base</span>
              <span className="hidden sm:block text-xs text-gray-500">Ethereum L2 solution</span>
            </div>
          </div>
          <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 transition-colors ${
            selectedNetwork === 'Base'
              ? 'border-primary-600 bg-primary-600'
              : 'border-gray-300 bg-white'
          }`}>
            {selectedNetwork === 'Base' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Connect Wallet Section */}
      <div className="border rounded-lg bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
          <div>
            {/* <p className="font-medium text-sm sm:text-base">Connect Wallet</p> */}
            <p className="text-xs sm:text-sm text-gray-600">
              Connect your {selectedNetwork} wallet to continue
            </p>
          </div>
          {selectedNetwork === 'Base' ? (
            <appkit-button/>
          ) : (
            <appkit-button />
          )}
        </div>
      </div>
    </div>
  );
};
