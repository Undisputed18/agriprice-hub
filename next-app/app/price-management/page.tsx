'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';

// Types
interface PriceEntry {
  id: string;
  commodity: string;
  market: string;
  market_location: string;
  price: number;
  unit: string;
  submitted_date: string;
  status: 'approved' | 'pending' | 'rejected';
  submitted_by?: string;
  submitted_by_name?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
}

interface FilterOptions {
  markets: Array<{ value: string; label: string; location: string }>;
  commodities: Array<{ value: string; label: string }>;
}

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

function PriceManagementPage() {
  const { user } = useAuth();
  
  // Filter states
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<PriceEntry[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ markets: [], commodities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    commodity: '',
    market: '',
    price: '',
    unit: '',
    date: '',
    notes: ''
  });

  const fetchPrices = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        market: selectedMarket,
        commodity: selectedCommodity,
        status: selectedStatus,
        page: page.toString(),
        limit: itemsPerPage.toString(),
        t: Date.now().toString() // Prevent caching
      });

      if (searchTerm) params.append('search', searchTerm);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      console.log('Fetching prices with params:', params.toString());
      
      const response = await fetch(`/api/officer/prices?${params}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        console.log('Fetched prices:', data.data.prices.length);
        setPrices(data.data.prices);
        setFilteredPrices(data.data.prices);
        setTotalItems(data.data.total || data.data.prices.length);
      } else {
        throw new Error(data.error || 'Failed to fetch prices');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      showToast('Failed to load price data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMarket, selectedCommodity, selectedStatus, searchTerm, dateRange.start, dateRange.end, itemsPerPage]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/officer/prices/filters');
      const data = await response.json();
      
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch filter options first
      await fetchFilterOptions();
      
      // Then fetch prices
      await fetchPrices(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchPrices]);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch prices when dependencies change
  useEffect(() => {
    fetchPrices(currentPage);
  }, [fetchPrices, currentPage]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleEdit = (price: PriceEntry) => {
    setEditingId(price.id);
    setEditForm({
      commodity: price.commodity,
      market: price.market,
      price: price.price.toString(),
      unit: price.unit,
      date: price.submitted_date.split('T')[0],
      notes: price.notes || ''
    });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/officer/prices/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          commodity: editForm.commodity,
          price: parseFloat(editForm.price),
          unit: editForm.unit,
          date: editForm.date,
          notes: editForm.notes || null
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Price updated successfully!', 'success');
        setEditingId(null);
        // Refresh current page
        await fetchPrices(currentPage);
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to update price', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      console.log(`Attempting to change status of price ${id} to ${newStatus}`);
      
      // Try multiple approaches to update status
      
      // Approach 0: Try the dedicated status endpoint (Most correct)
      console.log('Trying dedicated status endpoint...');
      const statusResponse = await fetch(`/api/officer/prices/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success) {
          showToast(`Price ${newStatus} successfully!`, 'success');
          await fetchPrices(currentPage);
          return;
        }
      }

      // Approach 1: Try PATCH on main endpoint
      console.log('Trying PATCH on main endpoint...');
      const patchResponse = await fetch(`/api/officer/prices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (patchResponse.ok) {
        const data = await patchResponse.json();
        if (data.success) {
          showToast(`Price ${newStatus} successfully!`, 'success');
          await fetchPrices(currentPage);
          return;
        }
      }

      // Approach 2: Try PUT on main endpoint
      console.log('Trying PUT on main endpoint...');
      const putResponse = await fetch(`/api/officer/prices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const putData = await putResponse.json();
      if (putData.success) {
        showToast(`Price ${newStatus} successfully!`, 'success');
        await fetchPrices(currentPage);
        return;
      }

      // Approach 3: Try the approve endpoint
      console.log('Trying approve endpoint...');
      const approveResponse = await fetch(`/api/officer/prices/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const approveData = await approveResponse.json();
      if (approveData.success) {
        showToast(`Price ${newStatus} successfully!`, 'success');
        await fetchPrices(currentPage);
        return;
      }

      // If all approaches fail
      throw new Error('All status update attempts failed');
      
    } catch (error) {
      console.error('Status change error:', error);
      showToast(`Failed to ${newStatus} price. Please try again.`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/officer/prices/${id}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' }
      });

      const data = await response.json();

      if (data.success) {
        showToast('Price deleted successfully!', 'success');
        setShowDeleteModal(false);
        setItemToDelete(null);
        // Refresh data
        await fetchPrices(currentPage);
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (error) {
      showToast('Failed to delete price', 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      showToast('No items selected', 'info');
      return;
    }

    try {
      const response = await fetch('/api/officer/prices/bulk', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'approve'
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast(`${selectedIds.length} prices approved successfully!`, 'success');
        setSelectedIds([]);
        await fetchPrices(currentPage);
      } else {
        // Fallback: approve one by one
        let successCount = 0;
        for (const id of selectedIds) {
          try {
            const res = await fetch(`/api/officer/prices/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) successCount++;
          } catch (e) {
            console.error(`Failed to approve price ${id}:`, e);
          }
        }
        if (successCount > 0) {
          showToast(`${successCount} prices approved successfully!`, 'success');
          setSelectedIds([]);
          await fetchPrices(currentPage);
        } else {
          throw new Error('Failed to approve any prices');
        }
      }
    } catch (error) {
      showToast('Failed to approve selected prices', 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      showToast('No items selected', 'info');
      return;
    }

    try {
      const response = await fetch('/api/officer/prices/bulk', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'reject'
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast(`${selectedIds.length} prices rejected successfully!`, 'success');
        setSelectedIds([]);
        await fetchPrices(currentPage);
      } else {
        // Fallback: reject one by one
        let successCount = 0;
        for (const id of selectedIds) {
          try {
            const res = await fetch(`/api/officer/prices/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'rejected' })
            });
            if (res.ok) successCount++;
          } catch (e) {
            console.error(`Failed to reject price ${id}:`, e);
          }
        }
        if (successCount > 0) {
          showToast(`${successCount} prices rejected successfully!`, 'success');
          setSelectedIds([]);
          await fetchPrices(currentPage);
        } else {
          throw new Error('Failed to reject any prices');
        }
      }
    } catch (error) {
      showToast('Failed to reject selected prices', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast('No items selected', 'info');
      return;
    }

    try {
      const response = await fetch('/api/officer/prices/bulk', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ ids: selectedIds })
      });

      const data = await response.json();

      if (data.success) {
        showToast(`${selectedIds.length} prices deleted successfully!`, 'success');
        setSelectedIds([]);
        setShowBulkDeleteModal(false);
        await fetchPrices(currentPage);
      } else {
        throw new Error(data.error || 'Failed to bulk delete');
      }
    } catch (error) {
      showToast('Failed to delete selected prices', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPrices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPrices.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  // Stats calculation
  const stats = {
    total: totalItems,
    approved: prices.filter(p => p.status === 'approved').length, // This is only for current page, ideally should come from API
    pending: prices.filter(p => p.status === 'pending').length,
    rejected: prices.filter(p => p.status === 'rejected').length
  };

  // Pagination logic (current page items)
  const currentItems = filteredPrices;

  // Delete Modal Component
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          {itemToDelete 
            ? 'Are you sure you want to delete this price entry? This action cannot be undone.'
            : `Are you sure you want to delete ${selectedIds.length} selected price entries? This action cannot be undone.`
          }
        </p>
        <div className="flex justify-end gap-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setShowDeleteModal(false);
              setShowBulkDeleteModal(false);
              setItemToDelete(null);
            }}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={() => {
              if (itemToDelete) {
                handleDelete(itemToDelete);
              } else {
                handleBulkDelete();
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Toast Component
  const Toast = () => {
    if (!toast.show) return null;
    
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[toast.type];

    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn`}>
        {toast.message}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['officer']}>
      <div className="min-h-screen bg-white">
        {/* Toast */}
        <Toast />

        {/* Delete Modals */}
        {(showDeleteModal || showBulkDeleteModal) && <DeleteModal />}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-gray-800">Price Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchPrices(1);
                  }}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link href="/officerdashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Price Management</h1>
              <p className="text-gray-600 mt-2">Manage, edit, and approve market price entries</p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
              <button 
                onClick={fetchAllData}
                className="mt-2 text-sm text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Total Prices</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Approved (Page)</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Pending (Page)</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Rejected (Page)</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedCommodity}
                  onChange={(e) => {
                    setSelectedCommodity(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Commodities</option>
                  {filterOptions.commodities.map((commodity) => (
                    <option key={commodity.value} value={commodity.value}>
                      {commodity.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Price Management Table */}
          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Price Entries</h2>
                <span className="text-sm text-gray-500">
                  {totalItems} total entries
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No price entries found
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((price) => (
                        <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedIds.includes(price.id)}
                              onChange={() => toggleSelect(price.id)}
                            />
                          </td>
                          {editingId === price.id ? (
                            // Edit Mode
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                                  value={editForm.commodity}
                                  onChange={(e) => setEditForm({...editForm, commodity: e.target.value})}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                                  value={editForm.market}
                                  onChange={(e) => setEditForm({...editForm, market: e.target.value})}
                                >
                                  {filterOptions.markets.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                                  value={editForm.unit}
                                  onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="date"
                                  className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                />
                              </td>
                              <td className="px-6 py-4">{getStatusBadge(price.status)}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSave(price.id)}
                                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // View Mode
                            <>
                              <td className="px-6 py-4 text-sm text-gray-900">{price.commodity}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {price.market}
                                <span className="text-xs text-gray-500 block">{price.market_location}</span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">KSh {price.price.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{price.unit}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(price.submitted_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">{getStatusBadge(price.status)}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleEdit(price)}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                  >
                                    Edit
                                  </button>
                                  {price.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(price.id, 'approved')}
                                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(price.id, 'rejected')}
                                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => {
                                      setItemToDelete(price.id);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-green-800">
                        {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleBulkApprove}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Approve Selected
                      </button>
                      <button
                        onClick={handleBulkReject}
                        className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                      >
                        Reject Selected
                      </button>
                      <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={() => setSelectedIds([])}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage * itemsPerPage >= totalItems}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="mt-6 flex justify-end gap-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Export as CSV
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Export as Excel
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
              Generate Report
            </button>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-medium text-green-800">Price Management Guidelines</h5>
                <p className="text-sm text-green-700 mt-1">
                  • Approved prices are visible to all users • Pending entries require your review • 
                  Rejected entries can be edited and resubmitted • Changes are reflected immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default PriceManagementPage;
