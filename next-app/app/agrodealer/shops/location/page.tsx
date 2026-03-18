// app/agrodealer/shops/location/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function ShopLocationPage() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('Nairobi Main Branch');
  const [gpsSignal, setGpsSignal] = useState('high');
  const [shopCoordinates, setShopCoordinates] = useState({
    latitude: -1.286389,
    longitude: 36.817223,
    address: 'CBD, Nairobi, Kenya',
    business_name: 'Nairobi Main Branch'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchLocation() {
      try {
        const response = await fetch('/api/dealer/shop-location');
        const data = await response.json();
        if (data.location && data.location.latitude) {
          setShopCoordinates({
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            address: data.location.address || 'CBD, Nairobi, Kenya',
            business_name: data.location.business_name || 'Nairobi Main Branch'
          });
          if (data.location.business_name) {
            setSelectedLocation(data.location.business_name);
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLocation();
  }, []);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setShopCoordinates(prev => ({ ...prev, latitude: lat, longitude: lng, address }));
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/dealer/shop-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopCoordinates),
      });

      if (response.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Failed to save location: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('An error occurred while saving the location.');
    } finally {
      setSaving(false);
    }
  };

  const branches = [
    { id: 'AGRO-NRB-001', name: 'Nairobi Main Branch', location: 'CBD, Nairobi, Kenya', lat: -1.286389, lng: 36.817223 },
    { id: 'AGRO-NRB-002', name: 'Westlands Branch', location: 'Westlands, Nairobi', lat: -1.2675, lng: 36.8089 },
    { id: 'AGRO-NKR-001', name: 'Nakuru Main Branch', location: 'Kenyatta Avenue, Nakuru', lat: -0.2833, lng: 35.8733 },
  ];

  const handleBranchSelect = (branch: typeof branches[0]) => {
    setSelectedLocation(branch.name);
    setShopCoordinates({
      latitude: branch.lat,
      longitude: branch.lng,
      address: branch.location,
      business_name: branch.name
    });
  };

  const nearbyLocations = [
    { name: 'KICC', area: 'CBD, Nairobi', distance: '0.3 km' },
    { name: 'Nairobi National Museum', area: 'Museum Hill, Nairobi', distance: '1.2 km' },
    { name: 'Junction Mall', area: 'Ngong Road, Nairobi', distance: '2.5 km' },
    { name: 'Sarit Centre', area: 'Westlands, Nairobi', distance: '3.1 km' },
    { name: 'The Hub Karen', area: 'Karen, Nairobi', distance: '4.8 km' },
    { name: 'Two Rivers Mall', area: 'Ruiru, Nairobi', distance: '5.5 km' },
    { name: 'Nakuru CBD', area: 'Nakuru', distance: '6.2 km' },
    { name: 'Lake Nakuru National Park', area: 'Nakuru', distance: '6.8 km' },
    { name: 'Menengai Crater', area: 'Nakuru', distance: '7.4 km' },
    { name: 'Hyrax Hill', area: 'Nakuru', distance: '8.0 km' },
    { name: 'Egerton University', area: 'Njoro, Nakuru', distance: '9.1 km' },
    { name: 'Kabarak University', area: 'Kabarak, Nakuru', distance: '10.3 km' },
    { name: 'Nakuru Giotto', area: 'Nakuru', distance: '11.0 km' },
    { name: 'Nakuru Westside Mall', area: 'Nakuru', distance: '11.8 km' },
    { name: 'Your Shop Location', area: 'CBD, Nairobi, Kenya', distance: '0.0 km', isCurrent: true },
    { name: 'Nakuru Law Courts', area: 'Nakuru', distance: '12.5 km' },
    { name: 'Kaptembwo', area: 'Nakuru', distance: '13.2 km' },
    { name: 'London, Nakuru', area: 'Nakuru', distance: '14.0 km' },
    { name: 'Section 58', area: 'Nakuru', distance: '14.7 km' },
    { name: 'Milimani Estate', area: 'Nakuru', distance: '15.3 km' },
    { name: 'Lanet', area: 'Nakuru', distance: '16.1 km' },
    { name: 'Nakuru Agricultural Showground', area: 'Nakuru', distance: '16.9 km' },
    { name: 'Njoro Town', area: 'Njoro, Nakuru', distance: '17.5 km' },
    { name: 'Molo', area: 'Molo, Nakuru', distance: '18.4 km' },
    { name: 'Elburgon', area: 'Elburgon, Nakuru', distance: '19.2 km' },
    { name: 'Turbo', area: 'Turbo, Nakuru', distance: '20.0 km' },
  ];
  return (
    <ProtectedRoute allowedRoles={['dealer']}>
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Link href="/agrodealer/shops" className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-linear-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    AgroDealer Pro
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <nav className="flex items-center gap-6">
                  <Link href="/agrodealer/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
                  <Link href="/agrodealer/inventory" className="text-sm text-gray-600 hover:text-gray-900">Inventory</Link>
                  <Link href="/agrodealer/suppliers" className="text-sm text-gray-600 hover:text-gray-900">Suppliers</Link>
                  <Link href="/agrodealer/shops" className="text-sm text-green-600 font-medium">Shops</Link>
                </nav>
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center text-white font-bold text-lg">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'D'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Branch Selector REMOVED */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Map and Location Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Branch Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedLocation}</h2>
                    <p className="text-sm text-gray-500 mt-1">ID: AGRO-LSK-782</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Active
                  </span>
                </div>

                {/* Map Placeholder */}
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                initialLat={shopCoordinates.latitude}
                initialLng={shopCoordinates.longitude}
                initialAddress={shopCoordinates.address}
              />
              </div>

              {/* Shop Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">GPS Location</h4>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="font-medium text-gray-800">{shopCoordinates.address}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Latitude:</strong> {shopCoordinates.latitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Longitude:</strong> {shopCoordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Nearby Locations</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                      {nearbyLocations.map((location, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-xl border ${
                            location.isCurrent
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          } transition-colors cursor-pointer`}
                        >
                          <p className="font-medium text-sm text-gray-800">{location.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{location.distance}</p>
                          {location.isCurrent && (
                            <span className="mt-2 text-xs text-green-600 font-medium">Your Location</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Status and Help */}
            <div className="space-y-6">
              {/* GPS Signal Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    gpsSignal === 'high' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                  }`}></div>
                  <h3 className="text-lg font-semibold text-gray-800">Location Verified</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GPS Signal Strength</span>
                    <span className="text-sm font-medium text-green-600">High</span>
                  </div>
                  
                  {/* Signal Bars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-6 w-2 rounded-full ${
                          bar <= 4 ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last updated 2 days ago</span>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Need Help?</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Check out our guide on how to calibrate your shop GPS for better accuracy.
                </p>

                <Link
                  href="/agrodealer/guides/gps-calibration"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <span>View Guide</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Quick Tips */}
                <div className="mt-6 pt-4 border-t border-green-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Tips:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      Ensure GPS is enabled on your device
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      Stand near your shop entrance for best accuracy
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      Update location if you move to a new spot
                    </li>
                  </ul>
                </div>
              </div>

              {/* Save Button */}
              {savedSuccess && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-800 rounded-xl animate-pulse">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Location saved successfully!</span>
                  </div>
                </div>
              )}
              <button 
                onClick={handleSaveLocation}
                disabled={saving}
                className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/agrodealer/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/agrodealer/inventory" className="text-sm text-gray-600 hover:text-gray-900">Inventory</Link>
                <Link href="/agrodealer/suppliers" className="text-sm text-gray-600 hover:text-gray-900">Suppliers</Link>
                <Link href="/agrodealer/shops" className="text-sm text-green-600 font-medium">Shops</Link>
              </div>
              <div className="text-sm text-gray-500">
                © 2024 AgroDealer Pro. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}