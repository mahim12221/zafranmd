import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const NavBar = ({ token, setToken }) => {
  const [adminData, setAdminData] = useState(() => {
    const saved = localStorage.getItem('adminProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Keriyo Super Admin',
      email: 'admin@keriyo.com',
      title: 'Executive Store Manager',
      phone: '+880 1700-000000',
      profilePic: ''
    };
  });

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(adminData.name || '');
  const [title, setTitle] = useState(adminData.title || '');
  const [phone, setPhone] = useState(adminData.phone || '');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewPic, setPreviewPic] = useState(adminData.profilePic || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get(`${backendUrl}/api/user/admin/profile`, { headers: { token } })
        .then(res => {
          if (res.data.success && res.data.admin) {
            setAdminData(res.data.admin);
            localStorage.setItem('adminProfile', JSON.stringify(res.data.admin));
          }
        }).catch(err => console.log(err));
    }
  }, [token]);

  const handleOpenModal = () => {
    setName(adminData.name || '');
    setTitle(adminData.title || '');
    setPhone(adminData.phone || '');
    setPreviewPic(adminData.profilePic || '');
    setProfilePicFile(null);
    setShowModal(true);
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('title', title);
    formData.append('phone', phone);
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    try {
      const res = await axios.post(`${backendUrl}/api/user/admin/update-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token
        }
      });

      if (res.data.success && res.data.admin) {
        setAdminData(res.data.admin);
        localStorage.setItem('adminProfile', JSON.stringify(res.data.admin));
        toast.success("Admin Profile updated successfully!");
        setShowModal(false);
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center py-2.5 px-[4%] justify-between bg-white border-b border-gray-200 shadow-xs'>
      <img className='w-32 sm:w-36 h-auto object-contain' src={assets.logo} alt="Keriyo Admin Logo" />

      <div className='flex items-center gap-3 sm:gap-5'>
        {/* Admin Profile Chip */}
        <div 
          onClick={handleOpenModal}
          className='flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full cursor-pointer transition shadow-2xs'
          title="Click to edit Admin Profile"
        >
          <div className="relative">
            {adminData.profilePic ? (
              <img src={adminData.profilePic} alt={adminData.name} className="w-8 h-8 rounded-full object-cover border border-gray-300" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {(adminData.name || 'Admin').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
          </div>

          <div className="hidden sm:block text-left pr-1">
            <p className="font-bold text-xs text-gray-900 leading-tight truncate max-w-[130px]">{adminData.name}</p>
            <p className="text-[10px] text-gray-500 truncate max-w-[130px]">{adminData.title || 'Administrator'}</p>
          </div>
          
          <span className="text-gray-400 text-xs hidden sm:inline">✏️</span>
        </div>

        <button 
          onClick={() => setToken('')} 
          className='bg-gray-800 hover:bg-black text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer'
        >
          Logout
        </button>
      </div>

      {/* Edit Admin Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 relative animate-fadeIn">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span>👤</span>
                <span>Edit Admin Profile</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative group">
                  {previewPic ? (
                    <img src={previewPic} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-black shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-black text-white font-bold text-2xl flex items-center justify-center border-2 border-gray-300 shadow-md">
                      {(name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">Click image to upload new avatar</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-black outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title / Designation</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-black outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-black outline-none transition" 
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-black text-white font-bold text-xs py-2.5 rounded-xl hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
