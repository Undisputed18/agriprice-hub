'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/contexts/AuthContext';

interface AdminSideNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
  { id: 'users', label: 'User Management', icon: 'people' },
  { id: 'market-officer', label: 'Market Officer', icon: 'badge' },
  { id: 'agro-dealer', label: 'Agro-Dealer', icon: 'storefront' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function AdminSideNav({ activeTab, setActiveTab }: AdminSideNavProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-background-light dark:bg-background-dark border-r border-border-light dark:border-border-dark flex flex-col h-screen sticky top-0">
      <div className="p-6 flex flex-col h-full">
        <div className="flex flex-col mb-8">
          <h1 className="text-text-dark dark:text-text-light text-base font-bold uppercase tracking-wider">
            Admin Panel
          </h1>
          <p className="text-text-secondary dark:text-text-secondary/80 text-xs font-normal">AgriPrice Management</p>
        </div>
        <nav className="flex flex-col gap-2 grow">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'hover:bg-surface-light dark:hover:bg-surface-dark text-text-dark dark:text-text-light/80'
                }`}
              >
                <span className={`material-icons text-xl ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                  {item.icon}
                </span>
                <p className="text-sm font-medium">{item.label}</p>
              </button>
            );
          })}
        </nav>
        <div className="pt-6 border-t border-border-light dark:border-border-dark">
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400"
            >
              <span className="material-icons text-xl">logout</span>
              <p className="text-sm font-medium">Logout</p>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
