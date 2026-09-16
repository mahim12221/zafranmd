import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const AdminPortal = () => {
  const { backendUrl, currency, getProductsData } = useContext(ShopContext);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('list'); // 'add', 'list', 'orders'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Add Product form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // Products list state
  const [productsList, setProductsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Orders list state
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
      fetchProducts();
      fetchOrders();
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [adminToken]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post((backendUrl || '') + '/api/user/admin', { email, password });
      if (response.data.success) {
        setAdminToken(response.data.token);
        toast.success('Admin authenticated successfully');
      } else {
        toast.error(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleLogout = () => {
    setAdminToken('');
    localStorage.removeItem('adminToken');
    toast.info('Logged out from Admin Panel');
  };

  const fetchProducts = async () => {
    setLoadingList(true);
    try {
      const res = await axios.get((backendUrl || '') + '/api/product/list');
      if (res.data.success) {
        setProductsList(res.data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchOrders = async () => {
    if (!adminToken) return;
    setLoadingOrders(true);
    try {
      const res = await axios.post((backendUrl || '') + '/api/order/list', {}, { headers: { token: adminToken } });
      if (res.data.success) {
        setOrdersList(res.data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleRemoveProduct = async (id) => {
    try {
      const res = await axios.post((backendUrl || '') + '/api/product/remove', { id }, { headers: { token: adminToken } });
      if (res.data.success) {
        toast.success('Product removed');
        fetchProducts();
        if (getProductsData) getProductsData();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.post((backendUrl || '') + '/api/order/status', { orderId, status: newStatus }, { headers: { token: adminToken } });
      if (res.data.success) {
        toast.success('Status updated');
        fetchOrders();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleSize = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes.length > 0 ? sizes : ['M', 'L']));

      if (imageFile) {
        formData.append('image1', imageFile);
      }

      const res = await axios.post((backendUrl || '') + '/api/product/add', formData, {
        headers: { token: adminToken }
      });

      if (res.data.success) {
        toast.success('Product added successfully');
        setName('');
        setDescription('');
        setPrice('');
        setSizes([]);
        setImageFile(null);
        fetchProducts();
        if (getProductsData) getProductsData();
        setActiveTab('list');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  if (!adminToken) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
            <Link to="/" className="text-xs text-gray-500 hover:text-black font-medium underline">
              ← Storefront
            </Link>
          </div>
          <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
            Admin access: <br/>
            <strong>Email:</strong> admin@zafran.com <br/>
            <strong>Password:</strong> admin1234
          </p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zafran.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-md font-medium text-sm hover:bg-gray-800 transition"
            >
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
            Admin Mode
          </span>
          <h1 className="text-2xl font-bold mt-1 text-gray-900">Zafran Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs px-3 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
          >
            ← Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-2 bg-red-50 text-red-600 rounded font-medium hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-56 flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-lg font-medium text-sm transition ${
              activeTab === 'list' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-lg font-medium text-sm transition ${
              activeTab === 'add' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            + Add Product
          </button>
          <button
            onClick={() => { setActiveTab('orders'); fetchOrders(); }}
            className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-lg font-medium text-sm transition ${
              activeTab === 'orders' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Orders ({ordersList.length})
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white border border-gray-200 rounded-xl p-6">
          {/* TAB 1: PRODUCT LIST */}
          {activeTab === 'list' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Inventory Items</h2>
                <button
                  onClick={fetchProducts}
                  className="text-xs text-gray-500 hover:text-black font-medium"
                >
                  Refresh
                </button>
              </div>
              {loadingList ? (
                <p className="text-sm text-gray-500 py-8 text-center">Loading products...</p>
              ) : productsList.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No products found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {productsList.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={(item.images && item.images[0]) || (item.image && item.image[0]) || '/placeholder.png'}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="font-medium text-gray-900 line-clamp-1">{item.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {item.category} / {item.subCategory || item.subcategory}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{currency}{item.price}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRemoveProduct(item._id)}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD PRODUCT */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddProduct} className="max-w-xl space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Create New Product</h2>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Product Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Linen Casual Shirt"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of material, cut, and care instructions..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120"
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Subcategory</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Topwear">Topwear</option>
                    <option value="Bottomwear">Bottomwear</option>
                    <option value="Winterwear">Winterwear</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-2">Available Sizes</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border ${
                        sizes.includes(sz) ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={bestseller}
                  onChange={(e) => setBestseller(e.target.checked)}
                  className="w-4 h-4 rounded text-black"
                />
                <label htmlFor="bestseller" className="text-sm text-gray-700">Mark as Bestseller</label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Product Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              <button
                type="submit"
                className="mt-4 bg-black text-white px-6 py-2.5 rounded-md font-medium text-sm hover:bg-gray-800 transition"
              >
                Publish Product
              </button>
            </form>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Customer Orders</h2>
                <button
                  onClick={fetchOrders}
                  className="text-xs text-gray-500 hover:text-black font-medium"
                >
                  Refresh
                </button>
              </div>
              {loadingOrders ? (
                <p className="text-sm text-gray-500 py-8 text-center">Loading orders...</p>
              ) : ordersList.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No orders received yet.</p>
              ) : (
                <div className="space-y-4">
                  {ordersList.map((ord, idx) => (
                    <div key={ord._id || idx} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="font-semibold text-sm text-gray-900">
                          Order #{ord._id ? ord._id.slice(-6).toUpperCase() : idx + 1}
                        </p>
                        <p><strong>Customer:</strong> {ord.address?.firstName} {ord.address?.lastName} ({ord.address?.phone})</p>
                        <p><strong>Address:</strong> {ord.address?.street}, {ord.address?.city}, {ord.address?.state}</p>
                        <p><strong>Items:</strong> {ord.items?.map(i => `${i.name} (x${i.quantity || 1}, ${i.size})`).join(', ')}</p>
                        <p><strong>Total:</strong> <span className="font-semibold text-gray-900">{currency}{ord.amount}</span> ({ord.paymentMethod})</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={ord.status || 'Order Placed'}
                          onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Packing">Packing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for delivery">Out for delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
