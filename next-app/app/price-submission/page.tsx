// app/price-submission/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MarketProfile {
  id: string;
  market_name: string;
  location: string;
  market_type: string;
  full_name?: string;
}

interface RecentPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  submitted_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const PriceSubmissionPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [marketProfile, setMarketProfile] = useState<MarketProfile | null>(null);
  const [recentPrices, setRecentPrices] = useState<RecentPrice[]>([]);
  const [formData, setFormData] = useState({
    commodity: '',
    price: '',
    unit: '90kg bag',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch market profile and recent prices on mount
  useEffect(() => {
    fetchMarketProfile();
  }, []);

  const fetchMarketProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching market profile...');
      const profileRes = await fetch('/api/officer/profile');
      const profileData = await profileRes.json();
      
      if (!profileRes.ok) {
        throw new Error(profileData.error || 'Failed to fetch profile');
      }
      
      if (profileData.profile) {
        console.log('Profile found:', profileData.profile);
        setMarketProfile({
          id: profileData.profile.id,
          market_name: profileData.profile.market_name || 'Your Market',
          location: profileData.profile.location || 'Unknown Location',
          market_type: profileData.profile.market_type || 'retail',
          full_name: profileData.profile.full_name
        });
        
        // Fetch recent prices after we have the profile
        await fetchRecentPrices();
      } else {
        console.log('No market profile found');
        setMarketProfile(null);
      }
    } catch (error) {
      console.error('Error fetching market profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load market profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPrices = async () => {
    try {
      console.log('Fetching recent prices...');
      const response = await fetch('/api/officer/prices/recent');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recent prices');
      }
      
      setRecentPrices(data.prices || []);
    } catch (error) {
      console.error('Error fetching recent prices:', error);
      // Don't set error state here to avoid blocking the form
    }
  };

  const validateForm = () => {
    if (!formData.commodity) {
      setError('Please select a commodity');
      return false;
    }
    if (!formData.price) {
      setError('Please enter a price');
      return false;
    }
    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if (!formData.unit) {
      setError('Please select a unit');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!marketProfile) {
      setError('Please complete your market profile first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Submitting price...', {
        market_profile_id: marketProfile.id,
        commodity: formData.commodity,
        price: parseFloat(formData.price),
        unit: formData.unit,
        submitted_date: formData.date
      });

      const response = await fetch('/api/officer/prices/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market_profile_id: marketProfile.id,
          commodity: formData.commodity,
          price: parseFloat(formData.price),
          unit: formData.unit,
          submitted_date: formData.date,
          notes: formData.notes || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit price');
      }

      setSuccessMessage('Price submitted successfully! It will be reviewed by an admin.');
      
      // Reset form
      setFormData({
        commodity: '',
        price: '',
        unit: '90kg bag',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Refresh recent prices
      await fetchRecentPrices();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error submitting price:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit price. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const getCommodityIcon = (commodity: string) => {
    const icons: { [key: string]: string } = {
      maize: '🌽',
      beans: '🫘',
      rice: '🍚',
      wheat: '🌾',
      potatoes: '🥔',
      tomatoes: '🍅',
      onions: '🧅',
      cabbage: '🥬',
      carrots: '🥕',
      kale: '🥬'
    };
    return icons[commodity.toLowerCase()] || '🌱';
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      if (diffHours < 1) return 'Just now';
      if (diffHours === 1) return '1 hour ago';
      return `${diffHours} hours ago`;
    }
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['officer']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading market profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!marketProfile) {
    return (
      <ProtectedRoute allowedRoles={['officer']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Market Profile Required</h2>
            <p className="text-gray-600 mb-6">
              You need to complete your market profile before submitting prices.
            </p>
            <Link
              href="/officerdashboard?tab=profile"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['officer']}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-gray-800">Price Submission</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.full_name || marketProfile.full_name || 'Officer'}</span>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {user?.full_name?.charAt(0) || marketProfile.full_name?.charAt(0) || 'O'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link href="/officerdashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Market Profile Card */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl text-white">🏪</span>
                </div>
                <div>
                  <p className="text-sm text-green-700">Submitting for</p>
                  <h3 className="font-bold text-green-800">{marketProfile.market_name}</h3>
                  <p className="text-xs text-green-600">{marketProfile.location} • {marketProfile.market_type} market</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-green-700">Market ID</p>
                <p className="text-sm font-mono text-green-800">{marketProfile.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">🌱</span>
            </div>
            <h1 className="text-4xl font-bold text-green-700">
              Price Submission
            </h1>
            <p className="text-green-600 mt-2 text-lg">
              Help farmers get fair prices for their harvest
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 flex items-center gap-2">
                <span>✅</span>
                {successMessage}
              </p>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Card Header with Market Info */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-green-600 to-green-700">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-20 h-20 border-2 border-white rounded-full -translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-2 border-white rounded-full translate-x-16 translate-y-16"></div>
              </div>
              <div className="relative flex items-center space-x-3">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">New Price Submission</h2>
                  <p className="text-green-100 text-sm">{marketProfile.market_name} • {marketProfile.location}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Commodity Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700">
                  <span className="flex items-center gap-2">
                    <span>🌽</span> Select Commodity <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  value={formData.commodity}
                  onChange={(e) => handleInputChange('commodity', e.target.value)}
                  required
                >
                  <option value="">Select a commodity</option>
                  <option value="maize">🌽 Maize</option>
                  <option value="beans">🫘 Beans</option>
                  <option value="rice">🍚 Rice</option>
                  <option value="wheat">🌾 Wheat</option>
                  <option value="potatoes">🥔 Potatoes</option>
                  <option value="tomatoes">🍅 Tomatoes</option>
                  <option value="onions">🧅 Onions</option>
                  <option value="cabbage">🥬 Cabbage</option>
                  <option value="carrots">🥕 Carrots</option>
                  <option value="kale">🥬 Kale (Sukuma Wiki)</option>
                </select>
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-700">
                    <span className="flex items-center gap-2">
                      <span>💰</span> Price (KSh) <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-semibold">KSh</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      placeholder="4500"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-700">
                    <span className="flex items-center gap-2">
                      <span>⚖️</span> Unit
                    </span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                  >
                    <option value="90kg bag">Per 90kg bag</option>
                    <option value="50kg bag">Per 50kg bag</option>
                    <option value="kg">Per kilogram</option>
                    <option value="tonne">Per tonne</option>
                    <option value="piece">Per piece</option>
                    <option value="bunch">Per bunch</option>
                    <option value="crate">Per crate</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700">
                  <span className="flex items-center gap-2">
                    <span>📅</span> Submission Date
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">📆</span>
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Notes (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700">
                  <span className="flex items-center gap-2">
                    <span>📝</span> Additional Notes (Optional)
                  </span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  placeholder="E.g., quality grade, special conditions, etc."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>🌱</span>
                      Submit Price for {marketProfile.market_name}
                      <span>🌾</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Submissions */}
          {recentPrices.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                  <span>📋</span> Your Recent Submissions
                </h3>
                <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  Last {recentPrices.length} {recentPrices.length === 1 ? 'submission' : 'submissions'}
                </span>
              </div>
              
              <div className="space-y-3">
                {recentPrices.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                          {getCommodityIcon(item.commodity)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            {item.commodity.charAt(0).toUpperCase() + item.commodity.slice(1)}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span>⏱️</span> {formatDate(item.submitted_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">{formatPrice(item.price)}</p>
                        <p className="text-xs text-gray-500">per {item.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-green-600 text-sm">
            Supporting farmers with transparent market prices from {marketProfile.market_name} 🌱
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PriceSubmissionPage;