"use client"
import { useState } from 'react';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../../public/payceLogo.png';

export const DashboardNavbar = () => {
  const [notifications] = useState(5); // Example notification count

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
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

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-500">john@payce.xyz</div>
            </div>
            <button className="w-8 h-8 rounded-full bg-gray-200">
              <Image className="w-full h-full rounded-full"
              src="/profile.jpg"
              alt="Logo"
              width={32}
              height={32}
              priority
            />
              
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 