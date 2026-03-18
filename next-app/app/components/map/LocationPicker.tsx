'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet only on the client side
let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = -1.286389,
  initialLng = 36.817223,
  initialAddress = '',
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [loading, setLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined' || !L || !mapContainer.current || map.current) return;
    
    // Initialize map
    map.current = L.map(mapContainer.current).setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current!);

    // Add initial marker
    markerRef.current = L.marker([initialLat, initialLng], {
      draggable: true,
      title: 'Your shop location',
    }).addTo(map.current!);

    // Handle marker drag
    markerRef.current?.on('dragend', () => {
      if (markerRef.current) {
        const latlng = markerRef.current.getLatLng();
        setLatitude(latlng.lat);
        setLongitude(latlng.lng);
        map.current?.setView([latlng.lat, latlng.lng], 13);
        reverseGeocode(latlng.lat, latlng.lng);
      }
    });

    // Handle map click
    map.current?.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setLatitude(lat);
      setLongitude(lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      reverseGeocode(lat, lng);
    });
    
    setIsMapReady(true);

    // Fix for Leaflet maps not rendering correctly
    setTimeout(() => {
      map.current?.invalidateSize();
    }, 200);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker and view if initial props change (only if map is already ready and different)
  useEffect(() => {
    if (map.current && markerRef.current && isMapReady) {
      const currentCenter = map.current.getCenter();
      if (Math.abs(currentCenter.lat - initialLat) > 0.0001 || Math.abs(currentCenter.lng - initialLng) > 0.0001) {
        map.current.setView([initialLat, initialLng], 13);
        markerRef.current.setLatLng([initialLat, initialLng]);
        setLatitude(initialLat);
        setLongitude(initialLng);
      }
    }
  }, [initialLat, initialLng, isMapReady]);

  // Get current location using Geolocation API
  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat);
          setLongitude(lng);

          if (map.current && markerRef.current) {
            map.current.setView([lat, lng], 17); // Closer zoom for high accuracy
            markerRef.current.setLatLng([lat, lng]);
          }

          reverseGeocode(lat, lng);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied. Please enable location permissions in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'The request to get user location timed out.';
          }
          alert(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Geolocation error:', error);
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      // Improve address formatting for better accuracy/readability
      let addressText = '';
      if (data.address) {
        const addr = data.address;
        const parts = [];
        
        // Priority: Road/Street -> Suburb/Neighborhood -> City/Town -> County/State
        if (addr.road) parts.push(addr.road);
        if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.county) parts.push(addr.county);
        
        addressText = parts.length > 0 ? parts.join(', ') : data.display_name;
      } else {
        addressText = data.display_name;
      }
      
      setAddress(addressText);
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleSaveLocation = () => {
    onLocationSelect(latitude, longitude, address);
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative w-full h-96 rounded-xl border border-gray-300 shadow-md overflow-hidden bg-gray-100">
        <div ref={mapContainer} className="w-full h-full" style={{ zIndex: 1 }} />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-500">Initializing map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latitude</label>
          <div className="relative">
            <input
              type="number"
              value={latitude}
              onChange={(e) => {
                const lat = parseFloat(e.target.value);
                setLatitude(lat);
                if (map.current && markerRef.current && !isNaN(lat)) {
                  map.current.setView([lat, longitude]);
                  markerRef.current.setLatLng([lat, longitude]);
                }
              }}
              className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
              step="0.000001"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Longitude</label>
          <div className="relative">
            <input
              type="number"
              value={longitude}
              onChange={(e) => {
                const lng = parseFloat(e.target.value);
                setLongitude(lng);
                if (map.current && markerRef.current && !isNaN(lng)) {
                  map.current.setView([latitude, lng]);
                  markerRef.current.setLatLng([latitude, lng]);
                }
              }}
              className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
              step="0.000001"
            />
          </div>
        </div>
      </div>

      {/* Address Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter shop address or click on map to pinpoint..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none min-h-[80px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>🛰️</span>
              Get GPS Location
            </>
          )}
        </button>

        <button
          onClick={handleSaveLocation}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <span>✅</span>
          Confirm Location
        </button>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Pro Tip:</strong> Drag the marker or click anywhere on the map to precisely locate your shop. High accuracy helps farmers find you easily!
        </p>
      </div>
    </div>
  );
}
