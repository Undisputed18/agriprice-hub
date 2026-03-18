'use client';

import { useState, useEffect } from 'react';
import AdminSideNav from '@/components/admin/AdminSideNav';
import AdminTopNav from '@/components/admin/AdminTopNav';
import StatsCard from '@/components/dashboard/StatsCard';
import UsersTable from '@/components/admin/UsersTable';
import PriceApprovalTable from '@/components/admin/PriceApprovalTable';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    farmerCount: 0,
    dealerCount: 0,
    officerCount: 0,
    pendingPrices: 0
  });
  const [loading, setLoading] = useState(true);

  const [priceSubmissions, setPriceSubmissions] = useState<any[]>([]);
  const [dealerSubmissions, setDealerSubmissions] = useState<any[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [dealerLoading, setDealerLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/admin/prices');
        if (response.ok) {
          const data = await response.json();
          setPriceSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error('Error fetching admin prices:', error);
      } finally {
        setPricesLoading(false);
      }
    };

    const fetchDealerSubmissions = async () => {
      try {
        const response = await fetch('/api/admin/dealer-submissions');
        if (response.ok) {
          const data = await response.json();
          setDealerSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error('Error fetching dealer submissions:', error);
      } finally {
        setDealerLoading(false);
      }
    };

    fetchStats();
    fetchPrices();
    fetchDealerSubmissions();
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'AgriPrice Admin Dashboard',
          description: 'Overview of key metrics and system performance.',
        };
      case 'users':
        return {
          title: 'User Management',
          description: 'Manage and monitor all users in the system.',
        };
      case 'market-officer':
        return {
          title: 'Market Officer Submissions',
          description: 'Review and approve price submissions from market officers.',
        };
      case 'agro-dealer':
        return {
          title: 'Agro-Dealer Submissions',
          description: 'Review and approve price submissions from agro-dealers.',
        };
      case 'settings':
        return {
          title: 'System Settings',
          description: 'Configure system settings and preferences.',
        };
      default:
        return {
          title: 'AgriPrice Admin Dashboard',
          description: 'Manage users, prices, and system settings for the agricultural marketplace.',
        };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSideNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <AdminTopNav onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-text-dark dark:text-text-light text-2xl md:text-4xl font-black leading-tight tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-text-secondary dark:text-text-secondary/80 text-base font-normal mt-1">
              {pageInfo.description}
            </p>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Users"
                value={stats.totalUsers.toString()}
                trend="+12.5%"
                trendDirection="up"
                trendLabel="from last month"
                icon="people"
                iconColor="text-primary"
              />
              <StatsCard
                title="Active Farmers"
                value={stats.farmerCount.toString()}
                trend="+8.2%"
                trendDirection="up"
                trendLabel="from last month"
                icon="agriculture"
                iconColor="text-green-600"
              />
              <StatsCard
                title="Agro-Dealers"
                value={stats.dealerCount.toString()}
                trend="+15.3%"
                trendDirection="up"
                trendLabel="from last month"
                icon="store"
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Price Updates"
                value={stats.pendingPrices.toString()}
                trend="-5.1%"
                trendDirection="down"
                trendLabel="pending approval"
                icon="price_change"
                iconColor="text-orange-500"
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <UsersTable />
            </div>
          )}

          {activeTab === 'market-officer' && (
            <div className="space-y-6">
              <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-text-dark dark:text-text-light text-lg font-bold">Market Officer Price Submissions</h3>
                    <p className="text-text-secondary text-xs mt-1">From Market Officers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-medium">
                      {priceSubmissions.filter(s => s.status === 'pending').length} Pending
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {pricesLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-light dark:border-border-dark">
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Product</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Market</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Price Change</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Submitted By</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-text-secondary text-sm">
                              No submissions found.
                            </td>
                          </tr>
                        ) : (
                          priceSubmissions.map((submission) => (
                            <tr key={submission.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark/50 transition-colors">
                              <td className="py-3 px-4">
                                <p className="text-text-dark dark:text-text-light text-sm font-medium">{submission.product}</p>
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">{submission.market}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-text-secondary text-sm line-through">KSh {submission.oldPrice?.toLocaleString()}</span>
                                  <span className="text-text-dark dark:text-text-light text-sm font-medium">KSh {submission.newPrice?.toLocaleString()}</span>
                                  <span className={`text-xs font-medium ${
                                    submission.newPrice > submission.oldPrice ? 'text-green-600' : 
                                    submission.newPrice < submission.oldPrice ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    {submission.newPrice > submission.oldPrice ? '+' : ''}
                                    {submission.oldPrice ? Math.round(((submission.newPrice - submission.oldPrice) / submission.oldPrice) * 100) : 0}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">{submission.submittedBy}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  submission.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {submission.status || 'pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {submission.status === 'pending' && (
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1">
                                      <span className="material-icons text-xs">check_circle</span>
                                      Verify
                                    </button>
                                    <button className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1">
                                      <span className="material-icons text-xs">cancel</span>
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agro-dealer' && (
            <div className="space-y-6">
              <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-text-dark dark:text-text-light text-lg font-bold">Agro-Dealer Price Submissions</h3>
                    <p className="text-text-secondary text-xs mt-1">From Agro-Dealers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-medium">
                      {dealerSubmissions.filter(s => s.status === 'pending').length} Pending
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {dealerLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-light dark:border-border-dark">
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Product</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Market</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Price Change</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Submitted By</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dealerSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-text-secondary text-sm">
                              No submissions found.
                            </td>
                          </tr>
                        ) : (
                          dealerSubmissions.map((submission) => (
                            <tr key={submission.id} className="border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark/50 transition-colors">
                              <td className="py-3 px-4">
                                <p className="text-text-dark dark:text-text-light text-sm font-medium">{submission.product}</p>
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">{submission.market}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-text-secondary text-sm line-through">KSh {submission.oldPrice?.toLocaleString()}</span>
                                  <span className="text-text-dark dark:text-text-light text-sm font-medium">KSh {submission.newPrice?.toLocaleString()}</span>
                                  <span className={`text-xs font-medium ${
                                    submission.newPrice > submission.oldPrice ? 'text-green-600' : 
                                    submission.newPrice < submission.oldPrice ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    {submission.newPrice > submission.oldPrice ? '+' : ''}
                                    {submission.oldPrice ? Math.round(((submission.newPrice - submission.oldPrice) / submission.oldPrice) * 100) : 0}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">{submission.submittedBy}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  submission.status === 'active' || submission.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {submission.status || 'pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {submission.status === 'pending' && (
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1">
                                      <span className="material-icons text-xs">check_circle</span>
                                      Approve
                                    </button>
                                    <button className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1">
                                      <span className="material-icons text-xs">cancel</span>
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-background-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
              <h2 className="text-text-dark dark:text-text-light text-xl font-bold mb-4">System Settings</h2>
              <p className="text-text-secondary dark:text-text-secondary/80">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}