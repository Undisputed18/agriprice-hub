'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export default function SimpleInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/dealer/products');
    const data = await res.json();
    console.log('Products:', data.products);
    setProducts(data.products || []);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('Upload response:', data);
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !selectedFile) {
      alert('Please fill all fields and select an image');
      return;
    }

    setUploading(true);

    // Upload image first
    const imageUrl = await uploadImage(selectedFile);
    if (!imageUrl) {
      alert('Failed to upload image');
      setUploading(false);
      return;
    }

    // Create product
    const productData = {
      name,
      price: parseFloat(price),
      category: 'test',
      stock: 10,
      unit: 'kg',
      images: [imageUrl],
      shops: ['Main Shop'],
    };

    console.log('Creating product with images:', productData.images);

    const res = await fetch('/api/dealer/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    const data = await res.json();
    console.log('Product created:', data);

    if (res.ok) {
      alert('Product added successfully!');
      setName('');
      setPrice('');
      setSelectedFile(null);
      setPreview(null);
      setShowForm(false);
      fetchProducts(); // Refresh list
    } else {
      alert('Error: ' + data.error);
    }

    setUploading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={['dealer']}>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Inventory Test</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          {showForm ? 'Cancel' : 'Add Test Product'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
            <h2 className="text-lg font-bold mb-4">Add Product with Image</h2>
            
            <div className="mb-4">
              <label className="block mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Price (KSh)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-2 border rounded"
                required
              />
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="Preview" className="w-32 h-32 object-cover border" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Save Product'}
            </button>
          </form>
        )}

        <h2 className="text-xl font-bold mb-4">Products ({products.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded">
              <h3 className="font-bold">{product.name}</h3>
              <p>KSh {product.price}</p>
              
              {product.images && product.images.length > 0 ? (
                <div className="mt-2">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-32 object-cover border rounded"
                    onError={(e) => {
                      console.log('Image failed to load:', product.images[0]);
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                    }}
                  />
                  <p className="text-xs mt-1 text-green-600">✅ Has {product.images.length} image(s)</p>
                </div>
              ) : (
                <p className="text-red-500 mt-2">❌ No images</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}