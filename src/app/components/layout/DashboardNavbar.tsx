"use client"
import { useState } from 'react';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../../public/payceLogo.png';
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";

export const DashboardNavbar = () => {
  const [notifications] = useState(5);
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Get network display name
  const networkName = caipNetwork?.name?.toLowerCase().includes('devnet') 
    ? 'Devnet' 
    : 'Mainnet';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="Logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-bold">Payce</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
            <BellIcon className="w-6 h-6" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {notifications}
              </span>
            )}
          </button>

          {isConnected && (
            <div className="flex items-center gap-2">
              {/* Network Badge - Always visible */}
              <div className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium whitespace-nowrap">
                {networkName}
              </div>
              
              {/* Address - Responsive */}
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium">
                  {formatAddress(address)}
                </div>
                <div className="text-xs text-gray-500">
                  Connected
                </div>
              </div>

              {/* Avatar - Always visible */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs">
                  {address ? address.slice(0, 2) : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 