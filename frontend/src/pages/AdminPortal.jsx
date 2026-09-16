import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const AdminPortal = () => {
  const { backendUrl, currency, getProductsData, setDeliveryFee, fetchDeliverySettings } = useContext(ShopContext);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('list'); // 'add', 'list', 'orders', 'settings'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Add Product form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [category, setCategory] = useState('Electronics');
  const [subCategory, setSubCategory] = useState('Smartphones');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColorInput, setCustomColorInput] = useState('');

  // Products list state
  const [productsList, setProductsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Orders list state
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dbStatus, setDbStatus] = useState('fallback');

  // Delivery charge settings state
  const [adminDeliveryFee, setAdminDeliveryFee] = useState(60);
  const [adminDeliveryFeeDhaka, setAdminDeliveryFeeDhaka] = useState(60);
  const [adminDeliveryFeeOutside, setAdminDeliveryFeeOutside] = useState(120);
  const [adminFreeDelivery, setAdminFreeDelivery] = useState(2000);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    axios.get((backendUrl || '') + '/api/health')
      .then(res => {
        if (res.data?.database) setDbStatus(res.data.database);
      })
      .catch(() => {});
  }, [backendUrl]);

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

  const fetchSettings = async () => {
    try {
      const res = await axios.get((backendUrl || '') + '/api/order/settings');
      if (res.data.success && res.data.settings) {
        const { deliveryFee, deliveryFeeDhaka, deliveryFeeOutside, freeDeliveryThreshold } = res.data.settings;
        if (deliveryFee !== undefined) setAdminDeliveryFee(deliveryFee);
        if (deliveryFeeDhaka !== undefined) setAdminDeliveryFeeDhaka(deliveryFeeDhaka);
        if (deliveryFeeOutside !== undefined) setAdminDeliveryFeeOutside(deliveryFeeOutside);
        if (freeDeliveryThreshold !== undefined) setAdminFreeDelivery(freeDeliveryThreshold);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveDeliverySettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = {
        deliveryFee: Number(adminDeliveryFee),
        deliveryFeeDhaka: Number(adminDeliveryFeeDhaka),
        deliveryFeeOutside: Number(adminDeliveryFeeOutside),
        freeDeliveryThreshold: Number(adminFreeDelivery)
      };
      const res = await axios.post((backendUrl || '') + '/api/order/settings', payload, { headers: { token: adminToken } });
      if (res.data.success) {
        toast.success(res.data.message || 'Delivery charge updated successfully!');
        if (setDeliveryFee) setDeliveryFee(Number(adminDeliveryFee));
        localStorage.setItem('zafran_delivery_fee', String(adminDeliveryFee));
        if (fetchDeliverySettings) fetchDeliverySettings();
      } else {
        toast.error(res.data.message || 'Failed to update settings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSavingSettings(false);
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

  const COLOR_PRESETS = [
    'Matte Black',
    'Space Gray',
    'Silver',
    'Alpine White',
    'Midnight Blue',
    'Crimson Red',
    'Rose Gold',
    'Gold',
    'Forest Green',
    'Titanium'
  ];

  const handleToggleColorPreset = (clr) => {
    setSelectedColors(prev => 
      prev.includes(clr) ? prev.filter(c => c !== clr) : [...prev, clr]
    );
  };

  const handleAddCustomColor = (e) => {
    if (e) e.preventDefault();
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    if (!selectedColors.includes(trimmed)) {
      setSelectedColors(prev => [...prev, trimmed]);
    }
    setCustomColorInput('');
  };

  const handleRemoveColor = (clr) => {
    setSelectedColors(prev => prev.filter(c => c !== clr));
  };

  const handleImageChange = (index, file) => {
    setImageFiles(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('discount', discount);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(['Standard']));
      formData.append('colors', JSON.stringify(selectedColors));

      if (imageFiles[0]) formData.append('image1', imageFiles[0]);
      if (imageFiles[1]) formData.append('image2', imageFiles[1]);
      if (imageFiles[2]) formData.append('image3', imageFiles[2]);
      if (imageFiles[3]) formData.append('image4', imageFiles[3]);

      const res = await axios.post((backendUrl || '') + '/api/product/add', formData, {
        headers: { token: adminToken }
      });

      if (res.data.success) {
        toast.success('Product added successfully');
        setName('');
        setDescription('');
        setPrice('');
        setDiscount('0');
        setSizes([]);
        setSelectedColors([]);
        setImageFiles([null, null, null, null]);
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
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Zafran Admin</h2>
              <p className="text-xs text-gray-500 mt-0.5">Secure Management Portal</p>
            </div>
            <Link to="/" className="text-xs text-gray-500 hover:text-black font-medium underline">
              ← Storefront
            </Link>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Admin Email</label>
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
              className="w-full bg-black text-white py-2.5 rounded-md font-medium text-sm hover:bg-gray-800 transition shadow-sm"
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">
              Admin Mode
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              dbStatus === 'mongodb'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'mongodb' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {dbStatus === 'mongodb' ? 'MongoDB Atlas Connected' : 'Local In-Memory Mode'}
            </span>
          </div>
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
          <button
            onClick={() => { setActiveTab('settings'); fetchSettings(); }}
            className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-lg font-medium text-sm transition ${
              activeTab === 'settings' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚙️ Delivery Charge
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
                        <th className="py-3 px-4">Discount</th>
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
                          <td className="py-3 px-4">
                            {Number(item.discount) > 0 ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-xs rounded">
                                -{item.discount}%
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
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
            <form onSubmit={handleAddProduct} className="max-w-2xl bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
                <p className="text-xs text-gray-400 mt-1">Add a new item to your catalog with dynamic pricing and discounts.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Product Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pro Wireless ANC Earbuds"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications, warranty, features, and package contents..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Price ({currency})</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1200"
                    required
                    min="1"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Discount (%)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="10"
                    min="0"
                    max="100"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-semibold text-red-600 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition cursor-pointer pr-8"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Gadgets">Gadgets</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Clothing">Clothing</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Subcategory</label>
                  <div className="relative">
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition cursor-pointer pr-8"
                    >
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Cameras">Cameras</option>
                      <option value="Power">Power</option>
                      <option value="Smartphones">Smartphones</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Others">Others</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={bestseller}
                  onChange={(e) => setBestseller(e.target.checked)}
                  className="w-4 h-4 rounded text-black cursor-pointer"
                />
                <label htmlFor="bestseller" className="text-xs font-semibold uppercase tracking-wider text-gray-800 cursor-pointer">
                  Feature this item as Bestseller on Homepage
                </label>
              </div>

              {/* Colors Configuration (Optional 1 or multiple) */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800">
                      Product Colors (Optional)
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Select preset colors or add custom shades. You can choose 1 color, multiple colors, or leave blank.
                    </p>
                  </div>
                  {selectedColors.length > 0 && (
                    <span className="text-[11px] font-bold text-black bg-white px-2.5 py-1 rounded-lg border border-gray-200 self-start sm:self-auto">
                      {selectedColors.length} color{selectedColors.length > 1 ? 's' : ''} chosen
                    </span>
                  )}
                </div>

                {/* Selected Colors Pills */}
                {selectedColors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedColors.map((clr, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        <span>{clr}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(clr)}
                          className="hover:text-red-300 text-white/80 transition cursor-pointer text-xs ml-0.5"
                          title="Remove color"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Preset Chips */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Quick Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((clr) => {
                      const isSelected = selectedColors.includes(clr);
                      return (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => handleToggleColorPreset(clr)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer border ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-black font-semibold'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {isSelected ? `✓ ${clr}` : `+ ${clr}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Adder */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    placeholder="Type custom color (e.g. Sunset Orange, Titanium)..."
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* Multi-Photo Upload Area (Up to 4 Images) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    Product Photos (Upload up to 4 Images)
                  </label>
                  <span className="text-[11px] text-gray-400">Photo 1 is the primary cover</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const currentFile = imageFiles[idx];
                    const previewUrl = currentFile ? URL.createObjectURL(currentFile) : null;

                    return (
                      <div
                        key={idx}
                        className="relative border-2 border-dashed border-gray-200 rounded-2xl p-2.5 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 transition min-h-[120px] text-center group"
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-24 flex items-center justify-center">
                            <img
                              src={previewUrl}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageChange(idx, null)}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm hover:bg-red-700 cursor-pointer"
                              title="Remove this photo"
                            >
                              ✕
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                              Photo {idx + 1}
                            </span>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-2">
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-black transition mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[11px] font-semibold text-gray-700">
                              {idx === 0 ? 'Primary Photo' : `Photo ${idx + 1}`}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-0.5">Click to upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageChange(idx, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition active:scale-98 shadow-sm cursor-pointer"
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
                        <p><strong>Address:</strong> {ord.address?.detailedAddress || ord.address?.street}, {ord.address?.upazila || ''} {ord.address?.district}, {ord.address?.division || ord.address?.state}</p>
                        <p><strong>Items:</strong> {ord.items?.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')}</p>
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

          {/* TAB 4: SETTINGS & DELIVERY CHARGE */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Charge &amp; Store Settings</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Configure standard delivery rates automatically applied during checkout.
                  </p>
                </div>
                <button
                  onClick={fetchSettings}
                  className="text-xs text-gray-500 hover:text-black font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              <form onSubmit={handleSaveDeliverySettings} className="space-y-5">
                <div className="bg-neutral-50/70 border border-gray-200/80 rounded-2xl p-5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-1">
                    Standard Flat Delivery Fee ({currency})
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Default shipping charge calculated on Cart &amp; Checkout pages.
                  </p>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-3 text-gray-500 font-semibold text-sm">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={adminDeliveryFee}
                      onChange={(e) => setAdminDeliveryFee(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 bg-white shadow-xs transition"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-gray-200/80 rounded-2xl p-5 bg-white shadow-xs">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-1">
                      Inside Dhaka Delivery ({currency})
                    </label>
                    <p className="text-[11px] text-gray-400 mb-3">Rate for addresses within Dhaka metro.</p>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-semibold text-sm">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        value={adminDeliveryFeeDhaka}
                        onChange={(e) => setAdminDeliveryFeeDhaka(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                        placeholder="60"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200/80 rounded-2xl p-5 bg-white shadow-xs">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-1">
                      Outside Dhaka Delivery ({currency})
                    </label>
                    <p className="text-[11px] text-gray-400 mb-3">Rate for countrywide courier orders.</p>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-semibold text-sm">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        value={adminDeliveryFeeOutside}
                        onChange={(e) => setAdminDeliveryFeeOutside(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200/80 rounded-2xl p-5 bg-white shadow-xs">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-800 mb-1">
                    Free Delivery Threshold ({currency})
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Orders above this total amount qualify for free shipping promotions.
                  </p>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-3 text-gray-500 font-semibold text-sm">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      value={adminFreeDelivery}
                      onChange={(e) => setAdminFreeDelivery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-black text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Delivery Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
