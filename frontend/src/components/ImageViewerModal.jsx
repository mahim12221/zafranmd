import React, { useState, useEffect, useRef } from 'react';

const ImageViewerModal = ({ src, alt = "Image preview", onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, rotation, position]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.3, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.3, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.2, 4));
    } else {
      setScale((prev) => Math.max(prev - 0.2, 0.5));
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `zafran-chat-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between select-none p-4 animate-fadeIn"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar Header */}
      <div 
        className="w-full flex items-center justify-between px-4 py-2 z-10 bg-black/40 rounded-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm font-bold tracking-wide">🖼️ Image Viewer</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1"
            title="Zoom In (+)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
            <span className="hidden sm:inline">Zoom In</span>
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1"
            title="Zoom Out (-)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
            </svg>
            <span className="hidden sm:inline">Zoom Out</span>
          </button>

          <button
            type="button"
            onClick={handleRotateLeft}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition cursor-pointer text-xs font-bold"
            title="Rotate Left (-90°)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleRotateRight}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition cursor-pointer text-xs font-bold"
            title="Rotate Right (+90°)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition cursor-pointer text-xs font-bold"
            title="Reset (0)"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-2 text-white bg-white/15 hover:bg-white/30 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1"
            title="Download Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white hover:bg-red-600 rounded-xl transition cursor-pointer text-sm font-bold ml-2"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-2"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            maxHeight: '85vh',
            maxWidth: '90vw'
          }}
          className="object-contain rounded-lg shadow-2xl select-none"
        />
      </div>

      {/* Footer hint */}
      <div 
        className="text-[11px] text-gray-400 bg-black/40 px-4 py-1.5 rounded-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        Scroll to Zoom • Drag to Pan • Double-click to Reset
      </div>
    </div>
  );
};

export default ImageViewerModal;
