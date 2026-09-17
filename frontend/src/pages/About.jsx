import React from 'react'
import Title from '../components/Title';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16 items-center'>
        <img className='w-full md:max-w-[450px] rounded-lg shadow-sm' src={assets.about_img} alt="Zafran Fashion" />
        <div className='flex flex-col justify-center gap-5 md:w-2/4 text-gray-600 text-sm leading-relaxed'>
          <p>
            <strong>Zafran</strong> was established with a clear vision: to redefine contemporary tech lifestyle by harmonizing modern aesthetics, premium electronics, and accessible smart devices.
          </p>
          <p>
            Under the leadership of Founder &amp; CEO <strong>Mahim Afridi</strong>, Zafran has evolved into a dedicated tech brand focused on authenticity, unmatched device reliability, and exceptional customer delight across Bangladesh and worldwide.
          </p>
          <div className="p-4 bg-gray-50 border-l-4 border-black rounded">
            <p className="text-gray-900 font-medium italic">
              &ldquo;Our promise at Zafran is simple: uncompromised quality, effortless ordering, and next-gen essentials that empower your daily life.&rdquo;
            </p>
            <p className="text-xs text-gray-700 font-semibold mt-2">
              — Mahim Afridi, Founder &amp; CEO
            </p>
          </div>
          <b className='text-gray-900 text-base'>Our Mission &amp; Values</b>
          <p>
            We curate carefully inspected tech products, partner with ethical manufacturing hubs, and maintain an easy-to-use digital storefront ensuring every package delivered meets the highest benchmarks of quality.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs">
            <a
              href="https://www.facebook.com/mahim.afridi.136555"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded font-medium hover:bg-black hover:text-white transition"
            >
              Connect on Facebook
            </a>
            <a
              href="https://github.com/mahim12221/zafranmd.git"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded font-medium hover:bg-black hover:text-white transition"
            >
              GitHub Project
            </a>
          </div>
        </div>
      </div>

      <div className='text-xl py-6'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20 gap-4 md:gap-0'>
        <div className='border px-8 md:px-12 py-10 flex flex-col gap-3 flex-1'>
          <b className="text-gray-900">Curated Quality Assurance:</b>
          <p className='text-gray-600'>Every device undergoes rigorous quality inspections from internal testing to packaging before shipment.</p>
        </div>
        <div className='border px-8 md:px-12 py-10 flex flex-col gap-3 flex-1'>
          <b className="text-gray-900">Seamless Shopping:</b>
          <p className='text-gray-600'>Fast checkout, instant order tracking, and cash-on-delivery options designed for effortless ordering.</p>
        </div>
        <div className='border px-8 md:px-12 py-10 flex flex-col gap-3 flex-1'>
          <b className="text-gray-900">Dedicated Support:</b>
          <p className='text-gray-600'>Direct support via phone (01880172859 / 01742111888) and WhatsApp for all your inquiries.</p>
        </div>
      </div>
    </div>
  )
}

export default About;
