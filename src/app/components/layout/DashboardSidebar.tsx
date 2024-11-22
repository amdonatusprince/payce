"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon },
  { name: 'Talents', href: '/talents', icon: UsersIcon },
  { name: 'Marketplace', href: '/marketplace', icon: UserGroupIcon },
  { name: 'Account Statement', href: '/dashboard/statement', icon: DocumentChartBarIcon },
  // { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white border-r">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}; 