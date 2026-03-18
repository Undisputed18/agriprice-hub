// app/agrodealer/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChatModal from '@/components/ChatModal';

interface Product {
  id: string;
  name: string;
  full_name?: string;
  description: string;
  category: string;
  price: number;
  original_price?: number;
  stock: number;
  unit: string;
  images: string[];
  shops: string[];
  status: 'active' | 'out_of_stock' | 'discontinued';
  created_at: string;
  contact_email?: string;
  contact_phone?: string;
  supplier_name?: string;
}

export default function ProductCatalog() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  // Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProductImages, setCurrentProductImages] = useState<string[]>([]);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeReceiver, setActiveReceiver] = useState({ id: '', name: '' });

  // Add product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    original_price: '',
    stock: '',
    unit: '',
    address: '', // NEW FIELD
    full_name: '', // ADDED
  });

  const categories = [
    // ... rest of categories
    { id: 'all', name: 'All Products', icon: '📦' },
    { id: 'seeds', name: 'Seeds', icon: '🌱' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'chemicals', name: 'Chemicals', icon: '⚗️' },
    { id: 'equipment', name: 'Equipment', icon: '🔧' },
    { id: 'irrigation', name: 'Irrigation', icon: '💧' },
  ];

  const productCategories = [
    'seeds',
    'fertilizers',
    'chemicals',
    'equipment',
    'irrigation',
    'tools',
    'others'
  ];

  const units = [
    'kg',
    'g',
    'litre',
    'ml',
    'piece',
    'bundle',
    'bag',
    'acre',
    'unit'
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    fetchDealerInfo(); // NEW: Fetch dealer's profile info
  }, []);

  const fetchProducts = async () => {
    // ... rest of fetchProducts
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dealer/products');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      if (data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Helper to get dealer info from profile
  const fetchDealerInfo = async () => {
    try {
      const response = await fetch('/api/dealer/profile');
      const data = await response.json();
      if (data.profile) {
        setNewProduct(prev => ({ 
          ...prev, 
          address: data.profile.address || '',
          full_name: data.profile.full_name || ''
        }));
      }
    } catch (e) {
      console.error('Error fetching profile info:', e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/dealer/products/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      alert('You can only upload up to 5 images');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToServer = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', await response.text());
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAddError('');

    try {
      if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.stock || !newProduct.unit) {
        throw new Error('Please fill in all required fields');
      }

      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        setUploadingImages(true);
        uploadedImageUrls = await uploadImagesToServer(images);
        setUploadingImages(false);
      }

      const productData = {
        name: newProduct.name,
        full_name: newProduct.full_name,
        description: newProduct.description,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        stock: parseInt(newProduct.stock),
        unit: newProduct.unit,
        images: uploadedImageUrls,
        shops: [newProduct.address || 'Main Shop'], // USE THE ADDRESS FIELD HERE
        status: 'active',
      };

      const response = await fetch('/api/dealer/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      // Add supplier_name to the product object for immediate UI update
      const productWithSupplier = {
        ...data.product,
        supplier_name: newProduct.full_name
      };

      setProducts([productWithSupplier, ...products]);
      
      // Keep address and full_name for next entry but clear others
      setNewProduct(prev => ({
        ...prev,
        name: '',
        description: '',
        category: '',
        price: '',
        original_price: '',
        stock: '',
        unit: '',
      }));
      setImages([]);
      setImagePreviews([]);
      setShowAddModal(false);
      
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const openImageViewer = (images: string[], index: number) => {
    setCurrentProductImages(images);
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.category?.toLowerCase() === categoryId).length;
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category?.toLowerCase() !== selectedCategory) return false;
    
    if (selectedStatus.length > 0) {
      if (selectedStatus.includes('low-stock') && product.stock > 10) return false;
      if (selectedStatus.includes('out-of-stock') && product.stock > 0) return false;
    }
    
    if (searchQuery && !product.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'price-low': return (a.price || 0) - (b.price || 0);
      case 'price-high': return (b.price || 0) - (a.price || 0);
      case 'name': return (a.name || '').localeCompare(b.name || '');
      case 'stock': return (b.stock || 0) - (a.stock || 0);
      default: return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => (p.stock || 0) < 20 && (p.stock || 0) > 0).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['dealer']}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your inventory...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['dealer']}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-xl md:text-2xl">🌾</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent truncate max-w-[120px] md:max-w-none">
                    Agro-Supplier
                  </h1>
                  <span className="text-xs md:text-sm text-green-600 font-medium">My Products</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">Welcome back,</p>
                  <p className="text-sm md:text-base font-semibold text-gray-800">{user?.full_name || 'Dealer'}</p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center text-white font-bold text-base md:text-lg">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'D'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Add Product Button and Mobile Filter Toggle */}
          <div className="mb-6 flex justify-between items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-all"
            >
              <span className="text-lg">🔍</span>
              Filters
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm md:text-base"
            >
              <span className="text-lg md:text-xl">➕</span>
              <span className="hidden xs:inline">Add New Product</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>

          <div className="flex gap-6 relative">
            {/* Sidebar Filters - Responsive */}
            <>
              {/* Mobile Backdrop */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              
              <div className={`
                fixed lg:sticky top-0 lg:top-24 left-0 z-50 lg:z-0
                h-screen lg:h-auto w-72 md:w-80 shrink-0
                transition-transform duration-300 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>
                <div className="bg-white lg:bg-white/90 lg:backdrop-blur-sm h-full lg:h-auto lg:rounded-2xl shadow-2xl lg:shadow-lg border-r lg:border border-green-100 overflow-y-auto custom-scrollbar" style={{ maxHeight: '100vh' }}>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Filters
                      </h2>
                      <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">CATEGORIES</h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                            selectedCategory === category.id
                              ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span className="text-sm font-medium">{category.name}</span>
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{getCategoryCount(category.id)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Showing <span className="font-bold text-green-600">{sortedProducts.length}</span> products</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}>Grid</button>
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}>List</button>
                    </div>
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-4 py-2">
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <p className="text-gray-600 mb-6">No products found.</p>
                  <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-green-600 text-white rounded-xl">Add Product</button>
                </div>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                  {sortedProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">{product.category}</span>
                          {product.images?.length > 0 && (
                            <img src={product.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                        <p className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
                          <span>👤</span> {product.supplier_name || user?.full_name || 'Dealer'}
                        </p>
                        <div className="text-2xl font-black text-gray-900 mb-4">KSh {product.price.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>📦 {product.stock} {product.unit}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="truncate">📍 {product.shops?.join(', ') || 'No location'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {addError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{addError}</div>}

                <form onSubmit={handleAddProduct} className="space-y-4">
                  {/* Image Upload Placeholder */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-3xl mb-2">📸</div>
                      <p className="text-sm font-medium text-gray-600">Add Product Images ({images.length}/5)</p>
                    </label>
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {imagePreviews.map((p, i) => (
                        <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover border" alt="" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      value={newProduct.full_name} 
                      onChange={(e) => setNewProduct({...newProduct, full_name: e.target.value})} 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-green-50/30" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" rows={2} />
                  </div>

                  {/* ADDRESS FIELD ADDED HERE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Shop Address * (Shows on Map)</label>
                    <input 
                      type="text" 
                      value={newProduct.address} 
                      onChange={(e) => setNewProduct({...newProduct, address: e.target.value})} 
                      placeholder="e.g. Kenyatta Avenue, Nairobi" 
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-green-50/30" 
                      required 
                    />
                    <p className="text-[10px] text-gray-500 mt-1 italic">This defaults to your profile address. Change it if this product is at a different branch.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                      <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                        <option value="">Select Category</option>
                        {productCategories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Unit *</label>
                      <select value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                        <option value="">Select Unit</option>
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Price (KSh) *</label>
                      <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity *</label>
                      <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 mt-4">
                    {saving ? 'Adding Product...' : 'Add Product'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} receiverId={activeReceiver.id} receiverName={activeReceiver.name} />
      </div>
    </ProtectedRoute>
  );
}
