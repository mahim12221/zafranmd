import React, { useState } from 'react'
import { toast } from 'react-toastify'

const NewsletterBox = () => {
    const [email, setEmail] = useState('')

    const onSubmitHandler = (event) => {
        event.preventDefault()
        if (email) {
            toast.success('Thank you for subscribing to Zafran VIP updates!')
            setEmail('')
        }
    }

  return (
    <div className='my-16 bg-neutral-50/70 border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xs'>
        <span className='text-[10px] font-bold tracking-widest uppercase bg-black text-white px-3 py-1 rounded-full'>
          Exclusive Newsletter
        </span>
        <p className='text-2xl sm:text-3xl font-bold text-gray-900 mt-4'>Subscribe &amp; Get Special Privileges</p>
        <p className='text-gray-500 mt-2 text-xs sm:text-sm max-w-md mx-auto'>
            Be the first to receive exclusive drops, seasonal sales, and member-only promotions directly to your inbox.
        </p>
        <form onSubmit={onSubmitHandler} className='w-full max-w-md flex items-center gap-2 mx-auto mt-6 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition'>
            <input
              className='w-full flex-1 outline-none text-xs sm:text-sm text-gray-800 px-4 py-2.5 bg-transparent placeholder:text-gray-400'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email address'
              required
            />
            <button className='bg-black text-white text-xs px-6 py-3 rounded-xl font-bold tracking-wider hover:bg-neutral-800 transition active:scale-98 cursor-pointer' type='submit'>
              JOIN
            </button>
        </form>
    </div>
  )
}

export default NewsletterBox;
