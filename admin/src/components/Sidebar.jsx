import React from 'react'
import { NavLink } from 'react-router-dom'
import {assets} from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
          <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/add'>
              <img className='w-5 h-5' src={assets.add_icon} alt="" />
              <p className='md:block text-gray-800'>Add Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/list'>
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='md:block'>List Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/order'>
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='md:block'>Order Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/chat'>
              <div className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.522 1.522 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <p className='md:block'>Chats</p>
          </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
