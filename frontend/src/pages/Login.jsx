import React, { useState } from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState]= useState('Sign Up');
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try{
      if(currentState === 'Sign Up'){
        const response = await axios.post(`${backendUrl || ''}/api/user/register`, {name, email, password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        }
        else{
          toast.error(response.data.message)
        }
      }
      else{
        const response = await axios.post(`${backendUrl || ''}/api/user/login`, {email, password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        }
        else{
          toast.error(response.data.message)
        }
      }
    }
    catch (error){
      console.log(error);
      toast.error(error.response?.data?.message || error.message)
    }
  }
  useEffect(()=>{
    if(token){
      navigate('/')
    }
  })
  return (
    <div className='min-h-[70vh] flex items-center justify-center py-12'>
      <form 
        onSubmit={onSubmitHandler} 
        className='w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col gap-4 text-gray-800'
      >
        <div className='text-center mb-4'>
          <p className='prata-regular text-3xl text-gray-900'>{currentState}</p>
          <p className='text-xs text-gray-400 mt-2'>
            {currentState === 'Login' ? 'Welcome back! Please enter your details.' : 'Join Zafran for exclusive access and orders.'}
          </p>
        </div>

        {currentState === 'Sign Up' && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Full Name</label>
            <input 
              onChange={(e)=>setName(e.target.value)} 
              value={name} 
              type="text" 
              className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' 
              placeholder='Your Name' 
              required
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
          <input 
            onChange={(e)=>setEmail(e.target.value)} 
            value={email} 
            type="email" 
            className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' 
            placeholder='you@example.com' 
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Password</label>
          <input 
            onChange={(e)=>setPassword(e.target.value)} 
            value={password} 
            type="password" 
            className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' 
            placeholder='••••••••' 
            required
          />
        </div>

        <div className='w-full flex justify-between items-center text-xs text-gray-500 mt-1'>
          <p className='cursor-pointer hover:text-black transition'>Forgot password?</p>
          {currentState === 'Login' ? (
            <p onClick={()=> setCurrentState('Sign Up')} className='cursor-pointer font-semibold text-black hover:underline'>
              Create account
            </p>
          ) : (
            <p onClick={()=> setCurrentState('Login')} className='cursor-pointer font-semibold text-black hover:underline'>
              Already have an account? Sign In
            </p>
          )}
        </div>

        <button 
          type="submit"
          className='w-full bg-black text-white py-3.5 mt-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-neutral-800 transition shadow-sm active:scale-98'
        >
          {currentState === 'Login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export default Login;
