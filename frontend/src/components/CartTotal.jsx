import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ deliveryFee }) => {
    const {currency, delivery_fee: contextDeliveryFee, getCartAmount} = useContext(ShopContext);
    const activeDeliveryFee = deliveryFee !== undefined ? deliveryFee : contextDeliveryFee;

  return (
    <div className='w-full'>
        <div className='text-2xl'>
            <Title text1={'CART'} text2={'TOTALS'}/>
        </div>
        <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {getCartAmount()}.00</p>
            </div>
            <hr />
            <div className='flex justify-between items-center'>
                <p>Shipping Fee</p>
                <p className="font-medium text-gray-900">{currency} {activeDeliveryFee}</p>
            </div>
            <hr />
            <div className='flex justify-between font-bold text-gray-900 text-base'>
                <p>Total</p>
                <p>{currency} {getCartAmount() === 0 ? 0 : getCartAmount() + activeDeliveryFee}</p>
            </div>
        </div>
    </div>
  )
}

export default CartTotal
