import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const isOrdering = redirectUrl.includes('place-order');

  const [currentState, setCurrentState] = useState(isOrdering ? 'Login' : 'Sign Up');
  const { token, setToken, navigate, backendUrl, getUserCart } = useContext(ShopContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(`${backendUrl || ''}/api/user/register`, { name, email, password });
        if (response.data.success) {
          const newToken = response.data.token;
          setToken(newToken);
          localStorage.setItem('token', newToken);
          if (getUserCart) getUserCart(newToken);
          toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
          navigate(redirectUrl, { replace: true });
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${backendUrl || ''}/api/user/login`, { email, password });
        if (response.data.success) {
          const newToken = response.data.token;
          setToken(newToken);
          localStorage.setItem('token', newToken);
          if (getUserCart) getUserCart(newToken);
          toast.success('লগইন সফল হয়েছে!');
          navigate(redirectUrl, { replace: true });
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate(redirectUrl, { replace: true });
    }
  }, [token, redirectUrl]);

  return (
    <div className='min-h-[70vh] flex items-center justify-center py-10'>
      <form 
        onSubmit={onSubmitHandler} 
        className='w-full max-w-md bg-white border border-gray-100 rounded-3xl p-7 sm:p-9 shadow-sm flex flex-col gap-4 text-gray-800'
      >
        {/* Banner if redirected from checkout */}
        {isOrdering && (
          <div className="bg-amber-50/90 border border-amber-200/90 text-amber-950 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-base">
              🛍️
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-900">অর্ডার সম্পন্ন করতে লগইন করুন</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                লগইন বা অ্যাকাউন্ট তৈরি করার সাথে সাথেই আপনাকে আগের অর্ডার পেজে নিয়ে যাওয়া হবে।
              </p>
            </div>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setCurrentState('Login')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer ${
              currentState === 'Login' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In (লগইন)
          </button>
          <button
            type="button"
            onClick={() => setCurrentState('Sign Up')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer ${
              currentState === 'Sign Up' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account (রেজিস্ট্রেশন)
          </button>
        </div>

        <div className='text-center mt-1 mb-1'>
          <p className='prata-regular text-2xl sm:text-3xl text-gray-900'>
            {currentState === 'Login' ? 'Welcome Back' : 'Join Zafran'}
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            {currentState === 'Login' ? 'Please enter your email and password' : 'Enter your details to create a free account'}
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

        <div className='w-full flex justify-between items-center text-xs text-gray-500 mt-0.5'>
          <p className='cursor-pointer hover:text-black transition'>Forgot password?</p>
          {currentState === 'Login' ? (
            <p onClick={()=> setCurrentState('Sign Up')} className='cursor-pointer font-semibold text-black hover:underline'>
              New here? Create account
            </p>
          ) : (
            <p onClick={()=> setCurrentState('Login')} className='cursor-pointer font-semibold text-black hover:underline'>
              Already registered? Sign In
            </p>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className='w-full bg-black text-white py-3.5 mt-2 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-neutral-800 transition shadow-sm active:scale-98 cursor-pointer disabled:opacity-50'
        >
          {loading ? 'Please wait...' : (currentState === 'Login' ? 'Sign In & Continue' : 'Create Account & Continue')}
        </button>
      </form>
    </div>
  );
};

export default Login;
