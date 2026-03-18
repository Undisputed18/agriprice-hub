// app/officerdashboard/page.tsx (fixed version)
'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface MarketProfile {
  fullName: string;
  email: string;
  marketName: string;
  marketType: string;
  location: string;
  phone: string;
  description: string;
  openTime: string;
  closeTime: string;
}

interface SubmissionSummary {
  totalSubmissions: number;
  recentPrices: number;
  pendingApprovals: number;
  weeklyChange: {
    submissions: number;
    prices: number;
  };
}

interface RecentPrice {
  id: number;
  commodity: string;
  price: string;
  unit: string;
  submittedDate: string;
  status: 'approved' | 'pending' | 'rejected';
}

export default function OfficerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MarketProfile>({
    fullName: user?.full_name || '',
    email: user?.email || '',
    marketName: '',
    marketType: '',
    location: '',
    phone: '',
    description: '',
    openTime: '08:00',
    closeTime: '18:00'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [summary, setSummary] = useState<SubmissionSummary>({
    totalSubmissions: 0,
    recentPrices: 0,
    pendingApprovals: 0,
    weeklyChange: {
      submissions: 0,
      prices: 0
    }
  });
  const [recentPrices, setRecentPrices] = useState<RecentPrice[]>([]);

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const profileRes = await fetch('/api/officer/profile');
      const profileData = await profileRes.json();
      
      if (profileData.profile) {
        setProfile({
          fullName: profileData.profile.full_name || user?.full_name || '',
          email: profileData.profile.email || user?.email || '',
          marketName: profileData.profile.market_name || '',
          marketType: profileData.profile.market_type || '',
          location: profileData.profile.location || '',
          phone: profileData.profile.phone || '',
          description: profileData.profile.description || '',
          openTime: profileData.profile.open_time || '08:00',
          closeTime: profileData.profile.close_time || '18:00'
        });
      }

      // Fetch stats
      const statsRes = await fetch('/api/officer/stats');
      const statsData = await statsRes.json();
      
      if (statsData && !statsData.error) {
        setSummary({
          totalSubmissions: statsData.totalSubmissions || 0,
          recentPrices: statsData.recentPrices || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          weeklyChange: {
            submissions: statsData.weeklyChange?.submissions || 0,
            prices: statsData.weeklyChange?.prices || 0
          }
        });
      }

      // Fetch recent prices
      const pricesRes = await fetch('/api/officer/prices/recent');
      const pricesData = await pricesRes.json();
      if (pricesData.prices) {
        setRecentPrices(pricesData.prices.map((p: any) => ({
          id: p.id,
          commodity: p.commodity.charAt(0).toUpperCase() + p.commodity.slice(1),
          price: `KES ${Number(p.price).toLocaleString()}`,
          unit: p.unit,
          submittedDate: new Date(p.submitted_date).toLocaleDateString('en-KE'),
          status: p.status
        })));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    setProfile({ ...profile, [field]: value });
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!profile?.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!profile?.email?.trim()) newErrors.email = 'Email is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setSaving(true);
      try {
        const response = await fetch('/api/officer/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: profile.fullName,
            email: profile.email,
            market_name: profile.marketName,
            market_type: profile.marketType,
            location: profile.location,
            phone: profile.phone,
            description: profile.description,
            open_time: profile.openTime,
            close_time: profile.closeTime
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          alert(data.message);
          // Refresh data after save
          loadProfileData();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
      } finally {
        setSaving(false);
      }
    }
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

  // Quick Actions
  const handleSubmitPrice = () => {
    router.push('/price-submission');
  };

  const handleViewAllSubmissions = () => {
    router.push('/price-management');
  };

  // Safely access weeklyChange with default values
  const weeklyChange = summary?.weeklyChange || { submissions: 0, prices: 0 };

  if (loading && activeTab === 'overview') {
    return (
      <ProtectedRoute allowedRoles={['officer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['officer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Dashboard Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-gray-800">Officer Dashboard</h1>
                <nav className="hidden md:flex space-x-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'profile'
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Market Profile
                  </button>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.full_name || 'Officer'}</span>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'O'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-gray-900 font-medium">Officer Dashboard</span>
            <span>/</span>
            <span className="text-gray-600">{activeTab === 'overview' ? 'Overview' : 'Market Profile'}</span>
          </div>

          {activeTab === 'overview' ? (
            /* Overview Tab - Summary Cards and Recent Prices */
            <div className="space-y-8">
              {/* Page Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600 mt-1">Track your submissions and market activity</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Submissions Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📊</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      weeklyChange.submissions >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {weeklyChange.submissions >= 0 ? '+' : ''}{weeklyChange.submissions}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{summary.totalSubmissions}</h3>
                  <p className="text-sm text-gray-600 mt-1">Total Submissions</p>
                  <p className="text-xs text-gray-500 mt-2">All time</p>
                </div>

                {/* Recent Prices Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">💰</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      weeklyChange.prices >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {weeklyChange.prices >= 0 ? '+' : ''}{weeklyChange.prices}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{summary.recentPrices}</h3>
                  <p className="text-sm text-gray-600 mt-1">Recent Prices</p>
                  <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
                </div>

                {/* Pending Approvals Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">⏳</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{summary.pendingApprovals}</h3>
                  <p className="text-sm text-gray-600 mt-1">Pending Approvals</p>
                  <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
                </div>
              </div>

              {/* Recent Prices Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Recent Price Submissions</h3>
                      <p className="text-sm text-gray-600 mt-1">Latest commodity prices from your market</p>
                    </div>
                    <button 
                      onClick={handleViewAllSubmissions}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commodity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentPrices.length > 0 ? (
                        recentPrices.slice(0, 5).map((price) => (
                          <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{price.commodity}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{price.price}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">{price.unit}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">{price.submittedDate}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(price.status)}`}>
                                {price.status.charAt(0).toUpperCase() + price.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No price submissions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {recentPrices.length > 5 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Showing 5 of {recentPrices.length} submissions
                      </span>
                      <button 
                        onClick={handleViewAllSubmissions}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-500">⚡</span>
                  Quick Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleSubmitPrice}
                    className="flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-green-50 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
                  >
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">📝</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Submit New Price</p>
                      <p className="text-sm text-gray-500">Add a new commodity price to the market</p>
                    </div>
                  </button>

                  <button
                    onClick={handleViewAllSubmissions}
                    className="flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📋</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View All Submissions</p>
                      <p className="text-sm text-gray-500">Manage and review your price entries</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Profile Tab - Form with loading state */
            <div className="space-y-6">
              {/* Form Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Form Header */}
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xl">🌾</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Market Profile Details</h3>
                      <p className="text-sm text-gray-600">Fill in the information below to update your market profile</p>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={validateAndSubmit} className="p-8">
                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full px-4 py-2.5 border ${
                              errors.fullName ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
                            placeholder="Enter your full name"
                            value={profile.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            disabled={saving}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="Enter your email"
                            value={profile.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Market Information Section */}
                    <div className="pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Market Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Market Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Market Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="Enter market name"
                            value={profile.marketName}
                            onChange={(e) => handleChange('marketName', e.target.value)}
                            disabled={saving}
                          />
                        </div>

                        {/* Market Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Market Type</label>
                          <select
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            value={profile.marketType}
                            onChange={(e) => handleChange('marketType', e.target.value)}
                            disabled={saving}
                          >
                            <option value="">Select type</option>
                            <option value="retail">Retail Market</option>
                            <option value="wholesale">Wholesale Market</option>
                            <option value="both">Both Retail & Wholesale</option>
                          </select>
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="City, Area"
                            value={profile.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            disabled={saving}
                          />
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder="+254 ..."
                            value={profile.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors min-h-25"
                        placeholder="Describe your market, products, or unique features..."
                        value={profile.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    {/* Operating Hours */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Operating Hours</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Opens</label>
                          <input
                            type="time"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            value={profile.openTime}
                            onChange={(e) => handleChange('openTime', e.target.value)}
                            disabled={saving}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Closes</label>
                          <input
                            type="time"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            value={profile.closeTime}
                            onChange={(e) => handleChange('closeTime', e.target.value)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Saving...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Additional Info Card */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-green-800">Officer Notice</h5>
                    <p className="text-sm text-green-700 mt-1">
                      Your market profile information will be used for price submissions. 
                      Please ensure all details are accurate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}