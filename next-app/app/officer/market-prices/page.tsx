'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';

interface MarketPrice {
  id: string;
  commodity: string;
  price: number;
  price_formatted: string;
  unit: string;
  market: string;
  market_location: string;
  market_type?: string;
  market_profile_id?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  submitted_date: string;
  submitted_by?: string;
  submitted_by_name?: string;
  status: 'approved' | 'pending' | 'rejected';
  notes?: string;
}

interface MarketProfile {
  id: string;
  market_name: string;
  location: string;
  market_type: string;
  full_name?: string;
}

interface Stats {
  totalPrices: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  averagePrice: number;
  marketsCount: number;
  commoditiesCount: number;
  regionsCount: number;
}

function OfficerMarketPricesPage() {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketProfile, setMarketProfile] = useState<MarketProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalPrices: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    averagePrice: 0,
    marketsCount: 0,
    commoditiesCount: 0,
    regionsCount: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<MarketPrice | null>(null);
  const [newPrice, setNewPrice] = useState({
    commodity: '',
    price: '',
    unit: '90kg bag',
    market: '',
    location: '',
    notes: ''
  });

  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([
    { id: 'all', name: 'All Regions' }
  ]);

  const [commodities, setCommodities] = useState<Array<{ id: string; name: string }>>([
    { id: 'all', name: 'All Commodities' }
  ]);

  const [markets, setMarkets] = useState<Array<{ id: string; name: string; location: string }>>([]);

  const units = [
    '90kg bag',
    '50kg bag',
    'kg',
    'tonne',
    'piece',
    'bunch',
    'crate'
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ];

  // Load data when component mounts
  useEffect(() => {
    loadMarketData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    filterPrices();
  }, [selectedRegion, selectedCommodity, selectedMarket, selectedStatus, marketPrices]);

  const loadMarketData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch officer profile
      try {
        const profileRes = await fetch('/api/officer/profile');
        const profileData = await profileRes.json();
        
        if (profileData.profile) {
          setMarketProfile({
            id: profileData.profile.id,
            market_name: profileData.profile.market_name || 'Your Market',
            location: profileData.profile.location || 'Unknown',
            market_type: profileData.profile.market_type || 'retail',
            full_name: profileData.profile.full_name
          });
        }
      } catch (profileErr) {
        console.error('Error loading profile:', profileErr);
      }

      // Build API URL
      let apiUrl = '/api/officer/prices?limit=500&includeApproved=true';
      
      if (selectedStatus !== 'all') {
        apiUrl += `&status=${selectedStatus}`;
      }
      
      const pricesRes = await fetch(apiUrl);
      const pricesData = await pricesRes.json();
      
      if (pricesData.success) {
        const prices = pricesData.data?.prices || [];
        
        // Use prices directly as they are already formatted by the API
        // This ensures consistency with the Price Management page
        const formattedPrices = prices.map((p: any) => {
          let formattedDate = 'Date unknown';
          try {
            if (p.submitted_date) {
              formattedDate = new Date(p.submitted_date).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
          } catch (e) {
            console.error('Error formatting date:', e);
          }
          
          return {
            ...p,
            submitted_date: formattedDate
          };
        }) as MarketPrice[];
        
        setMarketPrices(formattedPrices);

        // Extract unique regions
        const uniqueRegions = [...new Set(formattedPrices
          .map((p: MarketPrice) => p.market_location)
          .filter(location => 
            location && 
            location !== 'Unknown Region' && 
            location !== 'Unknown' && 
            location !== 'Kenya' &&
            location !== 'Market' &&
            location !== 'Location pending'
          )
        )];
        
        setRegions([
          { id: 'all', name: 'All Regions' },
          ...uniqueRegions.map(r => ({ 
            id: r.toLowerCase().replace(/\s+/g, '-'), 
            name: r 
          }))
        ]);

        // Extract unique commodities
        const uniqueCommodities = [...new Set(formattedPrices
          .map((p: MarketPrice) => p.commodity)
          .filter(c => c && c !== 'Unknown')
        )];
        
        setCommodities([
          { id: 'all', name: 'All Commodities' },
          ...uniqueCommodities.map(c => ({ 
            id: c.toLowerCase().replace(/\s+/g, '-'), 
            name: c.charAt(0).toUpperCase() + c.slice(1) 
          }))
        ]);

        // Extract unique markets
        const uniqueMarkets = [...new Set(formattedPrices
          .map((p: MarketPrice) => {
            if (p.market && 
                p.market !== 'Unknown Market' && 
                p.market !== 'Market' && 
                p.market !== 'Unknown' &&
                p.market !== 'Market information pending') {
              return JSON.stringify({
                id: p.market.toLowerCase().replace(/\s+/g, '-'),
                name: p.market,
                location: p.market_location
              });
            }
            return null;
          })
          .filter(Boolean)
        )].map(str => JSON.parse(str as string));

        setMarkets(uniqueMarkets);

        // Calculate stats
        calculateStats(formattedPrices);
      } else {
        setError('Failed to load prices: ' + (pricesData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      setError('Failed to load market prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (prices: MarketPrice[]) => {
    if (prices.length === 0) {
      setStats({
        totalPrices: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        averagePrice: 0,
        marketsCount: 0,
        commoditiesCount: 0,
        regionsCount: 0
      });
      return;
    }

    const totalPrices = prices.length;
    const approvedCount = prices.filter(p => p.status === 'approved').length;
    const pendingCount = prices.filter(p => p.status === 'pending').length;
    const rejectedCount = prices.filter(p => p.status === 'rejected').length;
    
    const approvedPrices = prices.filter(p => p.status === 'approved');
    const avgPrice = approvedPrices.length > 0 
      ? approvedPrices.reduce((sum, p) => sum + p.price, 0) / approvedPrices.length
      : 0;
    
    const uniqueMarkets = new Set(
      prices
        .map(p => p.market)
        .filter(m => m && m !== 'Unknown Market' && m !== 'Market' && m !== 'Market information pending')
    ).size;
    
    const uniqueRegions = new Set(
      prices
        .map(p => p.market_location)
        .filter(r => r && r !== 'Unknown Region' && r !== 'Kenya' && r !== 'Location pending')
    ).size;
    
    const uniqueCommodities = new Set(
      prices
        .map(p => p.commodity)
        .filter(c => c && c !== 'Unknown')
    ).size;

    setStats({
      totalPrices,
      approvedCount,
      pendingCount,
      rejectedCount,
      averagePrice: Math.round(avgPrice),
      marketsCount: uniqueMarkets,
      commoditiesCount: uniqueCommodities,
      regionsCount: uniqueRegions
    });
  };

  const filterPrices = () => {
    let filtered = [...marketPrices];

    if (selectedRegion !== 'all') {
      const regionFilter = selectedRegion.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter(p => 
        p.market_location.toLowerCase().includes(regionFilter)
      );
    }

    if (selectedCommodity !== 'all') {
      const commodityFilter = selectedCommodity.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter(p => 
        p.commodity.toLowerCase().includes(commodityFilter)
      );
    }

    if (selectedMarket !== 'all') {
      const marketFilter = selectedMarket.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter(p => 
        p.market.toLowerCase().includes(marketFilter)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    setFilteredPrices(filtered);
  };

  const handleApprovePrice = async (id: string) => {
    try {
      const response = await fetch(`/api/officer/prices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await response.json();

      if (data.success) {
        loadMarketData();
        alert('Price approved successfully!');
      } else {
        alert('Failed to approve price: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving price:', error);
      alert('Failed to approve price');
    }
  };

  const handleRejectPrice = async (id: string) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    
    try {
      const response = await fetch(`/api/officer/prices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: reason || 'No reason provided'
        })
      });

      const data = await response.json();

      if (data.success) {
        loadMarketData();
        alert('Price rejected successfully.');
      } else {
        alert('Failed to reject price: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting price:', error);
      alert('Failed to reject price');
    }
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!marketProfile?.id) {
      alert('Please set up your market profile first before submitting prices.');
      return;
    }
    
    try {
      const response = await fetch('/api/officer/prices/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_profile_id: marketProfile.id,
          commodity: newPrice.commodity.toLowerCase(),
          price: parseFloat(newPrice.price),
          unit: newPrice.unit,
          submitted_date: new Date().toISOString().split('T')[0],
          notes: newPrice.notes || null
        })
      });

      const data = await response.json();

      if (data.success || data.submission) {
        loadMarketData();
        setShowAddForm(false);
        setNewPrice({
          commodity: '',
          price: '',
          unit: '90kg bag',
          market: '',
          location: '',
          notes: ''
        });
        alert('Price submitted successfully!');
      } else {
        alert('Failed to add price: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding price:', error);
      alert('Failed to add price');
    }
  };

  const handleEditPrice = (price: MarketPrice) => {
    setEditingPrice(price);
    setNewPrice({
      commodity: price.commodity,
      price: price.price.toString(),
      unit: price.unit,
      market: price.market,
      location: price.market_location,
      notes: price.notes || ''
    });
    setShowAddForm(true);
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrice) {
      try {
        const response = await fetch(`/api/officer/prices/${editingPrice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodity: newPrice.commodity.toLowerCase(),
            price: parseFloat(newPrice.price),
            unit: newPrice.unit,
            date: new Date().toISOString().split('T')[0],
            notes: newPrice.notes
          })
        });

        const data = await response.json();

        if (data.success) {
          loadMarketData();
          setShowAddForm(false);
          setEditingPrice(null);
          setNewPrice({
            commodity: '',
            price: '',
            unit: '90kg bag',
            market: '',
            location: '',
            notes: ''
          });
        } else {
          alert('Failed to update price: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error updating price:', error);
        alert('Failed to update price');
      }
    }
  };

  const handleDeletePrice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this price entry?')) {
      try {
        const response = await fetch(`/api/officer/prices/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          loadMarketData();
        } else {
          alert('Failed to delete price: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting price:', error);
        alert('Failed to delete price');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval', icon: '⏳' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: '✗' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getMarketDisplay = (market: string) => {
    if (!market || market === 'Unknown Market' || market === 'Market' || market === 'Market information pending') {
      return '';
    }
    return market;
  };

  const getLocationDisplay = (location: string) => {
    if (!location || location === 'Unknown Region' || location === 'Kenya' || location === 'Location pending') {
      return '';
    }
    return location;
  };

  const getTrendIcon = (price: number, prevPrice?: number) => {
    if (!prevPrice) return '📊';
    const change = ((price - prevPrice) / prevPrice) * 100;
    if (change > 1) return '📈';
    if (change < -1) return '📉';
    return '📊';
  };

  const getTrendColor = (price: number, prevPrice?: number) => {
    if (!prevPrice) return 'text-yellow-600';
    const change = ((price - prevPrice) / prevPrice) * 100;
    if (change > 1) return 'text-green-600';
    if (change < -1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getTrendChange = (price: number, prevPrice?: number) => {
    if (!prevPrice) return 0;
    return ((price - prevPrice) / prevPrice) * 100;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['officer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading market prices...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['officer']}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Link href="/officerdashboard" 
                      className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-colors">
                  <span className="text-2xl">🌾</span>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    Market Prices
                  </h1>
                  <span className="text-sm text-green-600 font-medium">Officer - Manage & Approve Prices</span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome,</p>
                  <p className="text-base font-semibold text-gray-800">{user?.full_name || user?.email || 'User'}</p>
                </div>
                <Link 
                  href="/officerdashboard"
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center text-white font-bold text-lg hover:from-green-500 hover:to-emerald-600 transition-colors"
                >
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Breadcrumb */}
          <div className="mb-6 flex items-center space-x-2 text-sm">
            <Link href="/officerdashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Market Prices</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={loadMarketData}
                className="mt-2 text-sm text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Market Profile Card */}
          {marketProfile && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl text-white">🏪</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Your Market</p>
                    <h3 className="font-bold text-green-800">{marketProfile.market_name}</h3>
                    <p className="text-xs text-green-600">{marketProfile.location} • {marketProfile.market_type} market</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-700">Officer</p>
                  <p className="text-sm font-semibold text-green-800">{marketProfile.full_name || user?.full_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 col-span-1">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.totalPrices}</p>
              <p className="text-xs text-gray-600">Total Submissions</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
              </div>
              <p className="text-xl font-bold text-green-600">{stats.approvedCount}</p>
              <p className="text-xs text-gray-600">Approved</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
              </div>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingCount}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">✗</span>
                </div>
              </div>
              <p className="text-xl font-bold text-red-600">{stats.rejectedCount}</p>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">💰</span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">KES {stats.averagePrice.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Avg Price</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">🏪</span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.marketsCount}</p>
              <p className="text-xs text-gray-600">Markets</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🌽</span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.commoditiesCount}</p>
              <p className="text-xs text-gray-600">Commodities</p>
            </div>
          </div>

          {/* Header with Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Price Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add, edit, approve, and manage commodity prices
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingPrice(null);
                setNewPrice({
                  commodity: '',
                  price: '',
                  unit: '90kg bag',
                  market: '',
                  location: '',
                  notes: ''
                });
              }}
              className="mt-4 md:mt-0 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>➕</span>
              {showAddForm ? 'Cancel' : 'Add New Price'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPrice ? 'Edit Price Entry' : 'Add New Market Price'}
                </h3>
              </div>
              <form onSubmit={editingPrice ? handleUpdatePrice : handleAddPrice} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Maize"
                      value={newPrice.commodity}
                      onChange={(e) => setNewPrice({...newPrice, commodity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="4200"
                      value={newPrice.price}
                      onChange={(e) => setNewPrice({...newPrice, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={newPrice.unit}
                      onChange={(e) => setNewPrice({...newPrice, unit: e.target.value})}
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Additional details"
                      value={newPrice.notes}
                      onChange={(e) => setNewPrice({...newPrice, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingPrice(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    {editingPrice ? 'Update Price' : 'Add Price'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              {commodities.map(commodity => (
                <option key={commodity.id} value={commodity.id}>{commodity.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                loadMarketData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="flex items-center justify-end text-sm text-gray-500">
              <span>Showing {filteredPrices.length} of {marketPrices.length} submissions</span>
            </div>
          </div>

          {/* Market Prices Grid */}
          {filteredPrices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrices.map((price, index) => {
                const prevPrice = index < filteredPrices.length - 1 ? filteredPrices[index + 1].price : undefined;
                const trendChange = getTrendChange(price.price, prevPrice);
                
                return (
                  <div 
                    key={price.id} 
                    className={`bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-shadow ${
                      price.status === 'approved' ? 'border-green-200' :
                      price.status === 'pending' ? 'border-yellow-300' :
                      price.status === 'rejected' ? 'border-red-300' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-800">
                              {price.commodity.charAt(0).toUpperCase() + price.commodity.slice(1)}
                            </h3>
                            {getStatusBadge(price.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {getMarketDisplay(price.market)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getLocationDisplay(price.market_location)}
                          </p>
                          {price.submitted_by_name && (
                            <p className="text-xs text-gray-400 mt-1">Reported by: {price.submitted_by_name}</p>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${getTrendColor(price.price, prevPrice)} flex items-center gap-1`}>
                          {getTrendIcon(price.price, prevPrice)}
                          {trendChange !== 0 && (trendChange > 0 ? '+' : '')}{trendChange.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900">{price.price_formatted}</div>
                        <div className="text-sm text-gray-500">per {price.unit}</div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">🕐</span>
                          <span>Submitted: {price.submitted_date}</span>
                        </div>
                        {price.notes && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📝</span>
                            <span className="text-xs text-gray-500">{price.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Officer Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-end gap-2">
                        {price.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePrice(price.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center gap-1"
                              title="Approve"
                            >
                              <span>✓</span> Approve
                            </button>
                            <button
                              onClick={() => handleRejectPrice(price.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
                              title="Reject"
                            >
                              <span>✗</span> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEditPrice(price)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePrice(price.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No prices found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {selectedStatus !== 'all' 
                  ? `No ${selectedStatus} price submissions found. Try changing your filters.` 
                  : 'No price entries found. Add your first price using the button above.'}
              </p>
              <button
                onClick={loadMarketData}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <span>🔄</span>
                Refresh
              </button>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 text-green-500 text-xl">ℹ️</div>
              <div className="flex-1">
                <h5 className="text-sm font-medium text-green-800">Officer Access</h5>
                <p className="text-sm text-green-700 mt-1">
                  You have full access to add, edit, approve, and manage market prices.
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> Approved
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Pending
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span> Rejected
                  </span>
                </div>
                {marketPrices.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Showing {filteredPrices.length} of {marketPrices.length} submissions • Last updated: {new Date().toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default OfficerMarketPricesPage;