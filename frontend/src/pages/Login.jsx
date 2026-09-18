import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { googleSignIn } from '../utils/firebase.js';

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const isOrdering = redirectUrl.includes('place-order');

  const [currentState, setCurrentState] = useState(isOrdering ? 'Login' : 'Sign Up');
  const { token, setToken, navigate, backendUrl, getUserCart } = useContext(ShopContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await googleSignIn();
      if (result?.user) {
        const { email, displayName, photoURL, uid } = result.user;
        const response = await axios.post(`${backendUrl || ''}/api/user/google-login`, { 
          email, 
          name: displayName, 
          profilePic: photoURL,
          uid 
        });
        
        if (response.data.success) {
          const newToken = response.data.token;
          setToken(newToken);
          localStorage.setItem('token', newToken);
          if (getUserCart) getUserCart(newToken);
          toast.success('Successfully logged in with Google!');
          navigate(redirectUrl, { replace: true });
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Google Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (currentState === 'Forgot Password') {
        const response = await axios.post(`${backendUrl || ''}/api/user/reset-password`, { email, newPassword });
        if (response.data.success) {
          toast.success(response.data.message);
          setCurrentState('Login');
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === 'Sign Up') {
        const response = await axios.post(`${backendUrl || ''}/api/user/register`, { name, email, password });
        if (response.data.success) {
          const newToken = response.data.token;
          setToken(newToken);
          localStorage.setItem('token', newToken);
          if (getUserCart) getUserCart(newToken);
          toast.success('Account created successfully!');
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
          toast.success('Logged in successfully!');
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
              <p className="font-semibold text-xs text-gray-900">Sign in to complete order</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                You will be redirected back to checkout immediately after signing in.
              </p>
            </div>
          </div>
        )}

        {/* Tab switchers */}
        {currentState !== 'Forgot Password' && (
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
            Sign In
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
            Create Account
          </button>
        </div>
        )}

        <div className='text-center mt-1 mb-1'>
          <p className='prata-regular text-2xl sm:text-3xl text-gray-900'>
            {currentState === 'Login' ? 'Welcome Back' : currentState === 'Forgot Password' ? 'Reset Password' : 'Join Zafran'}
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            {currentState === 'Login' ? 'Please enter your email and password' : currentState === 'Forgot Password' ? 'Enter your email and a new password' : 'Enter your details to create a free account'}
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
        
        {currentState === 'Forgot Password' ? (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">New Password</label>
            <input 
              onChange={(e)=>setNewPassword(e.target.value)} 
              value={newPassword} 
              type="password" 
              className='w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 transition' 
              placeholder='••••••••' 
              required
            />
          </div>
        ) : (
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
        )}

        <div className='w-full flex justify-between items-center text-xs text-gray-500 mt-0.5'>
          {currentState === 'Forgot Password' ? (
             <p onClick={()=> setCurrentState('Login')} className='cursor-pointer hover:text-black transition'>Back to Login</p>
          ) : (
             <p onClick={()=> setCurrentState('Forgot Password')} className='cursor-pointer hover:text-black transition'>Forgot password?</p>
          )}
          
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
          {loading ? 'Please wait...' : (currentState === 'Login' ? 'Sign In & Continue' : currentState === 'Forgot Password' ? 'Reset Password' : 'Create Account & Continue')}
        </button>

        {currentState !== 'Forgot Password' && (
          <div className="mt-2 text-center">
            <div className="relative mb-4 mt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
