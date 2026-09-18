import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, token } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  useEffect(()=>{
    if(products.length > 0){
      const tempData = [];
    for(const items in cartItems){
      for(const item in cartItems[items]){
        if(cartItems[items][item] > 0){
          tempData.push({
            _id: items,
            size : item,
            quantity: cartItems[items][item]
          })
        }
      }
    }
    setCartData(tempData);
    }
    
  }, [cartItems, products])
  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2 = {'CART'}/>
      </div>
      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product)=> product._id === item._id);
          
          if (!productData) return null;

          return (
            <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
              <div className='flex items-start gap-6'>
                <img src={productData.images && productData.images.length > 0 ? productData.images[0] : assets.placeholder_image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60"} className='w-16 sm:w-20' alt="" />
                <div>
                  <p className='text-xs sm:text-lg font-medium text-gray-800'>{productData.name}</p>
                  <div className='flex items-center gap-3 sm:gap-5 mt-2 flex-wrap'>
                    <p className="text-gray-900 font-semibold">{currency}{productData.price}</p>
                    {item.size && item.size !== 'Standard' && (
                      <span className='px-2.5 py-0.5 border border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-700 rounded-lg'>
                        {item.size}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <input 
                onChange={(e)=> e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} 
                className='border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:border-black max-w-14 sm:max-w-20 px-2 py-1.5 text-center font-bold text-sm text-gray-900 focus:outline-none transition shadow-xs' 
                type="number" 
                min='1' 
                defaultValue={item.quantity} 
              />
              <button 
                onClick={()=> updateQuantity(item._id, item.size, 0)} 
                className='p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer'
                title="Remove Item"
              >
                <img src={assets.bin_icon} className='w-4 sm:w-5' alt="Delete" />
              </button>
            </div>
          )
        })}
      </div>
      <div className='flex justify-end my-16'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal/>
          <div className='w-full text-end'>
            <button 
              onClick={() => {
                if (cartData.length === 0) {
                  toast.error('Your cart is empty!');
                  return;
                }
                if (!token && !localStorage.getItem('token')) {
                  toast.info('Please log in or sign up to complete your order');
                  navigate('/login?redirect=/place-order');
                } else {
                  navigate('/place-order');
                }
              }} 
              className='w-full bg-black text-white text-xs sm:text-sm font-bold tracking-wider uppercase my-8 py-4 rounded-xl hover:bg-neutral-800 transition active:scale-98 shadow-sm cursor-pointer'
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart;
