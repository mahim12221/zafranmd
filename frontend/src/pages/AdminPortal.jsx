import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import AdminChat from '../components/AdminChat';

const AdminPortal = () => {
  const { backendUrl, currency, getProductsData, setDeliveryFee, fetchDeliverySettings, selectedChatUser, setSelectedChatUser } = useContext(ShopContext);
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

  // Product Details & Quick Edit Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editColors, setEditColors] = useState([]);
  const [newColorInput, setNewColorInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Orders list state
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dbStatus, setDbStatus] = useState('fallback');

  // Users management state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  // Delivery charge settings state
  const [adminDeliveryFee, setAdminDeliveryFee] = useState(60);
  const [adminDeliveryFeeDhaka, setAdminDeliveryFeeDhaka] = useState(60);
  const [adminDeliveryFeeOutside, setAdminDeliveryFeeOutside] = useState(120);
  const [adminFreeDelivery, setAdminFreeDelivery] = useState(2000);
  const [savingSettings, setSavingSettings] = useState(false);

  // Dedicated Admin Profile & Identity State (completely separate from customer user state)
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('kaviro_admin_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Kaviro Super Admin',
        email: 'admin@kaviro.com',
        role: 'Super Administrator',
        title: 'Executive Store Manager',
        phone: '+880 1700-000000',
        profilePic: '',
        lastLogin: new Date()
      };
    } catch {
      return {
        name: 'Kaviro Super Admin',
        email: 'admin@kaviro.com',
        role: 'Super Administrator',
        title: 'Executive Store Manager',
        phone: '+880 1700-000000',
        profilePic: '',
        lastLogin: new Date()
      };
    }
  });

  const [adminEditForm, setAdminEditForm] = useState({
    name: 'Kaviro Super Admin',
    title: 'Executive Store Manager',
    phone: '+880 1700-000000'
  });
  const [adminAvatarFile, setAdminAvatarFile] = useState(null);
  const [adminAvatarPreview, setAdminAvatarPreview] = useState('');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);

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
      fetchUsers();
      fetchAdminProfile();

      // Periodic auto-sync so cancellations from customer or updates reflect without reload
      const syncTimer = setInterval(() => {
        fetchOrders();
        fetchUsers();
      }, 10000);
      return () => clearInterval(syncTimer);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [adminToken]);

  const fetchAdminProfile = async () => {
    if (!adminToken) return;
    try {
      const res = await axios.get((backendUrl || '') + '/api/user/admin/profile', {
        headers: { token: adminToken }
      });
      if (res.data.success && res.data.admin) {
        setAdminProfile(res.data.admin);
        setAdminEditForm({
          name: res.data.admin.name || 'Zafran Super Admin',
          title: res.data.admin.title || 'Executive Store Manager',
          phone: res.data.admin.phone || '+880 1700-000000'
        });
        localStorage.setItem('zafran_admin_profile', JSON.stringify(res.data.admin));
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
    }
  };

  const handleSaveAdminProfile = async (e) => {
    if (e) e.preventDefault();
    setSavingAdminProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', adminEditForm.name || '');
      formData.append('title', adminEditForm.title || '');
      formData.append('phone', adminEditForm.phone || '');
      if (adminAvatarFile) {
        formData.append('profilePic', adminAvatarFile);
      } else if (adminAvatarPreview) {
        formData.append('profilePic', adminAvatarPreview);
      } else if (adminProfile.profilePic) {
        formData.append('profilePic', adminProfile.profilePic);
      }

      const res = await axios.post((backendUrl || '') + '/api/user/admin/update-profile', formData, {
        headers: { 
          token: adminToken,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success && res.data.admin) {
        setAdminProfile(res.data.admin);
        localStorage.setItem('zafran_admin_profile', JSON.stringify(res.data.admin));
        toast.success('Admin profile updated successfully!');
        setAdminAvatarFile(null);
      } else {
        const updated = {
          ...adminProfile,
          name: adminEditForm.name,
          title: adminEditForm.title,
          phone: adminEditForm.phone,
          profilePic: adminAvatarPreview || adminProfile.profilePic
        };
        setAdminProfile(updated);
        localStorage.setItem('zafran_admin_profile', JSON.stringify(updated));
        toast.success('Admin profile updated!');
      }
    } catch (err) {
      console.error('Error updating admin profile:', err);
      const updated = {
        ...adminProfile,
        name: adminEditForm.name,
        title: adminEditForm.title,
        phone: adminEditForm.phone,
        profilePic: adminAvatarPreview || adminProfile.profilePic
      };
      setAdminProfile(updated);
      localStorage.setItem('zafran_admin_profile', JSON.stringify(updated));
      toast.success('Admin profile updated!');
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const fetchUsers = async () => {
    if (!adminToken) return;
    setLoadingUsers(true);
    try {
      const res = await axios.get((backendUrl || '') + '/api/user/admin/all-users', { headers: { token: adminToken } });
      if (res.data.success) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail, userName) => {
    if (!userId && !userEmail) return;

    // Optimistic removal
    const originalUsers = [...usersList];
    setUsersList(prev => prev.filter(u => u._id !== userId && u.email !== userEmail));
    if (selectedUserForModal && (selectedUserForModal._id === userId || selectedUserForModal.email === userEmail)) {
      setSelectedUserForModal(null);
    }

    try {
      const activeToken = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token') || 'admin_secret_token';
      const res = await axios.post(
        (backendUrl || '') + '/api/user/admin/delete-user',
        { userId, email: userEmail },
        { headers: { token: activeToken } }
      );
      if (res.data.success) {
        toast.success(res.data.message || 'User account removed successfully');
      } else {
        toast.error(res.data.message || 'Failed to remove user account');
        setUsersList(originalUsers);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'User delete failed');
      setUsersList(originalUsers);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post((backendUrl || '') + '/api/user/admin', { email, password });
      if (response.data.success) {
        setAdminToken(response.data.token);
        if (response.data.admin) {
          setAdminProfile(response.data.admin);
          setAdminEditForm({
            name: response.data.admin.name || 'Zafran Super Admin',
            title: response.data.admin.title || 'Executive Store Manager',
            phone: response.data.admin.phone || '+880 1700-000000'
          });
          localStorage.setItem('zafran_admin_profile', JSON.stringify(response.data.admin));
        }
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

  const handleRemoveProduct = async (id, e) => {
    if (e) e.stopPropagation();
    
    // Optimistic UI update so product vanishes immediately on click
    const originalList = [...productsList];
    setProductsList(prev => prev.filter(p => p._id !== id));
    if (selectedProduct && selectedProduct._id === id) {
      setSelectedProduct(null);
    }

    try {
      const activeToken = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token') || 'admin_secret_token';
      const res = await axios.post(
        (backendUrl || '') + '/api/product/remove', 
        { id }, 
        { headers: { token: activeToken } }
      );
      if (res.data.success) {
        toast.success('Product deleted successfully!');
        if (getProductsData) getProductsData();
      } else {
        toast.error(res.data.message || 'Failed to delete product');
        setProductsList(originalList);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Delete operation failed');
      setProductsList(originalList);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setEditPrice(product.price || '');
    setEditDiscount(product.discount || 0);
    setEditColors(Array.isArray(product.colors) ? [...product.colors] : []);
    setNewColorInput('');
  };

  const handleToggleStock = async (id, outOfStock, e) => {
    if (e) e.stopPropagation();
    try {
      const activeToken = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token') || 'admin_secret_token';
      const res = await axios.post(
        (backendUrl || '') + '/api/product/toggle-stock',
        { id, outOfStock },
        { headers: { token: activeToken } }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Stock status updated!");
        const newStatus = res.data.outOfStock !== undefined ? res.data.outOfStock : outOfStock;
        setProductsList(prev => prev.map(p => p._id === id ? { ...p, outOfStock: newStatus } : p));
        if (selectedProduct && selectedProduct._id === id) {
          setSelectedProduct(prev => ({ ...prev, outOfStock: newStatus }));
        }
      } else {
        toast.error(res.data.message || "Could not update stock status");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Stock update failed");
    }
  };

  const handleAddModalColor = () => {
    if (!newColorInput.trim()) return;
    const colorVal = newColorInput.trim();
    if (!editColors.includes(colorVal)) {
      setEditColors([...editColors, colorVal]);
    }
    setNewColorInput('');
  };

  const handleRemoveModalColor = (colorToRemove) => {
    setEditColors(editColors.filter(c => c !== colorToRemove));
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);
    try {
      const res = await axios.post(
        (backendUrl || '') + '/api/product/update',
        {
          id: selectedProduct._id,
          price: Number(editPrice),
          discount: Number(editDiscount),
          colors: editColors
        },
        { headers: { token: adminToken } }
      );

      if (res.data.success) {
        toast.success("Product details updated!");
        const updated = res.data.product || { 
          ...selectedProduct, 
          price: Number(editPrice), 
          discount: Number(editDiscount), 
          colors: editColors 
        };
        setSelectedProduct(updated);
        setProductsList(prev => prev.map(p => p._id === updated._id ? updated : p));
        if (getProductsData) getProductsData();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, customReason) => {
    try {
      let cancelReason = customReason;
      if ((newStatus === 'Cancelled' || newStatus.startsWith('Cancelled')) && !cancelReason) {
        cancelReason = "Cancelled by Admin";
      }
      const activeToken = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token') || 'admin_secret_token';
      const res = await axios.post((backendUrl || '') + '/api/order/status', { orderId, status: newStatus, cancelReason }, { headers: { token: activeToken } });
      if (res.data.success) {
        toast.success(res.data.message || 'Status updated');
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
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 selection:bg-amber-400 selection:text-black">
        <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-widest text-white">KAVIRO</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Executive Management Portal</p>
            </div>
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-medium bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span>← Storefront</span>
            </Link>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kaviro.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm placeholder:text-slate-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm placeholder:text-slate-600 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-sky-500/20 active:scale-[0.99] cursor-pointer"
            >
              Sign In to Admin Console
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-950/40 -mx-8 -mb-8 p-6 text-xs text-slate-400">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-semibold text-slate-300">Default Admin Credentials</span>
              <span className="text-[10px] text-sky-400 font-mono">Development Helper</span>
            </div>
            <p className="font-mono text-slate-400 text-[11px] select-all cursor-pointer bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              Email: <span className="text-sky-300">admin@kaviro.com</span><br/>
              Password: <span className="text-sky-300">admin1234</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-400 selection:text-black">
      {/* EXECUTIVE TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            {/* Show Admin Profile Avatar in Header instead of yellow Z */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border-2 border-sky-400/60 shadow-xs flex items-center justify-center text-sky-300 font-bold text-xs shrink-0">
              {adminProfile.profilePic ? (
                <img src={adminProfile.profilePic} alt={adminProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>
            <span className="text-base sm:text-lg font-black tracking-widest text-white hidden xs:inline">KAVIRO</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/30">
              ADMIN
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium ${
              dbStatus === 'mongodb'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                : 'bg-sky-950/80 text-sky-300 border border-sky-800/60'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dbStatus === 'mongodb' ? 'bg-emerald-400' : 'bg-sky-400'}`}></span>
              {dbStatus === 'mongodb' ? 'Atlas Database Connected' : 'In-Memory DB Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="text-xs px-2.5 py-1.5 sm:px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-medium transition flex items-center gap-1.5"
          >
            <span>🌐</span>
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          {/* DEDICATED ADMIN PROFILE CAPSULE */}
          <button
            onClick={() => setActiveTab('admin_profile')}
            className={`flex items-center gap-2 px-2.5 py-1.5 sm:px-3 rounded-xl border transition text-left cursor-pointer ${
              activeTab === 'admin_profile'
                ? 'bg-sky-500/20 border-sky-400/50 text-white'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
            title="Manage Admin Profile"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-slate-800 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-400/40 shadow-xs">
              {adminProfile.profilePic ? (
                <img src={adminProfile.profilePic} alt={adminProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs font-bold text-slate-100 max-w-[120px] truncate">{adminProfile.name || 'Zafran Admin'}</p>
              <p className="text-[10px] text-sky-400 font-medium truncate">{adminProfile.title || 'Super Admin'}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="text-xs px-2.5 py-1.5 sm:px-3 bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-800/50 rounded-lg font-semibold transition flex items-center gap-1"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ADMIN MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
        {/* Sidebar Navigation - Responsive Horizontally Scrollable Pills on Mobile */}
        <aside className="w-full md:w-56 lg:w-60 flex flex-row md:flex-col gap-1.5 shrink-0 p-1.5 sm:p-2 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto md:overflow-visible no-scrollbar">
          <button
            onClick={() => setActiveTab('list')}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition flex items-center justify-between gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'list' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <span>📦 Products</span>
            <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'list' ? 'bg-sky-400/25 text-sky-100' : 'bg-slate-800 text-slate-300'}`}>
              {productsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition whitespace-nowrap cursor-pointer ${
              activeTab === 'add' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            ➕ Add Product
          </button>

          <button
            onClick={() => { setActiveTab('orders'); fetchOrders(); }}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition flex items-center justify-between gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <span>📋 Orders</span>
            <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'orders' ? 'bg-sky-400/25 text-sky-100' : 'bg-slate-800 text-slate-300'}`}>
              {ordersList.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); fetchUsers(); }}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition flex items-center justify-between gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'users' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <span>👥 Customers</span>
            <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'users' ? 'bg-sky-400/25 text-sky-100' : 'bg-slate-800 text-slate-300'}`}>
              {usersList.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); fetchSettings(); }}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition whitespace-nowrap cursor-pointer ${
              activeTab === 'settings' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            🚚 Delivery Rates
          </button>

          <button
            onClick={() => { 
               if (activeTab === 'chat') {
                  setSelectedChatUser(null);
               } else {
                  setActiveTab('chat');
               }
            }}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition flex items-center justify-between gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'chat' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <span>💬 Live Support</span>
            <span className="bg-sky-400/30 text-sky-200 border border-sky-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold">Chat</span>
          </button>

          <div className="hidden md:block my-2 border-t border-slate-800/80"></div>

          {/* DEDICATED ADMIN PROFILE TAB IN SIDEBAR */}
          <button
            onClick={() => setActiveTab('admin_profile')}
            className={`shrink-0 md:shrink sm:flex-initial text-left px-3.5 py-2 sm:py-2.5 rounded-xl font-medium text-xs md:text-sm transition flex items-center justify-between gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'admin_profile' ? 'bg-sky-400/15 text-sky-200 border border-sky-400/40 font-bold backdrop-blur-xs shadow-xs' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
            }`}
          >
            <span className="flex items-center gap-1.5">🛡️ Admin Profile</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/30">Self</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full min-w-0 bg-white text-slate-900 rounded-2xl p-3 sm:p-5 md:p-6 shadow-xl border border-slate-800/50 min-h-[550px] overflow-hidden">
          {/* TAB 1: PRODUCT LIST WITH QUICK EDIT & DETAILS MODAL */}
          {activeTab === 'list' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Product Inventory & Stock Management</h2>
                  <p className="text-xs text-gray-500">Click on any product row or Edit button to view details, edit price/discount/colors, or check comments.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-full">
                    Total: {productsList.length} Items
                  </span>
                  <button
                    onClick={fetchProducts}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {loadingList ? (
                <p className="text-sm text-gray-500 py-8 text-center">Loading products...</p>
              ) : productsList.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No products found.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-[0.8fr_2.5fr_1fr_1fr_1.2fr_1.2fr] items-center py-2 px-3 border bg-gray-100 text-xs font-bold uppercase text-gray-700 rounded-lg">
                    <b>Image</b>
                    <b>Name & View</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b className="text-center">Stock Status</b>
                    <b className="text-right">Actions</b>
                  </div>

                  {/* Product Rows */}
                  {productsList.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => openProductModal(item)}
                      className="p-3 border border-gray-200 rounded-xl bg-white hover:bg-blue-50/40 transition cursor-pointer group shadow-2xs md:grid md:grid-cols-[0.8fr_2.5fr_1fr_1fr_1.2fr_1.2fr] md:items-center md:gap-2 md:py-2.5 md:px-3 text-sm min-w-0 w-full overflow-hidden"
                    >
                      <div className="flex items-start gap-3 min-w-0 md:contents">
                        <img
                          src={(item.images && item.images[0]) || (item.image && item.image[0]) || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-14 h-14 md:w-12 md:h-12 object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.5 rounded shrink-0">👁️ View</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                            <span className="text-gray-500">{item.category}</span>
                            <span className="text-gray-300 md:hidden">•</span>
                            <span className="font-bold text-gray-900 md:hidden">{currency}{item.price}</span>
                            {Number(item.discount) > 0 && <span className="text-[10px] font-bold text-red-500 md:hidden">-{item.discount}%</span>}
                          </div>
                          {item.outOfStock && <span className="md:hidden inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Out of Stock</span>}
                        </div>

                        <p className="hidden md:block text-gray-600 text-xs truncate">{item.category}</p>

                        <div className="hidden md:block">
                          <p className="font-bold text-gray-900">{currency}{item.price}</p>
                          {Number(item.discount) > 0 && <span className="text-[10px] font-bold text-red-500">-{item.discount}% Off</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 md:border-t-0 md:mt-0 md:pt-0 md:contents">
                        {/* Stock Toggle Button */}
                        <div className="flex items-center md:justify-center shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStock(item._id, !item.outOfStock, e)}
                            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                              item.outOfStock 
                                 ? 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100' 
                                 : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            }`}
                            title="Toggle Stock Availability"
                          >
                            <span className={`w-2 h-2 rounded-full ${item.outOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <span>{item.outOfStock ? 'Out of Stock' : 'In Stock'}</span>
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openProductModal(item)}
                            className="text-blue-600 hover:text-blue-800 font-bold px-2.5 py-1 hover:bg-blue-100/60 rounded-lg transition text-xs border border-blue-200"
                            title="View Details & Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveProduct(item._id, e)}
                            className="text-red-600 hover:text-red-800 font-bold px-2.5 py-1 hover:bg-red-100/60 rounded-lg transition text-xs border border-red-200"
                            title="Delete Product"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ADMIN PRODUCT DETAILS & QUICK EDIT MODAL */}
              {selectedProduct && (
                <div 
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
                  onClick={() => setSelectedProduct(null)}
                >
                  <div 
                    className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 my-8 space-y-5 text-gray-900 relative"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Close Modal Button */}
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-lg bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                    >
                      ✕
                    </button>

                    {/* Modal Header */}
                    <div className="flex items-start gap-4 border-b pb-4">
                      <img 
                        src={(selectedProduct.images && selectedProduct.images[0]) || (selectedProduct.image && selectedProduct.image[0]) || '/placeholder.jpg'} 
                        alt={selectedProduct.name} 
                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {selectedProduct.category}
                          </span>
                          {selectedProduct.outOfStock ? (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">In Stock</span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mt-1">{selectedProduct.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{selectedProduct.description}</p>
                      </div>
                    </div>

                    {/* Quick Edit Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <span>✏️ Quick Edit Price & Color Variants</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Edit Price */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Price ({currency})</label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Price"
                          />
                        </div>

                        {/* Edit Discount */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                          <input
                            type="number"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Discount %"
                          />
                        </div>
                      </div>

                      {/* Edit Colors / Variants */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Color Variants</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editColors.length === 0 ? (
                            <span className="text-xs text-gray-400 italic">No colors specified</span>
                          ) : (
                            editColors.map((col, i) => (
                              <span key={i} className="inline-flex items-center gap-1 bg-black text-white text-xs px-2.5 py-1 rounded-full">
                                {col}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveModalColor(col)}
                                  className="hover:text-red-300 font-bold text-xs ml-1"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        <div className="flex flex-col xs:flex-row gap-2 w-full min-w-0">
                          <input
                            type="text"
                            value={newColorInput}
                            onChange={(e) => setNewColorInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModalColor())}
                            placeholder="e.g. Matte Black"
                            className="flex-1 min-w-0 w-full px-3 py-2 sm:py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
                          />
                          <button
                            type="button"
                            onClick={handleAddModalColor}
                            className="bg-gray-800 hover:bg-black text-white text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg transition shrink-0 w-full xs:w-auto cursor-pointer"
                          >
                            + Add Color
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          disabled={isUpdating}
                          className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isUpdating ? "Saving..." : "💾 Save Changes"}
                        </button>
                      </div>
                    </div>

                    {/* Customer Reviews Section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <span>💬 Customer Reviews ({selectedProduct.reviews?.length || 0})</span>
                        </h4>
                        <span className="text-[10px] text-gray-500 italic">
                          *Customers can remove their own comments directly from the product page
                        </span>
                      </div>

                      {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                        <p className="text-xs text-gray-400 italic py-2">No customer comments yet on this product.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {selectedProduct.reviews.map((rev, i) => (
                            <div key={rev._id || i} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start justify-between gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{rev.userName || rev.name || 'Customer'}</span>
                                  <span className="text-amber-500 font-bold">★ {rev.rating || 5}</span>
                                </div>
                                <p className="text-xs text-gray-700 mt-0.5">{rev.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-3 border-t flex justify-end">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
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
                      <option value="Gadgets">Gadgets</option>
                      <option value="Fidget &amp; EDC">Fidget &amp; EDC</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Smart Gear">Smart Gear</option>
                      <option value="Accessories">Accessories</option>
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
                      <option value="Fidget Toys">Fidget Toys</option>
                      <option value="EDC Gear">EDC Gear</option>
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Desk Gadgets">Desk Gadgets</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Power &amp; Charging">Power &amp; Charging</option>
                      <option value="Smart Devices">Smart Devices</option>
                      <option value="Accessories">Accessories</option>
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
                <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full min-w-0">
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
                    placeholder="Type custom color (e.g. Orange, Navy, Gold)..."
                    className="flex-1 min-w-0 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 sm:py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 sm:py-2 rounded-xl transition cursor-pointer shrink-0 w-full sm:w-auto"
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
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Customer Orders</h2>
                  <p className="text-xs text-gray-400">Manage real-time order processing, fraud rejections &amp; cancellations.</p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="text-xs text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>Refresh Orders</span>
                </button>
              </div>
              {loadingOrders ? (
                <p className="text-sm text-gray-500 py-8 text-center">Loading orders...</p>
              ) : ordersList.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No orders received yet.</p>
              ) : (
                <div className="space-y-4">
                  {ordersList.map((ord, idx) => {
                    const isCancelled = ord.status === 'Cancelled' || ord.status?.startsWith('Cancelled');
                    const isDelivered = ord.status === 'Delivered';

                    // Compute normalized select value so dropdown NEVER falls back to 'Order Placed'
                    let selectStatus = ord.status || 'Order Placed';
                    if (selectStatus.includes('Fraud') || selectStatus.includes('Risk') || selectStatus.includes('Suspected')) {
                      selectStatus = 'Cancelled (Fraud)';
                    } else if (selectStatus.startsWith('Cancelled')) {
                      selectStatus = 'Cancelled';
                    }

                    return (
                      <div key={ord._id || idx} className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${isCancelled ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-gray-200'}`}>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-900">
                              Order #{ord._id ? ord._id.slice(-6).toUpperCase() : idx + 1}
                            </p>
                            {isCancelled && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                                🚫 {selectStatus === 'Cancelled (Fraud)' ? 'Cancelled (Fraud / Suspected)' : 'Cancelled (Customer Request)'}
                              </span>
                            )}
                          </div>
                          <p><strong>Customer:</strong> {ord.address?.firstName} {ord.address?.lastName} ({ord.address?.phone})</p>
                          {ord.userId && (
                            <button
                              onClick={() => {
                                setSelectedChatUser(ord.userId);
                                setActiveTab('chat');
                              }}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-black px-2 py-1 rounded inline-flex items-center gap-1 mt-1 font-medium transition cursor-pointer"
                            >
                              💬 Message User
                            </button>
                          )}
                          <p><strong>Address:</strong> {ord.address?.detailedAddress || ord.address?.street}, {ord.address?.upazila || ''} {ord.address?.district}, {ord.address?.division || ord.address?.state}</p>
                          <p><strong>Items:</strong> {ord.items?.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')}</p>
                          <p><strong>Total:</strong> <span className="font-semibold text-gray-900">{currency}{ord.amount}</span> ({ord.paymentMethod})</p>
                          {isCancelled && ord.cancelReason && (
                            <p className="text-xs text-rose-700 font-semibold bg-rose-100/80 p-1.5 rounded border border-rose-200 mt-1">
                              Reason: {ord.cancelReason}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
                          {isDelivered && (
                            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Delivered • Auto-cleans in 8 days to save storage</span>
                            </div>
                          )}

                          {!isCancelled && !isDelivered && (
                            <button
                              onClick={() => handleStatusChange(ord._id, 'Cancelled (Fraud)', 'Cancelled by Admin (Risk/Fraud Inspection)')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Cancel or reject fraud order"
                            >
                              🚫 Reject / Fraud Cancel
                            </button>
                          )}

                          <select
                            value={selectStatus}
                            onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                            className={`border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black bg-white cursor-pointer ${
                              isCancelled ? 'border-rose-300 text-rose-700 font-bold bg-rose-50/80' : 'border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for delivery">Out for delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled (Customer Request)</option>
                            <option value="Cancelled (Fraud)">Cancelled (Fraud / Risk)</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
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

          {/* TAB 5: CHAT */}
          {activeTab === 'chat' && (
            <AdminChat adminToken={adminToken} ordersList={ordersList} />
          )}

          {/* TAB 6: USERS & LOGINS (READ-ONLY) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Users & Login Activity</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track registered customer accounts, session login frequencies, and profile details.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Admin Read-Only Protection
                  </span>
                  <button
                    onClick={fetchUsers}
                    className="text-xs text-gray-600 hover:text-black font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Registered Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{usersList.length}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Verified customer accounts</p>
                </div>
                <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Cumulative Logins</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {usersList.reduce((acc, u) => acc + (Number(u.loginCount) || 1), 0)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Total sessions tracked</p>
                </div>
                <div className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Customer Orders Placed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{ordersList.length}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Across entire store</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search user by name, email, or phone number..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                />
                {userSearchQuery && (
                  <button onClick={() => setUserSearchQuery('')} className="text-xs text-gray-400 hover:text-black">
                    Clear
                  </button>
                )}
              </div>

              {/* Users Table */}
              {loadingUsers ? (
                <div className="py-12 text-center text-sm text-gray-500 font-medium">Loading registered users...</div>
              ) : usersList.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 font-medium">No users found.</div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4 text-center">Logins</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usersList
                        .filter(u => {
                          if (!userSearchQuery.trim()) return true;
                          const q = userSearchQuery.toLowerCase();
                          return (
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.phone && u.phone.toLowerCase().includes(q))
                          );
                        })
                        .map((user) => {
                          const userOrders = ordersList.filter(o => o.userId === user._id);
                          return (
                            <tr key={user._id} className="hover:bg-gray-50/70 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {user.profilePic ? (
                                    <img src={user.profilePic} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900">{user.name || 'Anonymous User'}</p>
                                    <p className="text-[11px] text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium text-gray-700">
                                {user.phone || <span className="text-gray-400 italic">Not set</span>}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-900 font-bold rounded-full text-[11px] border border-gray-200">
                                  {user.loginCount || 1} logins
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 font-medium">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Registered'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedUserForModal(user)}
                                    className="px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
                                  >
                                    View Profile (Read-Only)
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (setSelectedChatUser) setSelectedChatUser(user._id);
                                      setActiveTab('chat');
                                    }}
                                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold rounded-lg transition"
                                    title="Open Chat with User"
                                  >
                                    💬 Chat
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user._id, user.email, user.name)}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                                    title="Remove user account (they can re-register with this Gmail later)"
                                  >
                                    🗑️ Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* READ-ONLY USER DETAIL MODAL */}
              {selectedUserForModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
                  <div className="bg-white rounded-2xl max-w-[92vw] sm:max-w-lg w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-sky-100">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🛡️</span>
                        <div>
                          <h3 className="font-bold text-base text-gray-900">User Profile Details</h3>
                          <p className="text-[11px] text-sky-700 font-medium">🔒 Secure Read-Only Admin View</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedUserForModal(null)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl leading-none font-bold flex items-center justify-center transition cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center mb-5">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-sky-300 mb-3 shadow-md bg-gray-100 flex items-center justify-center shrink-0">
                        {selectedUserForModal.profilePic ? (
                          <img src={selectedUserForModal.profilePic} alt={selectedUserForModal.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-900 text-sky-300 flex items-center justify-center text-3xl font-bold">
                            {selectedUserForModal.name ? selectedUserForModal.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">{selectedUserForModal.name || 'Customer'}</h4>
                      <p className="text-xs text-gray-500 break-all">{selectedUserForModal.email}</p>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                        Active Verified Member
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                        <span className="text-gray-500 font-medium">Phone Number</span>
                        <span className="font-bold text-gray-900">{selectedUserForModal.phone || 'Not provided'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-start gap-1">
                        <span className="text-gray-500 font-medium">Saved Shipping Address</span>
                        <span className="font-bold text-gray-900 text-right max-w-full sm:max-w-[220px] break-words">{selectedUserForModal.address || 'Not specified'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                        <span className="text-gray-500 font-medium">Total Logins Tracked</span>
                        <span className="font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-200">
                          {selectedUserForModal.loginCount || 1} times
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                        <span className="text-gray-500 font-medium">Registered Date</span>
                        <span className="font-bold text-gray-800">
                          {selectedUserForModal.createdAt ? new Date(selectedUserForModal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Earlier session'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                        <span className="text-gray-500 font-medium">Orders Placed</span>
                        <span className="font-bold text-gray-900">
                          {ordersList.filter(o => o.userId === selectedUserForModal._id).length} orders
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedUserForModal._id, selectedUserForModal.email, selectedUserForModal.name)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                        title="Delete account permanently. User can re-register with this Gmail later."
                      >
                        <span>🗑️</span>
                        <span>Remove User Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserForModal(null)}
                        className="px-5 py-2 bg-slate-900 hover:bg-black text-sky-300 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Close Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: DEDICATED ADMIN PROFILE & IDENTITY MANAGEMENT */}
          {activeTab === 'admin_profile' && (
            <div className="animate-fadeIn max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Admin Profile & Identity</h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                      Isolated Admin Realm
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your administrator credentials, photo avatar, contact title, and executive security access. This profile is completely isolated from regular user accounts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminProfile}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition self-start sm:self-auto cursor-pointer"
                >
                  🔄 Refresh Profile
                </button>
              </div>

              {/* ADMIN IDENTITY HERO CARD */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 mb-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                  {/* Avatar with live preview / hover to change */}
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-sky-400/50 shadow-2xl bg-slate-950 flex items-center justify-center">
                      {adminAvatarPreview ? (
                        <img src={adminAvatarPreview} alt="Admin Avatar Preview" className="w-full h-full object-cover" />
                      ) : adminProfile.profilePic ? (
                        <img src={adminProfile.profilePic} alt={adminProfile.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 text-sky-300 flex items-center justify-center text-4xl font-black">
                          {adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="admin-avatar-upload" 
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[11px] font-bold text-sky-300 cursor-pointer text-center p-2"
                    >
                      <span>📷 Change Photo</span>
                    </label>
                  </div>

                  {/* Admin Details */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">{adminProfile.name || 'Kaviro Super Admin'}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950">
                        {adminProfile.role || 'Super Admin'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-sky-300/90">{adminProfile.title || 'Executive Store Manager'}</p>
                    <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                      <span>📧 {adminProfile.email || 'admin@kaviro.com'}</span>
                      <span>•</span>
                      <span>📞 {adminProfile.phone || '+880 1700-000000'}</span>
                    </p>

                    <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
                        🟢 Active Admin Session
                      </span>
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
                        Security: JWT Bearer
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADMIN PROFILE EDIT FORM */}
              <form onSubmit={handleSaveAdminProfile} className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-1">Edit Admin Details</h4>
                  <p className="text-xs text-gray-500">Update your public administrative identity and avatar photo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Admin Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Admin Full Name
                    </label>
                    <input
                      type="text"
                      value={adminEditForm.name}
                      onChange={(e) => setAdminEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g. Kaviro Super Admin"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Admin Title / Role Description */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Executive Title / Designation
                    </label>
                    <input
                      type="text"
                      value={adminEditForm.title}
                      onChange={(e) => setAdminEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Executive Store Manager / Head of Operations"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Admin Contact Phone */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Admin Contact Phone
                    </label>
                    <input
                      type="text"
                      value={adminEditForm.phone}
                      onChange={(e) => setAdminEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+880 1700-000000"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Admin Email (Locked) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Admin System Email</span>
                      <span className="text-[10px] text-emerald-600 font-bold">🔒 System Locked</span>
                    </label>
                    <input
                      type="email"
                      value={adminProfile.email || 'admin@kaviro.com'}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                {/* Profile Picture Upload Section */}
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Admin Profile Picture / Avatar
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                      type="file"
                      id="admin-avatar-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAdminAvatarFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAdminAvatarPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer cursor-pointer"
                    />
                    
                    {adminAvatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminAvatarFile(null);
                          setAdminAvatarPreview('');
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                      >
                        Reset Avatar Preview
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Supported formats: PNG, JPG, WEBP. Your custom admin picture is visible across the administrative dashboard header and live support chat.
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={savingAdminProfile}
                    className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {savingAdminProfile ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Saving Admin Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Save Admin Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SECURITY & DATA SEPARATION OVERVIEW */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-700 text-lg">🛡️</span>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-900">Total Data Separation</h5>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    The admin panel uses a strictly separated authentication realm (`JWT_SECRET` administrative bearer). Regular customer profiles, passwords, and addresses are isolated from admin storage.
                  </p>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-700 text-lg">⚡</span>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-amber-900">8-Day Auto Storage Saver</h5>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Automated background lifecycle cleaner is active. Delivered orders are retained for 8 days for customer order tracking, then safely cleaned up to optimize database capacity.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
