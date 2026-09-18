import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="mt-20 pt-16 pb-8 border-t border-zinc-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-12">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <Link to="/" className="inline-block">
            <img src={assets.logo} className="w-36 object-contain" alt="Kaviro" />
          </Link>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">
            Kaviro is a modern tech, gadget and lifestyle brand founded by <strong>Mahim Afridi</strong>. We curate innovative smart devices, fidget toys, EDC tools, and premium everyday gear.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.facebook.com/mahim.afridi.136555"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-950 hover:text-white flex items-center justify-center text-xs font-bold transition duration-200"
              title="Facebook"
            >
              f
            </a>
            <a
              href="https://wa.me/8801742111888"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-xs font-bold transition duration-200"
              title="WhatsApp"
            >
              wa
            </a>
            <a
              href="https://github.com/mahim12221/zafranmd.git"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-950 hover:text-white flex items-center justify-center text-xs font-bold transition duration-200"
              title="GitHub"
            >
              gh
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">EXPLORE</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-600">
            <li><Link to="/" className="hover:text-black transition">Home</Link></li>
            <li><Link to="/collection" className="hover:text-black transition">All Collections</Link></li>
            <li><Link to="/about" className="hover:text-black transition">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-black transition">Contact &amp; Concierge</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-black transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">CUSTOMER CARE</h4>
          <div className="space-y-2 text-xs sm:text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900">Founder: Mahim Afridi</p>
            <p>
              Direct Hotline:{' '}
              <a href="tel:01880172859" className="font-bold text-zinc-900 hover:underline">01880172859</a> /{' '}
              <a href="tel:01742111888" className="font-bold text-zinc-900 hover:underline">01742111888</a>
            </p>
            <p>
              Email:{' '}
              <a href="mailto:contact@kaviro.com" className="hover:underline text-zinc-900">contact@kaviro.com</a>
            </p>
            <p className="text-xs text-zinc-400">Dhaka, Bangladesh • Fast Delivery Across All 64 Districts</p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <p>© 2026 KAVIRO. All rights reserved. Created &amp; Operated by Mahim Afridi.</p>
        <p className="flex items-center gap-2 font-medium text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>Authentic Fashion Quality</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
