import React, { useState } from 'react';
import Title from './Title';

const BrandPrintKit = () => {
  const [downloading, setDownloading] = useState(null);

  // Helper to trigger high-resolution PNG download via offscreen Canvas
  const downloadAsPng = async (svgUrl, fileName, targetWidth = 2000) => {
    try {
      setDownloading(fileName);
      const response = await fetch(svgUrl);
      const svgText = await response.text();
      
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);
      
      const image = new Image();
      image.onload = () => {
        const aspectRatio = image.height / image.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);
        
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const context = canvas.getContext('2d');
        // Transparent / crisp background rendering
        context.clearRect(0, 0, targetWidth, targetHeight);
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${fileName}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(blobURL);
          setDownloading(null);
        }, 'image/png');
      };
      image.src = blobURL;
    } catch (err) {
      console.error('PNG download error:', err);
      // Fallback: direct SVG download
      window.open(svgUrl, '_blank');
      setDownloading(null);
    }
  };

  const assetsList = [
    {
      id: 'brand-logo',
      title: 'Official Primary Brand Logo',
      description: 'The definitive horizontal vector lockup. Ideal for website banners, invoice headers, letterheads, and horizontal packaging sleeves.',
      fileUrl: '/kaviro-logo.svg',
      fileName: 'kaviro-brand-logo',
      previewBg: 'bg-zinc-900',
      badge: 'Main Brand Identity',
      recommendedUse: 'Shop signage, banner, horizontal packaging tape'
    },
    {
      id: 'sticker-badge',
      title: 'Circular Product Sticker & Packaging Seal',
      description: 'Precision round emblem featuring circular curved typography "★ KAVIRO • SMART GADGETS ★ AUTHENTIC EDC GEAR". Perfect for round stickers, packet seals, and box labels.',
      fileUrl: '/kaviro-sticker-badge.svg',
      fileName: 'kaviro-packaging-sticker-seal',
      previewBg: 'bg-zinc-950',
      badge: '300 DPI Print Sticker',
      recommendedUse: 'Round 2"/3" stickers, box seal, unboxing packet seal'
    },
    {
      id: 'box-label',
      title: 'Product Box Packaging & QC Label',
      description: 'Rectangular packaging card with barcode, official serial, QC passed authenticity badge, and brand guarantee. Ready to stick on product carton boxes.',
      fileUrl: '/kaviro-box-label.svg',
      fileName: 'kaviro-box-packaging-label',
      previewBg: 'bg-zinc-950',
      badge: 'Box Packaging Tag',
      recommendedUse: 'Delivery parcel label, product box reverse, warranty tag'
    }
  ];

  return (
    <div id="kaviro-brand-print-kit" className="my-16 sm:my-24 pt-12 border-t border-zinc-200">
      <div className="text-center pb-8 sm:pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🖨️ High-Resolution Print Assets</span>
        </div>
        <Title text1={'BRAND LOGO &'} text2={'PACKAGING KIT'} />
        <p className="w-full max-w-2xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed px-4">
          প্রোডাক্টের প্যাকেট, বক্স এবং স্টিকারে প্রিন্ট করার জন্য আসল হাই-রেজোলিউশন ভেক্টর (SVG) এবং ৩০০০ পিক্সেল ক্রিস্টাল ক্লিয়ার (PNG) অ্যাসেট। কোনো ব্লার বা কোয়ালিটি নষ্ট ছাড়াই যেকোনো প্রিন্টিং প্রেসে সরাসরি ব্যবহার করা যাবে।
        </p>
      </div>

      {/* Grid of Printable Assets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {assetsList.map((item) => (
          <div 
            key={item.id}
            className="flex flex-col bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300"
          >
            {/* Visual Preview Window */}
            <div className={`h-56 sm:h-64 ${item.previewBg} p-6 flex items-center justify-center relative group overflow-hidden`}>
              <img 
                src={item.fileUrl} 
                alt={item.title} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 select-none"
              />
              <span className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {item.badge}
              </span>
            </div>

            {/* Information & Action Content */}
            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-zinc-900 leading-snug mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                  {item.description}
                </p>
                <div className="inline-block bg-zinc-50 border border-zinc-200/80 rounded-xl px-2.5 py-1 text-[11px] text-zinc-600 font-medium">
                  <strong>ব্যবহার:</strong> {item.recommendedUse}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row gap-2">
                {/* SVG Vector Download */}
                <a
                  href={item.fileUrl}
                  download={`${item.fileName}.svg`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-xs active:scale-95 text-center"
                  title="Download Vector SVG (Infinite 300+ DPI scaling for printing press)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Vector SVG</span>
                </a>

                {/* High Res PNG Download */}
                <button
                  type="button"
                  onClick={() => downloadAsPng(item.fileUrl, item.fileName, 2400)}
                  disabled={downloading === item.fileName}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-xs active:scale-95 text-center cursor-pointer disabled:opacity-50"
                  title="Generate & Download 2400px High-Res Transparent PNG"
                >
                  {downloading === item.fileName ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                      </svg>
                      <span>HD PNG (2400px)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Color & Print Specs Guide */}
      <div className="mt-8 p-6 bg-zinc-50 border border-zinc-200/80 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Official Brand Color Palette (প্রিন্টিং কালার কোড)</h4>
          <p className="text-xs text-zinc-500 mt-0.5">প্রিন্টিং প্রেসে বা স্টিকার তৈরির সময় এই হেক্স কালারগুলো হুবহু ব্যবহার করতে পারবেন:</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff7828] border border-black/10"></span>
            <span className="font-bold">#FF7828 (Kaviro Orange)</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0c0d12] border border-black/10"></span>
            <span className="font-bold">#0C0D12 (Obsidian Tech)</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono shadow-2xs">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffb74d] border border-black/10"></span>
            <span className="font-bold">#FFB74D (Radiant Gold)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPrintKit;
