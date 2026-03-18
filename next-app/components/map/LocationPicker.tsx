'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = -1.286389, // Default to Nairobi
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
  const [geocoding, setGeocoding] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = L.map(mapContainer.current).setView([initialLat, initialLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Add initial marker
      markerRef.current = L.marker([initialLat, initialLng], {
        draggable: true,
        title: 'Your shop location',
      }).addTo(map.current);

      // Handle marker drag
      markerRef.current.on('dragend', () => {
        if (markerRef.current) {
          const latlng = markerRef.current.getLatLng();
          setLatitude(latlng.lat);
          setLongitude(latlng.lng);
          // Try to get address from coordinates using reverse geocoding
          reverseGeocode(latlng.lat, latlng.lng);
        }
      });

      // Handle map click
      map.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        
        reverseGeocode(lat, lng);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Forward geocoding: Address -> Coordinates
  const forwardGeocode = async () => {
    if (!address.trim()) return;
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        setLatitude(newLat);
        setLongitude(newLng);
        setAddress(display_name);
        
        if (map.current && markerRef.current) {
          map.current.setView([newLat, newLng], 15);
          markerRef.current.setLatLng([newLat, newLng]);
        }
      } else {
        alert('Location not found. Please try a different address or click on the map.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

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
            map.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
          }

          reverseGeocode(lat, lng);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please make sure location services are enabled.');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Geolocation error:', error);
      setLoading(false);
    }
  };

  // Reverse geocoding: Coordinates -> Address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddress(data.display_name || '');
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleSaveLocation = () => {
    onLocationSelect(latitude, longitude, address);
  };

  return (
    <div className="space-y-4">
      {/* Address Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && forwardGeocode()}
            placeholder="Search for your shop address (e.g. Kenyatta Ave, Nairobi)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
        </div>
        <button
          onClick={forwardGeocode}
          disabled={geocoding}
          className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
        >
          {geocoding ? '...' : 'Find'}
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-2xl border-4 border-white shadow-xl overflow-hidden"
        style={{ zIndex: 1 }}
      />

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-xs text-gray-500">
        <div>
          <span className="block uppercase text-[10px] font-bold text-gray-400 mb-1">Latitude</span>
          <span className="text-gray-800">{latitude.toFixed(6)}</span>
        </div>
        <div>
          <span className="block uppercase text-[10px] font-bold text-gray-400 mb-1">Longitude</span>
          <span className="text-gray-800">{longitude.toFixed(6)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          {loading ? 'Detecting...' : '🎯 My Current Location'}
        </button>

        <button
          onClick={handleSaveLocation}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md active:scale-95"
        >
          ✅ Confirm Location
        </button>
      </div>
    </div>
  );
}
