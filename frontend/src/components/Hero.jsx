import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white shadow-xl my-3 sm:my-5 border border-zinc-800/80">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="flex flex-col sm:flex-row items-center justify-between sm:h-[290px] md:h-[320px] lg:h-[350px]">
        {/* Left Content Area */}
        <div className="w-full sm:w-1/2 p-6 sm:p-7 md:p-8 lg:px-10 lg:py-6 z-10 flex flex-col justify-center items-start h-full">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 backdrop-blur-md mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              KAVIRO • GADGETS &amp; EDC GEAR
            </span>
          </div>

          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white mb-2.5">
            Next-Gen Tech. <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Everyday Innovations.
            </span>
          </h1>

          <p className="text-zinc-400 text-xs md:text-sm max-w-md mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
            Curated smart gadgets, premium EDC fidget toys, wireless audio, desk gears, and high-performance everyday essentials.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/collection"
              className="group inline-flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-orange-500 hover:text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/25 active:scale-95 text-center cursor-pointer"
            >
              <span>EXPLORE GADGETS</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5} 
                stroke="currentColor" 
                className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2.5 rounded-full border border-zinc-700/80 hover:border-zinc-500 transition text-center"
            >
              Our Story
            </Link>
          </div>

          {/* Highlights Row */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-4 text-zinc-400 text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-orange-400 font-bold">✓</span>
              <span>100% Genuine Tech &amp; EDC</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-400 font-bold">✓</span>
              <span>Fast All-BD Dispatch</span>
            </div>
          </div>
        </div>

        {/* Right Image Showcase */}
        <div className="w-full sm:w-1/2 relative h-48 sm:h-full flex items-center justify-center overflow-hidden">
          <img
            className="w-full h-full object-cover object-center sm:object-right opacity-90 hover:scale-105 transition-transform duration-700"
            src={assets.hero_img}
            alt="Kaviro Gadgets & Tech Collection"
          />
          {/* Subtle gradient overlay to blend smoothly */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>

          {/* Floating collection label */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
              ⚡
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold text-zinc-400">Featured Drop</p>
              <p className="text-[11px] sm:text-xs font-bold text-white">Smart EDC &amp; Toys</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;