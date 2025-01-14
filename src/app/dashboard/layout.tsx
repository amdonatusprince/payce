import { DashboardSidebar } from '../components/layout/DashboardSidebar';
import { DashboardNavbar } from '../components/layout/DashboardNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 ml-16 sm:ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}