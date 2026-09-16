import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, discount }) => {
  const { currency } = useContext(ShopContext); 

  // Ensure `image` is an array and has at least one element
  const productImage = Array.isArray(image) && image.length > 0 ? image[0] : (typeof image === 'string' ? image : "placeholder.jpg");
  
  const discountVal = Number(discount) || 0;
  const hasDiscount = discountVal > 0 && discountVal < 100;
  const originalPrice = hasDiscount ? Math.round(price / (1 - discountVal / 100)) : price;

  return (
    <Link className='text-gray-700 cursor-pointer group' to={id ? `/product/${id}` : '#'}>
      <div className='overflow-hidden relative bg-gray-100 rounded'>
        <img className='group-hover:scale-110 transition ease-in-out w-full h-48 sm:h-56 object-cover' src={productImage} alt={name || "Product"} />
        {hasDiscount && (
          <div className='absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm'>
            -{discountVal}%
          </div>
        )}
      </div>
      <p className='pt-3 pb-1 text-sm font-medium text-gray-800 truncate'>{name || "No Name"}</p>
      <div className='flex items-center gap-2'>
        <p className='text-sm font-bold text-black'>{currency}{price}</p>
        {hasDiscount && (
          <p className='text-xs text-gray-400 line-through'>{currency}{originalPrice}</p>
        )}
      </div>
    </Link>
  );
};

export default ProductItem;
