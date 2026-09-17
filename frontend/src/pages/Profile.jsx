import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Profile = () => {
  const { backendUrl, token, setToken, setCartItems, navigate, getCartCount, fetchUserProfile, setUserData: setContextUserData } = useContext(ShopContext);

  const [userData, setUserData] = useState({
    name: 'Zafran Customer',
    email: 'customer@zafran.com',
    phone: '',
    address: '',
    profilePic: '',
    loginCount: 1,
    createdAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [savedDetails, setSavedDetails] = useState({
    name: '',
    phone: '',
    address: '',
    profilePic: ''
  });

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl || ''}/api/user/profile`, { headers: { token } });
      if (res.data.success && res.data.user) {
        setUserData(res.data.user);
        setSavedDetails({
          name: res.data.user.name || '',
          phone: res.data.user.phone || '',
          address: res.data.user.address || '',
          profilePic: res.data.user.profilePic || ''
        });
      }

      // Fetch order statistics
      const ordersRes = await axios.post(`${backendUrl || ''}/api/order/userOrders`, {}, { headers: { token } });
      if (ordersRes.data.success && ordersRes.data.orders) {
        setOrderCount(ordersRes.data.orders.length);
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfilePic = async () => {
    if (!selectedFile && !imagePreview) return;
    setUploadingPic(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePic', selectedFile);
        res = await axios.post(`${backendUrl || ''}/api/user/update-profile`, formData, {
          headers: { token }
        });
      } else {
        res = await axios.post(`${backendUrl || ''}/api/user/update-profile`, {
          profilePic: imagePreview
        }, {
          headers: { token }
        });
      }

      if (res.data.success) {
        toast.success('Profile picture updated successfully!');
        const updated = res.data.user || {};
        const pic = updated.profilePic || imagePreview;
        setUserData(prev => ({ ...prev, profilePic: pic }));
        setSavedDetails(prev => ({ ...prev, profilePic: pic }));
        if (setContextUserData) setContextUserData(prev => ({ ...prev, profilePic: pic }));
        if (fetchUserProfile) fetchUserProfile(token);
        setSelectedFile(null);
        setImagePreview(null);
      } else {
        toast.error(res.data.message || 'Failed to update profile picture');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating picture: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl || ''}/api/user/update-profile`, {
        name: savedDetails.name,
        phone: savedDetails.phone,
        address: savedDetails.address
      }, {
        headers: { token }
      });

      if (res.data.success) {
        toast.success('Profile details saved successfully');
        setUserData(prev => ({ ...prev, ...savedDetails }));
        if (setContextUserData) setContextUserData(prev => ({ ...prev, ...savedDetails }));
        if (fetchUserProfile) fetchUserProfile(token);
        setEditMode(false);
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const currentAvatar = imagePreview || userData.profilePic;

  return (
    <div className="border-t pt-10 min-h-[70vh]">
      <div className="text-2xl mb-8">
        <Title text1="MY" text2="PROFILE" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Avatar Card */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm flex items-center justify-center bg-gray-100">
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt={userData.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-black text-white flex items-center justify-center text-3xl font-bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            {/* Change Picture Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-md hover:bg-neutral-800 transition active:scale-95 cursor-pointer border-2 border-white"
              title="Change Profile Picture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          {imagePreview && (
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveProfilePic}
                disabled={uploadingPic}
                className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
              >
                {uploadingPic ? 'Saving...' : 'Save Picture'}
              </button>
              <button
                type="button"
                onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-900">{userData.name || 'Valued Customer'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{userData.email || 'customer@zafran.com'}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified Customer
          </div>

          <hr className="w-full my-5 border-gray-100" />

          {/* Quick Stats */}
          <div className="w-full grid grid-cols-2 gap-3 text-center mb-6">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-xl font-bold text-gray-900">{orderCount}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Orders</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-xl font-bold text-gray-900">{userData.loginCount || 1}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total Logins</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            <Link
              to="/orders"
              className="w-full py-2.5 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition text-center"
            >
              View Order History
            </Link>
            <Link
              to="/cart"
              className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition text-center"
            >
              My Shopping Cart ({getCartCount()})
            </Link>
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-red-50 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition"
            >
              Logout from Account
            </button>
          </div>
        </div>

        {/* Right Column: Account Details & Management */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Account Details Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-400 mt-0.5">Manage your shipping and account details</p>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="text-xs font-bold uppercase tracking-wider text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
              >
                {editMode ? 'Cancel' : 'Edit Info'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={savedDetails.name}
                    onChange={(e) => setSavedDetails({ ...savedDetails, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 01880172859"
                    value={savedDetails.phone}
                    onChange={(e) => setSavedDetails({ ...savedDetails, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">Default Delivery Address</label>
                  <textarea
                    placeholder="House, Road, Area, City, District"
                    rows="2"
                    value={savedDetails.address}
                    onChange={(e) => setSavedDetails({ ...savedDetails, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  ></textarea>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold tracking-wider mb-1">Full Name</span>
                  <span className="font-semibold text-gray-900">{userData.name || 'Not specified'}</span>
                </div>
                <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold tracking-wider mb-1">Email Address</span>
                  <span className="font-semibold text-gray-900">{userData.email || 'customer@zafran.com'}</span>
                </div>
                <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold tracking-wider mb-1">Contact Phone</span>
                  <span className="font-semibold text-gray-900">{userData.phone || 'Not added yet'}</span>
                </div>
                <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold tracking-wider mb-1">Delivery Address</span>
                  <span className="font-semibold text-gray-900 line-clamp-1">{userData.address || 'Not added yet'}</span>
                </div>
                <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold tracking-wider mb-1">Member Since</span>
                  <span className="font-semibold text-gray-800">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently Joined'}
                  </span>
                </div>
                <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase block font-bold tracking-wider mb-1">Account Security</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Protected & Encrypted
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Help & Hotline */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="font-bold text-sm text-gray-900 mb-1">Need Help with Your Orders?</h4>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Our support team is available 24/7 to assist you with gadget inquiries, order tracking, and live chat.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-800">
              <div className="flex items-center gap-1.5">
                <span>📞 Hotline:</span>
                <a href="tel:01880172859" className="hover:underline text-black">01880172859</a>
                <span>/</span>
                <a href="tel:01742111888" className="hover:underline text-black">01742111888</a>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✉️ Support:</span>
                <a href="mailto:contact@zafran.com" className="hover:underline text-black">contact@zafran.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
