// app/farmer/suppliers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';
import ShopLocationsMap from '@/app/components/map/ShopLocationsMap';
import ChatModal from '@/components/ChatModal';
import 'leaflet/dist/leaflet.css';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  shops: string[];
  dealer_user_id: string;
  supplier_name: string;
  contact_phone: string;
  contact_email: string;
  contact_location: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export default function SuppliersPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -1.286389, lng: 36.817223 });
  const [mapZoom, setMapZoom] = useState(11);
  const [showMap, setShowMap] = useState(true);
  
  // Image zoom state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeReceiver, setActiveReceiver] = useState({ id: '', name: '', productId: '', productName: '' });

  const handleOpenChat = (dealerId: string, dealerName: string, productId?: string, productName?: string) => {
    setActiveReceiver({ 
      id: dealerId, 
      name: dealerName, 
      productId: productId || '', 
      productName: productName || '' 
    });
    setIsChatOpen(true);
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return;
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setMapZoom(14);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setGeocoding(false);
    }
  };

  const shops = products.reduce((acc, p) => {
    const lat = (p.latitude !== undefined && p.latitude !== null) ? Number(p.latitude) : NaN;
    const lng = (p.longitude !== undefined && p.longitude !== null) ? Number(p.longitude) : NaN;
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      const existingShop = acc.find(s => s.name === p.supplier_name && s.address === p.contact_location);
      if (existingShop) {
        if (!existingShop.products?.includes(p.name)) existingShop.products?.push(p.name);
      } else {
        acc.push({
          id: acc.length + 1,
          name: p.supplier_name || 'Verified Supplier',
          latitude: lat,
          longitude: lng,
          address: p.contact_location || 'Address pending',
          phone: p.contact_phone || '',
          products: [p.name]
        });
      }
    }
    return acc;
  }, [] as any[]);

  const handleViewOnMap = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setMapZoom(15);
    setShowMap(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/farmer/products');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const productCategories = ['all', ...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(product => {
    if (selectedProduct !== 'all' && product.category !== selectedProduct) return false;
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && !product.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 relative">
        {/* Image Zoom Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all text-2xl z-[101]"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <div className="relative max-w-5xl max-h-full flex flex-col items-center">
              <img 
                src={selectedImage} 
                alt="Product Preview" 
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border-4 border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-white/60 mt-4 text-sm font-medium">Click anywhere to close</p>
            </div>
          </div>
        )}

        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl">🤝</div>
                <div>
                  <h1 className="text-2xl font-bold bg-linear-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Suppliers Network</h1>
                  <span className="text-sm text-green-600 font-medium">Verified input providers</span>
                </div>
              </div>
              <div className="flex bg-white p-1 rounded-xl shadow-md border border-green-100">
                <button onClick={() => setShowMap(false)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!showMap ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'}`}>List View</button>
                <button onClick={() => setShowMap(true)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${showMap ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'}`}>Map View</button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showMap ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-green-100 overflow-hidden p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">📍 Interactive Supplier Map</h3>
                    <p className="text-gray-500 mt-1">Find agrodealers near you</p>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Search area..." value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()} className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none w-64" />
                    <button onClick={handleLocationSearch} disabled={geocoding} className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50">{geocoding ? '...' : 'Find'}</button>
                  </div>
                </div>
                <div className="h-[550px] w-full rounded-[2rem] overflow-hidden border border-green-100 shadow-inner">
                  <ShopLocationsMap shops={shops} centerLat={mapCenter.lat} centerLng={mapCenter.lng} zoom={mapZoom} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-green-100 p-4 flex flex-wrap gap-4">
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  {productCategories.map(category => <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>)}
                </select>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-green-50 border-b border-green-100 text-xs font-bold text-gray-600 uppercase">
                    <tr>
                      <th className="px-6 py-4">PRODUCT</th>
                      <th className="px-6 py-4">CATEGORY</th>
                      <th className="px-6 py-4">PRICE</th>
                      <th className="px-6 py-4">SUPPLIER</th>
                      <th className="px-6 py-4">ADDRESS</th>
                      <th className="px-6 py-4 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Loading data...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No products found.</td></tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-green-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-green-50 flex-shrink-0 cursor-zoom-in hover:opacity-80 transition-all hover:scale-105 active:scale-95 shadow-sm group relative"
                                onClick={() => product.images?.[0] && setSelectedImage(product.images[0])}
                              >
                                {product.images && product.images.length > 0 ? (
                                  <>
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">🔍 View</div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{product.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-green-600">KES {product.price.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">{product.supplier_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px] truncate" title={product.contact_location}>
                            {product.contact_location || 'Address pending'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleOpenChat(product.dealer_user_id, product.supplier_name)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-md">CHAT</button>
                              {product.latitude && (
                                <button onClick={() => handleViewOnMap(Number(product.latitude), Number(product.longitude))} className="p-1.5 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 shadow-sm">📍</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} receiverId={activeReceiver.id} receiverName={activeReceiver.name} />
      </div>
    </ProtectedRoute>
  );
}
