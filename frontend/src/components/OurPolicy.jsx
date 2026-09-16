import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
        <div>
            <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="Exchange Policy" />
            <p className='font-semibold text-gray-900'>Easy Exchange Policy</p>
            <p className='text-gray-500'>Hassle-free size and product exchange</p>
        </div>
        <div>
            <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="7 Days Return" />
            <p className='font-semibold text-gray-900'>7 Days Return Guarantee</p>
            <p className='text-gray-500'>We provide 7 days complimentary returns</p>
        </div>
        <div>
            <img src={assets.support_img} className='w-12 m-auto mb-5' alt="Customer Support" />
            <p className='font-semibold text-gray-900'>Dedicated Customer Support</p>
            <p className='text-gray-500'>Direct phone &amp; WhatsApp assistance</p>
        </div>
    </div>
  )
}

export default OurPolicy

