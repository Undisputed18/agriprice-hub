'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet only on the client side
let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

interface ShopLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  products?: string[];
}

interface ShopLocationsMapProps {
  shops: ShopLocation[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  onShopClick?: (shop: ShopLocation) => void;
}

// Custom icon for shop markers
const createShopIcon = (isCurrent: boolean = false) => {
  if (typeof window === 'undefined' || !L) return null;

  return L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div style="background-color: ${isCurrent ? '#16a34a' : '#2563eb'}; color: white; border-radius: 9999px; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 4px solid white; transform: translateY(-50%);">
          <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `,
    className: 'shop-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function ShopLocationsMap({
  shops,
  centerLat = -1.286389,
  centerLng = 36.817223,
  zoom = 11,
  onShopClick,
}: ShopLocationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !L || !mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([centerLat, centerLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

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
  }, []); // Only initialize once

  // Update View
  useEffect(() => {
    if (map.current && isMapReady) {
      map.current.setView([centerLat, centerLng], zoom);
      
      // Also try to find a marker at this location and open its popup
      const shop = shops.find(s => 
        Math.abs(s.latitude - centerLat) < 0.0001 && 
        Math.abs(s.longitude - centerLng) < 0.0001
      );
      if (shop) {
        const marker = markersRef.current.get(shop.id);
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [centerLat, centerLng, zoom, isMapReady]);

  // Update Markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add shop markers
    shops.forEach((shop) => {
      if (map.current) {
        const popup = L.popup({
          maxWidth: 320,
          className: 'custom-popup',
        }).setContent(`
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 40px; height: 40px; background-color: #dcfce7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📍</div>
              <div>
                <h3 style="font-weight: bold; font-size: 16px; color: #1f2937; margin: 0; line-height: 1.2;">${shop.name}</h3>
                <span style="font-size: 10px; background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-weight: bold; text-transform: uppercase;">Verified Shop</span>
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 12px; border: 1px solid #f3f4f6;">
                <p style="font-size: 14px; font-weight: 500; color: #1f2937; margin: 0;">${shop.address}</p>
                <div style="margin-top: 8px; display: flex; align-items: center; gap: 16px; font-size: 10px; color: #6b7280; font-family: monospace;">
                  <span>LAT: ${Number(shop.latitude).toFixed(6)}</span>
                  <span>LNG: ${Number(shop.longitude).toFixed(6)}</span>
                </div>
              </div>

              ${shop.phone ? `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4b5563;">
                  <span>📞</span>
                  <span style="font-weight: 500;">${shop.phone}</span>
                </div>
              ` : ''}

              ${shop.products && shop.products.length > 0 ? `
                <div style="padding-top: 8px;">
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Top Products</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${shop.products.slice(0, 3).map(p => `<span style="background-color: #ecfdf5; color: #065f46; font-size: 10px; padding: 4px 8px; border-radius: 8px; border: 1px solid #d1fae5; font-weight: 500;">${p}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="flex: 1; background: linear-gradient(to right, #16a34a, #059669); color: white; padding: 10px; border-radius: 12px; font-weight: bold; text-decoration: none; text-align: center; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;"
              >
                <span>🧭</span>
                Get Directions
              </a>
            </div>
          </div>
        `);

        const marker = L.marker([shop.latitude, shop.longitude], {
          icon: createShopIcon(),
          title: shop.name,
        })
          .bindPopup(popup)
          .addTo(map.current!);

        marker.on('click', () => {
          if (onShopClick) {
            onShopClick(shop);
          }
        });

        markersRef.current.set(shop.id, marker);
      }
    });

    // Fit bounds if multiple shops and no explicit center was provided by user search
    if (shops.length > 0 && map.current && !centerLat) {
      const group = new L.FeatureGroup(Array.from(markersRef.current.values()));
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [shops, isMapReady]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-[2rem] overflow-hidden"
        style={{ zIndex: 1 }}
      />
      
      {/* Overlay controls - only show if map is ready */}
      {isMapReady && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-green-100 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-gray-700">GPS Active</span>
          </div>
        </div>
      )}

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-[2rem]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
