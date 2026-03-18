'use client';

import AdminSideNav from '@/components/admin/AdminSideNav';
import AdminTopNav from '@/components/admin/AdminTopNav';

export default function AdminPricesPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSideNav activeTab="market-officer" setActiveTab={() => {}} />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <AdminTopNav />
        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-text-dark dark:text-text-light text-4xl font-black leading-tight tracking-tight">
              Price Management
            </h1>
            <p className="text-text-secondary dark:text-text-secondary/80 text-base font-normal mt-1">
              Manage and monitor price submissions.
            </p>
          </div>
          <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
            <p className="text-text-secondary">
              This page is under construction. Please use the main dashboard for price management.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
