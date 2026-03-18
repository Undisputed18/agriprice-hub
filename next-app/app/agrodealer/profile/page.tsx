// app/agrodealer/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';
import LocationPicker from '@/app/components/map/LocationPicker';

// Extended User type to include created_at
interface ExtendedUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
  [key: string]: any;
}

interface ProfileData {
  fullName: string;
  businessName: string;
  phoneNumber: string;
  idNumber: string;
  kraPin: string;
  latitude: number;
  longitude: number;
  address: string;
}

export default function AgroDealerProfilePage() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedUser | null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    businessName: '',
    phoneNumber: '',
    idNumber: '',
    kraPin: '',
    latitude: -1.286389,
    longitude: 36.817223,
    address: ''
  });

  // Load profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  // Calculate profile completion
  useEffect(() => {
    const essentialFields = [profile.fullName, profile.businessName, profile.phoneNumber, profile.address];
    const filledEssential = essentialFields.filter(value => value && value.trim() !== '').length;
    setProfileCompletion(Math.round((filledEssential / essentialFields.length) * 100));
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/dealer/profile');
      const data = await response.json();
      
      if (data.profile) {
        setProfile({
          fullName: data.profile.full_name || '',
          businessName: data.profile.business_name || '',
          phoneNumber: data.profile.phone_number || '',
          idNumber: data.profile.id_number || '',
          kraPin: data.profile.kra_pin || '',
          latitude: data.profile.latitude || -1.286389,
          longitude: data.profile.longitude || 36.817223,
          address: data.profile.address || '',
        });
      } else if (extendedUser) {
        setProfile(prev => ({
          ...prev,
          fullName: extendedUser.full_name || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setProfile(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/dealer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✨ Profile and shop location updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile information' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['dealer']}>
        <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['dealer']}>
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    My Profile
                  </h1>
                  <p className="text-sm text-gray-500">Manage your personal information</p>
                </div>
              </div>
              <Link href="/agrodealer-dashboard" className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          )}

          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <h3 className="font-semibold text-gray-700">Profile Completion</h3>
              </div>
              <span className="text-2xl font-bold text-green-600">{profileCompletion}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {profileCompletion === 100 ? '🎉 Excellent! Your profile is complete' : '✨ Complete your profile to get verified'}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100 overflow-hidden">
            <div className="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 skew-y-12"></div>
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl border-2 border-white/30">
                  {profile.fullName ? '👤' : '🌱'}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-1">{profile.businessName || profile.fullName || 'Welcome, Dealer!'}</h2>
                  <p className="text-green-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    {extendedUser?.email || 'Complete your profile'}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/30">
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">Full Name *</label>
                    <input type="text" name="fullName" value={profile.fullName} onChange={handleInputChange} disabled={!isEditing} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Enter your full name" />
                  </div>
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">Business / Shop Name *</label>
                    <input type="text" name="businessName" value={profile.businessName} onChange={handleInputChange} disabled={!isEditing} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Enter your shop name" />
                  </div>
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">Phone Number *</label>
                    <input type="tel" name="phoneNumber" value={profile.phoneNumber} onChange={handleInputChange} disabled={!isEditing} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="+254 712 345 678" />
                  </div>
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">National ID Number</label>
                    <input type="text" name="idNumber" value={profile.idNumber} onChange={handleInputChange} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Enter ID number" />
                  </div>
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">KRA PIN</label>
                    <input type="text" name="kraPin" value={profile.kraPin} onChange={handleInputChange} disabled={!isEditing} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="A123456789B" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">📍 Shop Location</h3>
                  {isEditing ? (
                    <LocationPicker onLocationSelect={handleLocationSelect} initialLat={profile.latitude} initialLng={profile.longitude} initialAddress={profile.address} />
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">📍</div>
                      <div>
                        <p className="font-medium text-gray-800">{profile.address || 'Location not set'}</p>
                        <p className="mt-1 text-sm text-gray-500">Lat: {profile.latitude.toFixed(6)}, Lng: {profile.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-6 border-t border-gray-100">
                    <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50">
                      {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50">Cancel</button>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 overflow-hidden p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">🔐 Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Email</p><p className="font-medium">{extendedUser?.email}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Business Name</p><p className="font-medium">{profile.businessName || 'Not set'}</p></div>
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Account Type</p><p className="font-medium text-green-700">Agro-Dealer</p></div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
