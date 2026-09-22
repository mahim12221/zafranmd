import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import CategoryNavMenu from './CategoryNavMenu';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const location = useLocation();
    const { setShowSearch, getCartCount, navigate, token, setToken, clearCart, userData, categories } = useContext(ShopContext);

    const logout = () => {
      setShowProfileMenu(false);
      navigate('/login');
      localStorage.removeItem('token');
      setToken('');
      if (clearCart) clearCart();
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
      const handleOutsideClick = (e) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
          setShowProfileMenu(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleProfileButtonClick = () => {
      if (!token) {
        navigate('/login');
      } else {
        setShowProfileMenu(prev => !prev);
      }
    };

  return (
    <>
      <div className="flex items-center justify-between py-5 font-medium">
      {/* Logo */}
      <Link to='/' className="flex items-center">
        <img 
          id="keriyo-main-header-logo" 
          src={assets.logo} 
          className="w-36 sm:w-44 h-auto object-contain hover:opacity-90 transition select-none" 
          alt="Keriyo Gadgets & Gear" 
        />
      </Link>

      {/* Navigation Links */}
      <ul className="hidden sm:flex items-center gap-7 text-xs md:text-sm font-semibold tracking-wider text-zinc-600">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `transition-colors duration-200 py-1 hover:text-black ${isActive ? 'text-black font-extrabold border-b-2 border-orange-500' : ''}`
            }
          >
            HOME
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/collection" 
            className={({ isActive }) => 
              `transition-colors duration-200 py-1 hover:text-black ${isActive ? 'text-black font-extrabold border-b-2 border-orange-500' : ''}`
            }
          >
            COLLECTION
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              `transition-colors duration-200 py-1 hover:text-black ${isActive ? 'text-black font-extrabold border-b-2 border-orange-500' : ''}`
            }
          >
            ABOUT
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => 
              `transition-colors duration-200 py-1 hover:text-black ${isActive ? 'text-black font-extrabold border-b-2 border-orange-500' : ''}`
            }
          >
            CONTACT
          </NavLink>
        </li>
      </ul>

      {/* Profile and Cart */}
      <div className="flex items-center gap-4 sm:gap-6">
        <img 
          onClick={() => {
            setShowSearch(true);
            if (!location.pathname.includes('collection')) {
              navigate('/collection');
            }
          }} 
          src={assets.search_icon} 
          className="w-5 cursor-pointer hover:opacity-75 transition" 
          alt="Search" 
        />

        <div className="relative" ref={profileMenuRef}>
          <button 
            type="button"
            onClick={handleProfileButtonClick} 
            className="flex items-center justify-center cursor-pointer focus:outline-none"
            title={token ? (userData?.name || "My Account") : "Login / Register"}
          >
            {token && userData?.profilePic ? (
              <img 
                className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-xs hover:ring-2 hover:ring-black/10 transition" 
                src={userData.profilePic} 
                alt={userData.name || "Profile"} 
              />
            ) : (
              <img 
                className="w-5 cursor-pointer hover:opacity-75 transition" 
                src={assets.profile_icon} 
                alt="Profile" 
              />
            )}
          </button>

          {token && showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden animate-scaleIn origin-top-right">
              {userData && (
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
                  <p className="text-xs font-bold text-gray-900 truncate">{userData.name || 'My Account'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{userData.email}</p>
                </div>
              )}
              <div className="py-1">
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  My Profile
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/orders'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Orders
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition border-t border-gray-100 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative transition-transform duration-200 active:scale-90 hover:scale-105">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px] font-bold shadow-xs transition-transform duration-300">
            {getCartCount()}
          </p>
        </Link>
        <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden transition-transform duration-200 active:scale-90 hover:opacity-80' alt="" />
      </div>
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div onClick={() => setVisible(false)} className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer">
            <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
              <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="Back" />
              <span>Back</span>
            </div>
            <span className="text-gray-400 text-lg font-bold">✕</span>
          </div>

          <div className="flex flex-col py-4 px-2 text-sm font-bold tracking-wider text-zinc-700">
            <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 px-4 rounded-xl transition ${isActive ? 'bg-zinc-950 text-white' : 'hover:bg-gray-100'}`} to="/">HOME</NavLink>
            <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 px-4 rounded-xl transition ${isActive ? 'bg-zinc-950 text-white' : 'hover:bg-gray-100'}`} to="/collection">COLLECTION</NavLink>
            <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 px-4 rounded-xl transition ${isActive ? 'bg-zinc-950 text-white' : 'hover:bg-gray-100'}`} to="/about">ABOUT</NavLink>
            <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 px-4 rounded-xl transition ${isActive ? 'bg-zinc-950 text-white' : 'hover:bg-gray-100'}`} to="/contact">CONTACT</NavLink>
          </div>

          {categories && categories.length > 0 && (
            <div className="px-3 pt-3 border-t border-gray-100 mt-2 overflow-y-auto">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Categories</p>
              <div className="flex flex-col gap-1">
                {categories.filter(c => !c.parentId || c.level === 1).map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setVisible(false);
                      navigate(`/collection?category=${encodeURIComponent(cat.name)}`);
                    }}
                    className="text-left py-2 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <span className="text-gray-400">›</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <CategoryNavMenu />
    </>
  );
};

export default NavBar;
