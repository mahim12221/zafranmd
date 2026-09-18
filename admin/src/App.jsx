import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Chat from './pages/Chat';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { resolveBackendUrl } from './utils/backendUrl';

export const backendUrl = resolveBackendUrl();
export const currency = '৳';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') ? localStorage.getItem('adminToken') : ''); 
  useEffect(()=>{
    localStorage.setItem('adminToken', token)
  }, [token])

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer/>
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <NavBar token={token} setToken={setToken} />
          <hr />
          <div className="flex w-full min-w-0">
            <Sidebar />
            <div className="flex-1 min-w-0 mx-2 sm:mx-4 md:mx-8 my-4 md:my-8 text-gray-700 text-base overflow-x-hidden">
              <Routes>
                <Route path="/add" element={<Add token={token}/>} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/order" element={<Orders token={token} />} />
                <Route path="/chat" element={<Chat token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
