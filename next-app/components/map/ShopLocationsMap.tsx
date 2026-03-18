// app/components/map/ShopLocationsMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Shop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  products?: string[];
}

interface ShopLocationsMapProps {
  shops: Shop[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

export default function ShopLocationsMap({ 
  shops, 
  centerLat = -1.286389, 
  centerLng = 36.817223,
  zoom = 11 
}: ShopLocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fix for default markers
  useEffect(() => {
    // Fix Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance
      const map = L.map(mapRef.current).setView([centerLat, centerLng], zoom);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Force resize after initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, zoom]);

  // Add markers when shops change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter shops with valid coordinates
    const validShops = shops.filter(shop => 
      shop.latitude && shop.longitude && 
      !isNaN(shop.latitude) && !isNaN(shop.longitude)
    );

    if (validShops.length === 0) return;

    // Add markers for each shop
    validShops.forEach((shop) => {
      // Create custom marker
      const marker = L.marker([shop.latitude, shop.longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #16a34a;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              font-size: 18px;
            ">
              🏪
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        })
      });

      // Create popup content
      const popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #166534;">
            ${shop.name}
          </h3>
          <p style="margin-bottom: 6px; font-size: 13px;">
            📍 ${shop.address}
          </p>
          ${shop.phone ? `
            <p style="margin-bottom: 6px; font-size: 13px;">
              📞 ${shop.phone}
            </p>
          ` : ''}
          ${shop.products && shop.products.length > 0 ? `
            <div style="margin-top: 8px;">
              <p style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">Products:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${shop.products.slice(0, 3).map(p => `
                  <span style="
                    background: #dcfce7;
                    color: #166534;
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 12px;
                  ">${p}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [shops, isMapReady]);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-xl border border-gray-300 shadow-lg"
        style={{ background: '#f0f0f0' }}
      />

      {/* Shop Count */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-green-600">{shops.filter(s => s.latitude && s.longitude).length}</span> agrodealers with locations
        </p>
      </div>
    </div>
  );
}