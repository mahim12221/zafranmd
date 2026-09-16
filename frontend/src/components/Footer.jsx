import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-32 text-sm'>
        <div>
          <Link to='/'><img src={assets.logo} className='mb-4 w-36' alt="Zafran" /></Link>
          <p className='w-full md:w-4/5 text-gray-600 leading-relaxed'>
            Zafran is a premier modern electronics and gadget destination founded by <strong>Mahim Afridi</strong>. We curate high-end smart devices, accessories, and tech essentials with uncompromised quality.
          </p>
          <div className='mt-4 flex items-center gap-4 text-xs font-semibold text-gray-700'>
            <a
              href="https://www.facebook.com/mahim.afridi.136555"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black hover:underline"
            >
              Facebook Profile
            </a>
            <span>•</span>
            <a
              href="https://github.com/mahim12221/zafranmd.git"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black hover:underline"
            >
              GitHub Repo
            </a>
          </div>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-900'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><Link to="/" className="hover:text-black transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-black transition">About Us</Link></li>
            <li><Link to="/collection" className="hover:text-black transition">Collections</Link></li>
            <li><Link to="/contact" className="hover:text-black transition">Contact & Support</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-black transition">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-900'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='font-medium text-gray-800'>Founder: Mahim Afridi</li>
            <li>
              <a href="tel:01880172859" className="hover:text-black transition">01880172859</a> /{' '}
              <a href="tel:01742111888" className="hover:text-black transition">01742111888</a>
            </li>
            <li>
              <a href="mailto:contact@zafran.com" className="hover:text-black transition">contact@zafran.com</a>
            </li>
            <li className="text-xs text-gray-500">Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>

      <div>
        <hr className="border-gray-200" />
        <p className='py-5 text-xs text-center text-gray-500'>
          Copyright © 2025-2026 Zafran (zafran.com) — Founded & Operated by Mahim Afridi. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer;
