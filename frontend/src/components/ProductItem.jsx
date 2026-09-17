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
    <Link className='text-gray-700 cursor-pointer group' to={id ? `/product/${id}` : '#'}>
      <div className='overflow-hidden relative bg-gray-100 rounded'>
        <img className={`group-hover:scale-110 transition ease-in-out w-full h-48 sm:h-56 object-cover ${outOfStock ? 'opacity-60 grayscale-[30%]' : ''}`} src={productImage} alt={name || "Product"} />
        
        {outOfStock ? (
          <div className='absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center'>
            <span className='bg-red-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-md tracking-wider'>
              Out of Stock
            </span>
          </div>
        ) : (
          hasDiscount && (
            <div className='absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm'>
              -{discountVal}%
            </div>
          )
        )}
      </div>
      <p className='pt-3 pb-1 text-sm font-medium text-gray-800 truncate'>{name || "No Name"}</p>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-bold text-black'>{currency}{price}</p>
          {hasDiscount && (
            <p className='text-xs text-gray-400 line-through'>{currency}{originalPrice}</p>
          )}
        </div>
        {Number(salesCount) > 0 && (
          <span className='text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200'>
            🔥 {salesCount} sold
          </span>
        )}
      </div>
    </Link>
  );
};

export default ProductItem;
