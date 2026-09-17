import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Collection from './pages/Collection'; 
import AdminPortal from './pages/AdminPortal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import ScrollToTop from './components/ScrollToTop';
import ChatWidget from './components/ChatWidget';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-900/5 antialiased font-sans">
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] min-h-screen flex flex-col justify-between">
      <div>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} />
        <NavBar />
        <SearchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default App;
