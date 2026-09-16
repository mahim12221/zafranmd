import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    if (location.pathname.includes('collection') && showSearch) {
      setVisible(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      setVisible(false);
    }
  }, [location, showSearch]);

  const handleClose = () => {
    setShowSearch(false);
    setSearch('');
  };

  return showSearch && visible ? (
    <div className="border-t border-b bg-gray-50 text-center py-4 px-4 transition-all">
      <div className="inline-flex items-center justify-center border border-gray-300 bg-white px-5 py-2.5 mx-3 rounded-full w-3/4 sm:w-1/2 shadow-sm focus-within:border-black transition">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
          type="text"
          placeholder="Search gadgets, audio, watches, accessories..."
        />
        {search ? (
          <button 
            type="button" 
            onClick={() => setSearch('')} 
            className="text-xs text-gray-400 hover:text-black mr-2 font-bold"
          >
            ✕
          </button>
        ) : null}
        <img className="w-4 opacity-70" src={assets.search_icon} alt="Search" />
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition align-middle ml-2"
        title="Close Search"
      >
        <img
          className="w-3.5 cursor-pointer"
          src={assets.cross_icon}
          alt="Close"
        />
      </button>
    </div>
  ) : null;
};

export default SearchBar;
