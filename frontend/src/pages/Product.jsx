import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [size, setSize] = useState('Standard');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fetchProductData = () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setActiveImageIndex(0);
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor('');
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const productImages = productData
    ? (Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images 
        : (Array.isArray(productData.image) && productData.image.length > 0 
            ? productData.image 
            : [productData.images || productData.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"]))
    : [];

  const currentImage = productImages[activeImageIndex] || productImages[0] || '';

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isLightboxOpen) return;
    if (e.key === 'Escape') {
      setIsLightboxOpen(false);
    } else if (e.key === 'ArrowRight') {
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
    } else if (e.key === 'ArrowLeft') {
      setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  }, [isLightboxOpen, productImages.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post((backendUrl || '') + '/api/product/review', {
        productId: productData._id,
        rating,
        comment
      });
      if (response.data.success) {
        toast.success("Review added!");
        setProductData(response.data.product);
        setComment('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to add review");
    }
  };

  const handleAddToCart = () => {
    if (!productData) return;
    addToCart(productData._id, size || 'Standard', selectedColor);
  };

  const handleOrderNow = async () => {
    if (!productData) return;
    await addToCart(productData._id, size || 'Standard', selectedColor);
    navigate('/place-order');
  };

  return productData ? (
    <div className="border-t pt-8 transition-opacity ease-in duration-300 opacity-100 pb-16">
      {/* Product Top Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
        {/* Left Section: Image Gallery with Lightbox trigger */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {productImages.length > 1 && (
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto sm:w-24 gap-3.5 shrink-0 py-1 sm:py-0">
              {productImages.map((imgUrl, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === index
                      ? 'border-black ring-2 ring-black/10 shadow-sm'
                      : 'border-gray-200/80 hover:border-gray-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${productData.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {activeImageIndex === index && (
                    <div className="absolute inset-0 bg-black/5" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Main Large Display Image */}
          <div className="relative flex-1 bg-gray-50/60 rounded-3xl border border-gray-200/80 p-3 sm:p-5 flex items-center justify-center overflow-hidden group">
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full h-[360px] sm:h-[480px] flex items-center justify-center cursor-zoom-in"
              title="Click to view full screen"
            >
              <img
                src={currentImage}
                className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
                alt={productData.name}
              />
              {/* Zoom overlay badge */}
              <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md group-hover:bg-black transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Click to Expand</span>
              </div>
            </div>

            {/* If discount exists, badge */}
            {productData.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
                {productData.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Product Details */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                {productData.category} / {productData.subCategory}
              </span>
              {productData.bestseller && (
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md">
                  ★ Bestseller
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
              {productData.name}
            </h1>

            {/* Reviews & Sales metric */}
            <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-500">
              <div className="flex items-center text-amber-500">
                {'★'.repeat(5)}
              </div>
              <span className="font-semibold text-gray-700">
                {productData.reviews?.length || 0} reviews
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">
                In Stock & Ready to Ship
              </span>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-200 flex items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {currency}{productData.price}
            </span>
            {productData.discount > 0 && (
              <span className="text-lg text-gray-400 line-through font-medium">
                {currency}{Math.round(productData.price / (1 - productData.discount / 100))}
              </span>
            )}
          </div>

          {/* Color Selector (If product has colors) */}
          {productData.colors && productData.colors.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Select Color: <span className="text-black font-extrabold">{selectedColor || 'None selected'}</span>
                </label>
                <span className="text-[11px] text-gray-500">
                  {productData.colors.length} {productData.colors.length === 1 ? 'color available' : 'colors available'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {productData.colors.map((colorName, idx) => {
                  const isSelected = selectedColor === colorName;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm ring-2 ring-black/10 scale-102'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {productData.description}
            </p>
          </div>

          {/* Actions: Direct Order Now + Add to Cart */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Order Now (Direct Checkout) */}
              <button
                type="button"
                onClick={handleOrderNow}
                className="flex-1 bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition active:scale-98 shadow-md cursor-pointer flex items-center justify-center gap-2 group"
                title="Instant Checkout - Go directly to address & payment"
              >
                <svg className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>ORDER NOW (সরাসরি অর্ডার)</span>
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                title="Add to your cart and continue shopping"
              >
                <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>ADD TO CART</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-500 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start">
              <span>⚡</span>
              <span><strong>Order Now</strong>-এ ক্লিক করলে সরাসরি ডেলিভারি ও পেমেন্ট পেজে নিয়ে যাবে।</span>
            </p>
          </div>

          {/* Guarantee Badges */}
          <div className="border-t border-gray-200 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold">✓</span>
              <span>100% Genuine Product</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold">⚡</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold">↺</span>
              <span>7 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div 
            className="flex items-center justify-between text-white max-w-6xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-sm sm:text-base text-white/90 truncate max-w-[250px] sm:max-w-md">
                {productData.name}
              </h3>
              <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                {activeImageIndex + 1} / {productImages.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition cursor-pointer flex items-center justify-center"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Lightbox Center: Image with Prev/Next buttons */}
          <div 
            className="relative flex-1 flex items-center justify-center my-4 max-w-5xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {productImages.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)}
                className="absolute left-2 sm:left-4 z-10 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition backdrop-blur-sm cursor-pointer shadow-lg"
                title="Previous Photo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <img
              src={currentImage}
              alt={productData.name}
              className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200"
            />

            {productImages.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev + 1) % productImages.length)}
                className="absolute right-2 sm:right-4 z-10 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition backdrop-blur-sm cursor-pointer shadow-lg"
                title="Next Photo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails */}
          {productImages.length > 1 && (
            <div 
              className="flex items-center justify-center gap-2 overflow-x-auto max-w-xl mx-auto w-full py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {productImages.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description and Reviews Tabs */}
      <div className="mt-16">
        <div className="flex border-b border-gray-200 gap-2">
          <button className="border-b-2 border-black font-bold text-sm text-gray-900 pb-3 px-4">
            Product Description
          </button>
          <button className="font-semibold text-sm text-gray-500 pb-3 px-4 hover:text-black">
            Reviews ({productData.reviews?.length || 0})
          </button>
        </div>

        <div className="py-6 text-sm text-gray-600 leading-relaxed">
          <p>{productData.description}</p>
        </div>

        {/* Customer Reviews List */}
        <div className="mt-4 pt-6 border-t border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-900">Customer Feedback</h3>
          {productData.reviews && productData.reviews.length > 0 ? (
            <div className="space-y-4">
              {productData.reviews.map((rev, index) => (
                <div key={index} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-200/80">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-gray-900 text-xs">{rev.userName || 'Verified Buyer'}</span>
                    <span className="text-amber-500 text-xs font-medium">{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No customer reviews yet. Be the first to review this product!</p>
          )}

          {/* Add Review Form */}
          <form onSubmit={submitReview} className="mt-8 bg-gray-50/60 p-6 rounded-3xl border border-gray-200/80 space-y-4 max-w-xl">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900">Write an Exclusive Review</h4>
            <div className="flex gap-3 items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Rating:</span>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))} 
                className="rounded-xl border border-gray-200 px-3 py-1.5 bg-white text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:border-black"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full rounded-2xl border border-gray-200 bg-white p-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition" 
              rows="3" 
              placeholder="Share your authentic feedback regarding product quality, speed, or packaging..."
            />
            <button 
              type="submit" 
              className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition active:scale-98 cursor-pointer shadow-xs"
            >
              Publish Review
            </button>
          </form>
        </div>
      </div>

      {/* Related Products Section */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );
};

export default Product;
