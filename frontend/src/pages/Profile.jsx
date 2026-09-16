import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { backendUrl, token, setToken, setCartItems, navigate, getCartCount } = useContext(ShopContext);

  const [userData, setUserData] = useState({
    name: 'Zafran Customer',
    email: 'customer@zafran.com',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [savedDetails, setSavedDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch user profile info
      const res = await axios.get(`${backendUrl || ''}/api/user/profile`, { headers: { token } });
      if (res.data.success && res.data.user) {
        setUserData(res.data.user);
        setSavedDetails({
          name: res.data.user.name || '',
          phone: res.data.user.phone || '',
          address: res.data.user.address || ''
        });
      }

      // Fetch order statistics
      const ordersRes = await axios.post(`${backendUrl || ''}/api/order/userOrders`, {}, { headers: { token } });
      if (ordersRes.data.success && ordersRes.data.orders) {
        setOrderCount(ordersRes.data.orders.length);
        setRecentOrders(ordersRes.data.orders.slice(0, 3));
      }
    } catch (err) {
      console.log('Error loading profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [token]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserData(prev => ({ ...prev, ...savedDetails }));
    setEditMode(false);
    toast.success('Profile details updated locally');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="border-t pt-10 min-h-[70vh]">
      <div className="text-2xl mb-8">
        <Title text1="MY" text2="PROFILE" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-900 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow">
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{userData.name || 'Valued Customer'}</h2>
          <p className="text-sm text-gray-500 mt-1">{userData.email || 'customer@zafran.com'}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Verified Customer
          </div>

          <hr className="w-full my-6 border-gray-200" />

          {/* Quick Stats */}
          <div className="w-full grid grid-cols-2 gap-3 text-center mb-6">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded">
              <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">Total Orders</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded">
              <p className="text-2xl font-bold text-gray-900">{getCartCount()}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">In Cart</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            <Link
              to="/orders"
              className="w-full py-2.5 px-4 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition text-center"
            >
              View Order History
            </Link>
            <Link
              to="/cart"
              className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition text-center"
            >
              My Shopping Cart
            </Link>
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition"
            >
              Logout from Account
            </button>
          </div>
        </div>

        {/* Right Column: Account Details & Management */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Account Details Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900">Personal Information</h3>
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="text-xs font-semibold uppercase tracking-wider text-black hover:underline"
              >
                {editMode ? 'Cancel' : 'Edit Info'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={savedDetails.name}
                    onChange={(e) => setSavedDetails({ ...savedDetails, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 01880172859"
                    value={savedDetails.phone}
                    onChange={(e) => setSavedDetails({ ...savedDetails, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Default Delivery Address</label>
                  <textarea
                    placeholder="House, Road, Area, District"
                    rows="2"
                    value={savedDetails.address}
                    onChange={(e) => setSavedDetails({ ...savedDetails, address: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  ></textarea>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-gray-800 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-xs text-gray-500 uppercase block font-medium mb-1">Full Name</span>
                  <span className="font-semibold text-gray-900">{userData.name || 'Not specified'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-xs text-gray-500 uppercase block font-medium mb-1">Email Address</span>
                  <span className="font-semibold text-gray-900">{userData.email || 'customer@zafran.com'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-xs text-gray-500 uppercase block font-medium mb-1">Contact Phone</span>
                  <span className="font-semibold text-gray-900">{userData.phone || '+880 (Add in Edit)'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-xs text-gray-500 uppercase block font-medium mb-1">Account Status</span>
                  <span className="font-semibold text-emerald-600">Active (Standard Member)</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help & Hotline */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-base text-gray-900 mb-2">Need Help with Your Order?</h4>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Our support team is active 24/7 to assist you with gadget inquiries, order tracking, and returns.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-800">
              <div className="flex items-center gap-1.5">
                <span>📞 Hotline:</span>
                <a href="tel:01880172859" className="font-bold hover:underline">01880172859</a>
                <span>/</span>
                <a href="tel:01742111888" className="font-bold hover:underline">01742111888</a>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✉️ Email:</span>
                <a href="mailto:contact@zafran.com" className="font-bold hover:underline">contact@zafran.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
