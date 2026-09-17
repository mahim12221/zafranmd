import React from 'react'
import Title from '../components/Title';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-12 mb-28 items-center'>
        <img className='w-full md:max-w-[480px] rounded-lg shadow-sm' src={assets.contact_img} alt="Zafran Contact" />
        <div className='flex flex-col justify-center items-start gap-5 max-w-lg'>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              Direct Contact
            </span>
            <h3 className='font-semibold text-2xl text-gray-900 mt-1'>Zafran Headquarters</h3>
          </div>

          <div className='text-sm text-gray-600 space-y-1.5'>
            <p><strong>Founder &amp; CEO:</strong> Mahim Afridi</p>
            <p><strong>Head Office:</strong> Dhaka, Bangladesh</p>
            <p>
              <strong>Direct Phone:</strong>{' '}
              <a href="tel:01880172859" className="text-black hover:underline font-medium">01880172859</a> /{' '}
              <a href="tel:01742111888" className="text-black hover:underline font-medium">01742111888</a>
            </p>
            <p>
              <strong>Official Email:</strong>{' '}
              <a href="mailto:contact@zafran.com" className="text-black hover:underline">contact@zafran.com</a>
            </p>
            <p>
              <strong>Personal Support:</strong>{' '}
              <a href="mailto:mahim.afridi@zafran.com" className="text-black hover:underline">mahim.afridi@zafran.com</a>
            </p>
          </div>

          <div className="pt-2">
            <p className='font-semibold text-base text-gray-900 mb-2'>Connect with Mahim Afridi</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://www.facebook.com/mahim.afridi.136555"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 text-xs font-semibold rounded hover:opacity-90 transition"
              >
                Facebook Profile
              </a>
              <a
                href="https://github.com/mahim12221/zafranmd.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-xs font-semibold rounded hover:bg-black transition"
              >
                GitHub Repository
              </a>
              <a
                href="https://wa.me/8801880172859"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 text-xs font-semibold rounded hover:opacity-90 transition"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 w-full">
            <p className='font-semibold text-sm text-gray-900'>Customer Care Hours</p>
            <p className='text-xs text-gray-500 mt-0.5'>Saturday – Thursday: 9:00 AM – 10:00 PM (GMT+6)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact;
