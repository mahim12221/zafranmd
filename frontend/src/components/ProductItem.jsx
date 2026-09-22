import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, discount, outOfStock, salesCount }) => {
  const { currency } = useContext(ShopContext); 

  // Ensure `image` is an array and has at least one element
  const productImage = Array.isArray(image) && image.length > 0 ? image[0] : (typeof image === 'string' ? image : "placeholder.jpg");
  
  const discountVal = Number(discount) || 0;
  const hasDiscount = discountVal > 0 && discountVal < 100;
  const originalPrice = hasDiscount ? Math.round(price / (1 - discountVal / 100)) : price;

  return (
    <Link 
      className="group flex flex-col cursor-pointer select-none w-full text-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1" 
      to={id ? `/product/${id}` : '#'}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
    >
      {/* Product Image Frame - Clean Aspect Square with Full Uncropped Image */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-2xs group-hover:shadow-lg group-hover:border-zinc-300 transition-all duration-500 ease-out w-full aspect-square flex items-center justify-center p-2 sm:p-3"
      >
        <img 
          className={`w-full h-full object-contain group-hover:scale-106 transition-transform duration-500 ease-out ${outOfStock ? 'opacity-50 grayscale' : ''}`} 
          src={productImage} 
          alt={name || "Keriyo Product"} 
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {hasDiscount && !outOfStock ? (
            <span className="bg-zinc-950/90 backdrop-blur-xs text-orange-400 border border-orange-500/30 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs tracking-wider">
              {discountVal}% OFF
            </span>
          ) : <span></span>}

          {Number(salesCount) > 0 && !outOfStock && (
            <span className="bg-white/90 backdrop-blur-xs text-zinc-900 border border-zinc-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
              🔥 {salesCount} sold
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center p-2">
            <span className="bg-zinc-900 text-white text-[10px] sm:text-[11px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg border border-zinc-700 tracking-wider text-center">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Hover Bar */}
        {!outOfStock && (
          <div className="absolute bottom-2.5 inset-x-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md text-zinc-900 text-center py-2 rounded-xl text-[11px] font-bold shadow-lg border border-zinc-100 flex items-center justify-center gap-1.5">
              <span>View Details</span>
              <span>→</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="pt-2.5 px-0.5 flex flex-col">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 group-hover:text-black line-clamp-1 transition-colors">
          {name || "Untitled Item"}
        </h3>
        
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-sm sm:text-base font-extrabold text-zinc-950">
            {currency}{price}
          </p>
          {hasDiscount && (
            <p className="text-xs text-zinc-400 line-through font-normal">
              {currency}{originalPrice}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
