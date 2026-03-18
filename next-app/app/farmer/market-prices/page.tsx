// app/farmer/market-prices/page.tsx
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
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  submitted_date: string;
  submitted_by_name?: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface Region {
  id: string;
  name: string;
}

interface Commodity {
  id: string;
  name: string;
}

interface Market {
  id: string;
  name: string;
  location: string;
}

// Skeleton loader component for better UX
const PriceSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-2/3">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-12"></div>
    </div>
    <div className="mb-4">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
  </div>
);

export default function FarmerMarketPricesPage() {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [regions, setRegions] = useState<Region[]>([
    { id: 'all', name: 'All Regions' }
  ]);

  const [commodities, setCommodities] = useState<Commodity[]>([
    { id: 'all', name: 'All Commodities' }
  ]);

  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    loadMarketPrices();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [selectedRegion, selectedCommodity, selectedMarket, searchQuery, marketPrices]);

  const loadMarketPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all prices from the officer prices API (which supports farmers seeing all prices via includeAll)
      const response = await fetch('/api/officer/prices?limit=500&includeAll=true');
      const data = await response.json();
      
      if (data.success) {
        const prices = data.data?.prices || [];
        
        // Use prices directly as they are already formatted by the API
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
        setLastUpdated(new Date());

        // Extract unique regions
        const uniqueRegions = [...new Set(formattedPrices
          .map((p: MarketPrice) => p.market_location)
          .filter(location => 
            location && 
            location !== 'Unknown Region' && 
            location !== 'Unknown' && 
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
      } else {
        setError('Failed to load market prices: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading market prices:', error);
      setError('Failed to load market prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: '⏳' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: '✗' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const filterPrices = () => {
    let filtered = [...marketPrices];

    if (selectedRegion !== 'all') {
      const regionFilter = selectedRegion.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter((p: MarketPrice) => 
        p.market_location.toLowerCase().includes(regionFilter)
      );
    }

    if (selectedCommodity !== 'all') {
      const commodityFilter = selectedCommodity.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter((p: MarketPrice) => 
        p.commodity.toLowerCase().includes(commodityFilter)
      );
    }

    if (selectedMarket !== 'all') {
      const marketFilter = selectedMarket.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter((p: MarketPrice) => 
        p.market.toLowerCase().includes(marketFilter)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((p: MarketPrice) => 
        p.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.market_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPrices(filtered);
  };

  const getTrendIcon = (price: number, prevPrice?: number): string => {
    if (!prevPrice) return '📊';
    const change = ((price - prevPrice) / prevPrice) * 100;
    if (change > 1) return '📈';
    if (change < -1) return '📉';
    return '📊';
  };

  const getTrendColor = (price: number, prevPrice?: number): string => {
    if (!prevPrice) return 'text-yellow-600';
    const change = ((price - prevPrice) / prevPrice) * 100;
    if (change > 1) return 'text-green-600';
    if (change < -1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const clearFilters = (): void => {
    setSelectedRegion('all');
    setSelectedCommodity('all');
    setSelectedMarket('all');
    setSearchQuery('');
  };

  // Loading state with skeletons
  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['farmer']}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <div>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            
            {/* Filter skeletons */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            
            {/* Price cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PriceSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Link href="/" className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-colors">
                  <span className="text-2xl">🌾</span>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    Market Prices
                  </h1>
                  <span className="text-sm text-green-600 font-medium">View current commodity prices</span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome,</p>
                  <p className="text-base font-semibold text-gray-800">{user?.full_name || user?.email || 'Farmer'}</p>
                </div>
                <Link 
                  href="/"
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center text-white font-bold text-lg hover:from-green-500 hover:to-emerald-600 transition-colors"
                >
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'F'}
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Breadcrumb */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Market Prices</span>
            </div>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={loadMarketPrices}
                className="mt-2 text-sm text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Search commodities, markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                {commodities.map((commodity: Commodity) => (
                  <option key={commodity.id} value={commodity.id}>{commodity.name}</option>
                ))}
              </select>
              <div className="flex items-center justify-end text-sm text-gray-500">
                <span>Showing {filteredPrices.length} prices</span>
              </div>
            </div>
            <button
              onClick={loadMarketPrices}
              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              title="Refresh prices"
            >
              <span className="text-xl">🔄</span>
            </button>
          </div>

          {/* Market Prices Grid */}
          {filteredPrices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrices.map((price: MarketPrice, index: number) => {
                const prevPrice = index < filteredPrices.length - 1 ? filteredPrices[index + 1].price : undefined;
                
                return (
                  <div key={price.id} className={`bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-shadow ${
                    price.status === 'approved' ? 'border-green-100' : 
                    price.status === 'pending' ? 'border-yellow-100' : 
                    'border-red-100'
                  }`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800">
                              {price.commodity.charAt(0).toUpperCase() + price.commodity.slice(1)}
                            </h3>
                            {getStatusBadge(price.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {price.market}
                          </p>
                          <p className="text-xs text-gray-400">
                            {price.market_location}
                            {price.market_type && ` • ${price.market_type}`}
                          </p>
                          {price.submitted_by_name && (
                            <p className="text-xs text-gray-400 mt-1">
                              Reported by: {price.submitted_by_name}
                            </p>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${getTrendColor(price.price, prevPrice)} flex items-center gap-1`}>
                          {getTrendIcon(price.price, prevPrice)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900">{price.price_formatted}</div>
                        <div className="text-sm text-gray-500">per {price.unit}</div>
                      </div>

                      <div className="text-xs text-gray-400">
                        Updated: {price.submitted_date}
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
                No prices match your filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 text-blue-500 text-xl">ℹ️</div>
              <div>
                <h5 className="text-sm font-medium text-blue-800">About Market Prices</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Prices shown include all submissions from verified market officers. 
                  Approved prices are finalized, while pending ones are awaiting verification.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  {marketPrices.length > 0 
                    ? `Showing ${filteredPrices.length} of ${marketPrices.length} available prices`
                    : 'No prices available at the moment'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}