// app/agrodealer/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';
import ChatModal from '@/components/ChatModal';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  original_price?: number;
  stock: number;
  unit: string;
  images: string[];
  status: 'active' | 'out_of_stock' | 'discontinued';
  created_at: string;
}

interface DealerProfile {
  business_name?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { full_name: string };
  product?: { id: string, name: string };
}

export default function AgroDealerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState({ id: '', name: '', productId: '', productName: '' });

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Fetch dealer profile, products and messages
  useEffect(() => {
    Promise.all([fetchProfile(), fetchProducts(), fetchUnreadMessages()]);
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/dealer/profile');
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/dealer/products');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        // Filter for messages received by the current user that are unread
        const unread = (data.messages || []).filter((m: any) => 
          m.receiver_id === user?.id && !m.is_read
        );
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleOpenConversation = async (msg: Message) => {
    // Set active chat
    setActiveChat({
      id: msg.sender_id,
      name: msg.sender?.full_name || 'Farmer',
      productId: msg.product?.id || '',
      productName: msg.product?.name || ''
    });
    
    // Close inbox modal and open chat modal
    setIsMessageModalOpen(false);
    setIsChatOpen(true);
    
    // Mark as read in DB
    try {
      await fetch(`/api/messages/${msg.id}/read`, { method: 'POST' });
      // Update local unread list
      setUnreadMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAsReadOnly = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    try {
      setUnreadMessages(prev => prev.filter(m => m.id !== messageId));
      await fetch(`/api/messages/${messageId}/read`, { method: 'POST' });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Calculate real stats from products
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  
  // Get recent products (last 5)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Get products by category
  const categoryCount = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Mock data for charts (in real app, this would come from sales data)
  const weeklyData = [65, 45, 75, 35, 55, 40, 70];
  const monthlyData = [450, 520, 480, 610, 590, 670, 720, 690, 750, 820, 890, 950];
  const weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = selectedPeriod === 'week' ? weeklyData : monthlyData;
  const chartLabels = selectedPeriod === 'week' ? weeks : months;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['dealer']}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['dealer']}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                    <span className="text-xl md:text-2xl">📊</span>
                  </div>
                  <div>
                    <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent truncate max-w-[150px] md:max-w-none">
                      {profile?.business_name || 'Agro-Supplier'}
                    </h1>
                    <span className="text-xs md:text-sm text-green-600 font-medium">Dealer Dashboard</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-6">
                  <button 
                    onClick={() => setIsMessageModalOpen(true)}
                    className="relative p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl md:text-2xl">🔔</span>
                    {unreadMessages.length > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 md:h-5 md:w-5 bg-red-500 text-white text-[9px] md:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadMessages.length}
                      </span>
                    )}
                  </button>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">Welcome back,</p>
                    <p className="text-sm md:text-base font-semibold text-gray-800">{profile?.full_name || user?.full_name || 'Dealer'}</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center text-white font-bold text-base md:text-lg">
                    {profile?.full_name?.charAt(0) || user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'D'}
                  </div>
                </div>
              </div>
          </div>
        </header>

        {/* Dealer Info Banner */}
        {profile && (
          <div className="bg-white border-b border-green-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📞</span>
                  <span>{profile.phone_number || 'Add phone number'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📧</span>
                  <span>{profile.email || user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
              <div className="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
                <h3 className="font-bold flex items-center gap-2">
                  <span>📩</span>
                  Farmer Inquiries
                </h3>
                <button onClick={() => setIsMessageModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {unreadMessages.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <p className="text-4xl mb-3">📭</p>
                    <p>No new messages</p>
                  </div>
                ) : (
                  unreadMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      onClick={() => handleOpenConversation(msg)}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition-colors group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                          Inquiry from {msg.sender?.full_name || 'Farmer'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      {msg.product && (
                        <p className="text-[10px] font-semibold text-emerald-600 mb-1">
                          Product: {msg.product.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 mb-3 line-clamp-2">{msg.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-green-600 font-bold group-hover:underline">Click to Reply</span>
                        <button 
                          onClick={(e) => handleMarkAsReadOnly(e, msg.id)}
                          className="text-[10px] text-gray-400 hover:text-green-600 font-medium flex items-center gap-1"
                        >
                          <span>✓</span> Mark as Read
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => setIsMessageModalOpen(false)}
                  className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Modal */}
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          receiverId={activeChat.id}
          receiverName={activeChat.name}
          productId={activeChat.productId}
          productName={activeChat.productName}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Overview */}
          <div className="relative mb-8">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
              <p className="text-gray-600 mt-2">Monitor your inventory and business performance at a glance.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{totalProducts}</p>
              <p className="text-sm text-gray-500">Products in Inventory</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {products.filter(p => p.status === 'active').length} Active
                </span>
              </div>
            </div>

            {/* Total Value Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Value</span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">KSh {totalValue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Inventory Value</p>
              <div className="mt-3 text-xs text-green-600">
                <span>Average: KSh {totalProducts ? Math.round(totalValue / totalProducts).toLocaleString() : 0} per item</span>
              </div>
            </div>

            {/* Low Stock Alerts Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Alert</span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{lowStockCount}</p>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span>Need restocking soon</span>
              </div>
            </div>

            {/* Out of Stock Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🛑</span>
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Critical</span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{outOfStockCount}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <div className="mt-3 text-xs text-red-600">
                <span>Requires immediate attention</span>
              </div>
            </div>
          </div>

          {/* Category Distribution and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                Categories
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryCount).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800">{count}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round((count / totalProducts) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                  Sales Analytics
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPeriod('week')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      selectedPeriod === 'week'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('month')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      selectedPeriod === 'month'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {chartData.map((value, i) => {
                  const max = Math.max(...chartData);
                  const height = (value / max) * 180;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full flex justify-center">
                        <span className="absolute -top-6 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-sm">
                          KSh {value}k
                        </span>
                      </div>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-300 group-hover:from-green-600 group-hover:to-emerald-500 cursor-pointer"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-xs text-gray-500 font-medium">{chartLabels[i]}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} sales performance
              </p>
            </div>
          </div>

          {/* Recent Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Recent Products
              </h2>
              <Link href="/agrodealer/inventory" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                View All ({totalProducts})
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 overflow-x-auto">
              <table className="w-full min-w-[800px] md:min-w-0">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                              📦
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">{product.name}</span>
                            {product.description && (
                              <span className="text-xs text-gray-500 line-clamp-1">{product.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : product.status === 'out_of_stock'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            product.status === 'active' 
                              ? 'bg-green-500' 
                              : product.status === 'out_of_stock'
                              ? 'bg-red-500'
                              : 'bg-gray-500'
                          }`}></span>
                          {product.status === 'active' ? 'Active' : 
                           product.status === 'out_of_stock' ? 'Out of Stock' : 'Discontinued'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            product.stock === 0 ? 'text-red-600' : 
                            product.stock < 20 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {product.stock} {product.unit}
                          </span>
                          {product.stock < 20 && product.stock > 0 && (
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">KSh {product.price.toLocaleString()}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="ml-2 text-xs text-gray-400 line-through">
                            KSh {product.original_price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          KSh {(product.price * product.stock).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recentProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first product.</p>
                  <Link
                    href="/agrodealer/inventory/add"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <span>➕</span>
                    Add Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}