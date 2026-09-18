import React from 'react'
import { NavLink } from 'react-router-dom'
import {assets} from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-14 sm:w-16 md:w-[18%] min-h-screen border-r-2 shrink-0'>
      <div className='flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6 px-1 sm:px-2 md:pl-[20%] md:pr-0 text-[14px] sm:text-[15px]'>
          <NavLink className='flex items-center justify-center md:justify-start gap-3 border border-gray-300 border-r-0 p-2 sm:px-3 sm:py-2 rounded-l' to='/add' title="Add Items">
              <img className='w-5 h-5 shrink-0' src={assets.add_icon} alt="" />
              <p className='hidden md:block text-gray-800 truncate'>Add Items</p>
          </NavLink>
          <NavLink className='flex items-center justify-center md:justify-start gap-3 border border-gray-300 border-r-0 p-2 sm:px-3 sm:py-2 rounded-l' to='/list' title="List Items">
              <img className='w-5 h-5 shrink-0' src={assets.order_icon} alt="" />
              <p className='hidden md:block truncate'>List Items</p>
          </NavLink>
          <NavLink className='flex items-center justify-center md:justify-start gap-3 border border-gray-300 border-r-0 p-2 sm:px-3 sm:py-2 rounded-l' to='/order' title="Order Items">
              <img className='w-5 h-5 shrink-0' src={assets.order_icon} alt="" />
              <p className='hidden md:block truncate'>Order Items</p>
          </NavLink>
          <NavLink className='flex items-center justify-center md:justify-start gap-3 border border-gray-300 border-r-0 p-2 sm:px-3 sm:py-2 rounded-l' to='/chat' title="Chats">
              <div className="w-5 h-5 shrink-0 flex items-center justify-center border border-gray-400 rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.522 1.522 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <p className='hidden md:block truncate'>Chats</p>
          </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
