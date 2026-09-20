import React, { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ImageViewerModal from './ImageViewerModal';
import AiChatView from './AiChatView';

const ChatWidget = () => {
  const { token, backendUrl, userData } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation mode: 'closed' | 'menu' | 'support' | 'ai'
  const [viewMode, setViewMode] = useState('closed');

  // Customer support state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [effectiveUserId, setEffectiveUserId] = useState(null);
  const chatContainerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [lastUnreadMessage, setLastUnreadMessage] = useState(null);
  const touchTimerRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, msg: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, msg) => {
    if (msg.senderId !== effectiveUserId) return;
    e.preventDefault();
    setContextMenu({ 
      visible: true, 
      x: Math.min(e.clientX, window.innerWidth - 140), 
      y: Math.min(e.clientY, window.innerHeight - 100), 
      msg 
    });
  };

  const handleTouchStart = (e, msg) => {
    if (msg.senderId !== effectiveUserId) return;
    const touch = e.touches[0];
    const posX = touch.clientX;
    const posY = touch.clientY;
    
    touchTimerRef.current = setTimeout(() => {
      setContextMenu({
        visible: true,
        x: Math.min(posX, window.innerWidth - 140),
        y: Math.min(posY, window.innerHeight - 100),
        msg
      });
    }, 450);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Decode user ID from profile or use persistent guest ID
  useEffect(() => {
    if (userData && userData._id) {
      setEffectiveUserId(userData._id);
    } else if (token) {
      axios.get(`${backendUrl}/api/user/profile`, { headers: { token } })
        .then(res => {
          if (res.data?.success && res.data.user) {
            setEffectiveUserId(res.data.user._id);
          }
        }).catch(err => console.log(err));
    } else {
      let guestId = localStorage.getItem('keriyo_guest_uid') || localStorage.getItem('kaviro_guest_uid');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('keriyo_guest_uid', guestId);
      }
      setEffectiveUserId(guestId);
    }
  }, [userData, token, backendUrl]);

  // Socket connection for Human Support Chat
  useEffect(() => {
    if (token && effectiveUserId && typeof backendUrl === 'string') {
      const newSocket = io(backendUrl);
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('register', { userId: effectiveUserId, email: userData?.email });
      });

      newSocket.on('receiveMessage', (message) => {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        
        if (viewMode !== 'support') {
          setHasUnread(true);
          setLastUnreadMessage(message.text || '📷 Sent an attachment');
        } else {
          if (message.senderId === 'admin') {
            localStorage.setItem('lastSeenAdminMsgId', message._id);
          }
        }
      });
      
      newSocket.on('messageAction', (actionData) => {
        if (actionData.action === 'delete') {
          setMessages(prev => prev.filter(m => m._id !== actionData.payload.messageId));
        } else if (actionData.action === 'edit') {
          setMessages(prev => prev.map(m => m._id === actionData.payload.messageId ? { ...m, text: actionData.payload.text } : m));
        } else if (actionData.action === 'deleteConv') {
          setMessages([]);
          setViewMode('closed');
        }
      });

      // Presence heartbeat
      const sendHeartbeat = () => {
        axios.post(`${backendUrl || ''}/api/chat/heartbeat`, {
          userId: effectiveUserId,
          email: userData?.email
        }).catch(() => {});
      };
      sendHeartbeat();
      const hbInterval = setInterval(sendHeartbeat, 25000);

      return () => {
        clearInterval(hbInterval);
        newSocket.close();
      };
    }
  }, [effectiveUserId, backendUrl, userData?.email, token, viewMode]);

  // Polling fallback for Human Support Chat
  useEffect(() => {
    if (token && effectiveUserId && typeof backendUrl === 'string') {
      const fetchMsgList = () => {
        axios.get(`${backendUrl}/api/chat/messages/${effectiveUserId}/admin`)
          .then(res => {
            if (res.data?.success) {
              const msgs = res.data.messages || [];
              setMessages(prev => {
                if (prev.length !== msgs.length) return msgs;
                return prev;
              });
              
              if (msgs.length > 0) {
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.senderId === 'admin') {
                  const lastSeen = localStorage.getItem('lastSeenAdminMsgId');
                  if (lastSeen !== lastMsg._id && viewMode !== 'support') {
                    setHasUnread(true);
                    setLastUnreadMessage(lastMsg.text || '📷 Sent an attachment');
                  }
                }
              }
            }
          }).catch(err => console.log(err));
      };

      fetchMsgList();
      const interval = setInterval(fetchMsgList, viewMode === 'support' ? 3000 : 8000);
      return () => clearInterval(interval);
    }
  }, [viewMode, effectiveUserId, backendUrl, token]);

  useEffect(() => {
    if (messages.length > 0 && viewMode === 'support') {
      scrollToBottom(true);
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId === 'admin') {
        localStorage.setItem('lastSeenAdminMsgId', lastMsg._id);
      }
    }
  }, [messages, viewMode]);

  // Send Human Support Message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !effectiveUserId) return;

    if (editingMessage) {
      try {
        const res = await axios.put(`${backendUrl}/api/chat/message/${editingMessage._id}`, { text: inputText }, { headers: { token } });
        if (res.data.success) {
          setMessages(prev => prev.map(m => m._id === editingMessage._id ? res.data.message : m));
          if (socket) {
            socket.emit('messageAction', { action: 'edit', receiverId: 'admin', payload: { messageId: editingMessage._id, text: inputText } });
          }
          setEditingMessage(null);
          setInputText('');
          toast.success('Message updated');
        }
      } catch (e) {
        toast.error('Failed to edit');
      }
      return;
    }

    const messageData = {
      senderId: effectiveUserId,
      receiverId: 'admin',
      text: inputText,
      messageType: 'text'
    };

    try {
      const res = await axios.post(`${backendUrl}/api/chat/send`, messageData);
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        if (socket) {
          socket.emit('sendMessage', res.data.message);
        }
        setInputText('');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/chat/message/${msgId}`, { headers: { token } });
      if (res.data.success) {
        setMessages(prev => prev.filter(m => m._id !== msgId));
        if (socket) socket.emit('messageAction', { action: 'delete', receiverId: 'admin', payload: { messageId: msgId } });
      } else {
        toast.error(res.data.message || "Failed to delete message");
      }
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !effectiveUserId) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('senderId', effectiveUserId);
    formData.append('receiverId', 'admin');
    formData.append('messageType', 'image');

    try {
      const res = await axios.post(`${backendUrl}/api/chat/send`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        if (socket) {
          socket.emit('sendMessage', res.data.message);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Do not render on Admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <div id="keriyo-chat-widget-root" className="fixed bottom-5 right-5 z-50">
      {/* 1. SELECTION MENU POPUP */}
      {viewMode === 'menu' && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-2xl w-[310px] sm:w-[350px] overflow-hidden animate-fadeIn flex flex-col mb-2">
          {/* Header */}
          <div className="bg-zinc-950 text-white p-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-400">
                💬
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">Keriyo Support &amp; AI</h3>
                <p className="text-[11px] text-zinc-400">How can we help you today?</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setViewMode('closed')} 
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer text-base"
              title="Close"
            >
              &times;
            </button>
          </div>

          {/* Menu Options */}
          <div className="p-3 sm:p-4 flex flex-col gap-2.5 bg-zinc-50/60">
            {/* Option 1: Keriyo Customer Support */}
            <button
              type="button"
              onClick={() => {
                setViewMode('support');
                setHasUnread(false);
                setLastUnreadMessage(null);
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition shadow-2xs group flex items-start gap-3.5 cursor-pointer relative"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-black">
                    Keriyo Customer Support
                  </h4>
                  {hasUnread && (
                    <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Customer Support Team • Orders &amp; Inquiries
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Live Human Agents</span>
                </div>
              </div>
            </button>

            {/* Option 2: Keriyo AI */}
            <button
              type="button"
              onClick={() => setViewMode('ai')}
              className="w-full text-left p-3.5 rounded-2xl bg-white border border-orange-200/90 hover:border-orange-400 hover:bg-orange-50/40 transition shadow-2xs group flex items-start gap-3.5 cursor-pointer relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-orange-500/40 text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs p-1.5">
                <img src="/keriyo-emblem.svg" alt="Keriyo AI" className="w-full h-full object-contain select-none" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-orange-600 flex items-center gap-1.5">
                    <span>Keriyo AI</span>
                    <span className="bg-orange-500/15 text-orange-600 border border-orange-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                      AI
                    </span>
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Instant gadget guide, EDC fidgets &amp; recommendations
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-orange-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>24/7 Instant Assistant</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. GEMINI AI CHATBOT VIEW */}
      {viewMode === 'ai' && (
        <AiChatView
          userId={effectiveUserId}
          backendUrl={backendUrl}
          onBack={() => setViewMode('menu')}
          onClose={() => setViewMode('closed')}
        />
      )}

      {/* 3. HUMAN CUSTOMER SUPPORT VIEW */}
      {viewMode === 'support' && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-2xl w-[320px] sm:w-[360px] h-[480px] flex flex-col overflow-hidden animate-fadeIn">
          {/* Support Header */}
          <div className="bg-zinc-950 text-white p-3.5 flex justify-between items-center border-b border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <button 
                type="button"
                onClick={() => setViewMode('menu')}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0"
                title="Back to menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>

              <div className="relative flex-shrink-0">
                {userData?.profilePic ? (
                  <img src={userData.profilePic} alt={userData.name} className="w-8 h-8 rounded-full object-cover border border-white/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs border border-white/30">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'K'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                  {userData?.name || 'Customer Support'}
                </h3>
                <p className="text-[10px] text-zinc-400 truncate">Keriyo Official Support</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setViewMode('closed')} 
              className="text-zinc-400 hover:text-white text-xl leading-none px-1 flex-shrink-0 cursor-pointer"
            >
              &times;
            </button>
          </div>
          
          {/* Messages Container or Login Prompt */}
          {!token ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-zinc-50">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-xl mb-3">
                🔒
              </div>
              <h4 className="font-bold text-sm text-zinc-900 mb-1">Login Required</h4>
              <p className="text-xs text-zinc-500 mb-4 max-w-[220px]">
                Please log in to your account to chat live with our support team.
              </p>
              <button
                type="button"
                onClick={() => {
                  setViewMode('closed');
                  navigate('/login');
                }}
                className="bg-zinc-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
              >
                Login Now
              </button>
            </div>
          ) : (
            <>
              <div 
                ref={chatContainerRef}
                className="flex-1 min-h-0 p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3 bg-zinc-50 overscroll-contain"
              >
                {messages.length === 0 ? (
                  <div className="my-auto text-center p-4">
                    <p className="text-zinc-400 text-xs sm:text-sm">How can our support team help you today?</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                      onTouchStart={(e) => handleTouchStart(e, msg)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      className={`max-w-[82%] rounded-2xl p-2.5 text-xs sm:text-sm relative group ${
                        msg.senderId === effectiveUserId 
                          ? 'bg-zinc-900 text-white self-end rounded-br-xs shadow-xs select-none' 
                          : 'bg-white border border-zinc-200 text-zinc-900 self-start rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {msg.senderId === effectiveUserId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setContextMenu({
                              visible: true,
                              x: Math.min(rect.left, window.innerWidth - 140),
                              y: Math.min(rect.bottom + 5, window.innerHeight - 100),
                              msg
                            });
                          }}
                          className="absolute -top-2 -right-1 bg-white border border-zinc-200 text-zinc-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs opacity-80 sm:opacity-0 group-hover:opacity-100 transition"
                          title="Options"
                        >
                          ⋮
                        </button>
                      )}

                      {msg.messageType === 'image' && msg.fileUrl ? (
                        <div 
                          onClick={() => setPreviewImage(msg.fileUrl)}
                          className="relative group/img cursor-pointer overflow-hidden rounded-xl mb-1 block"
                          title="Click to zoom image"
                        >
                          <img src={msg.fileUrl} alt="attachment" className="rounded-xl max-w-full group-hover/img:scale-105 transition duration-200" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-1 text-white text-[11px] font-bold backdrop-blur-[1px] rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                            </svg>
                            <span>Zoom</span>
                          </div>
                        </div>
                      ) : null}
                      {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    </div>
                  ))
                )}
              </div>
              
              {contextMenu.visible && contextMenu.msg && (
                <div 
                  style={{ top: contextMenu.y, left: contextMenu.x }} 
                  className="fixed z-50 bg-white border border-zinc-200 shadow-xl rounded-lg py-1 min-w-[120px] text-zinc-800 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {contextMenu.msg.messageType === 'text' && (
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-zinc-100 font-medium flex items-center gap-2 cursor-pointer" 
                      onClick={() => { setEditingMessage(contextMenu.msg); setInputText(contextMenu.msg.text); setContextMenu({ visible: false }); }}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-red-600 font-medium flex items-center gap-2 cursor-pointer" 
                    onClick={() => { handleDeleteMessage(contextMenu.msg._id); setContextMenu({ visible: false }); }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}

              <form onSubmit={sendMessage} className="border-t border-zinc-200 p-2.5 sm:p-3 bg-white flex gap-2 items-center">
                <label className="cursor-pointer text-zinc-400 hover:text-black transition flex-shrink-0 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-xs sm:text-sm outline-none"
                />
                <button type="submit" className="text-black p-1 hover:bg-zinc-100 rounded-full transition flex-shrink-0 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* 4. FLOATING TRIGGER BUTTON */}
      {viewMode === 'closed' && (
        <div className="relative group">
          {hasUnread && lastUnreadMessage && (
            <div className="absolute bottom-full right-0 mb-4 mr-2 bg-white text-zinc-800 text-sm p-3.5 rounded-2xl rounded-br-none shadow-2xl border border-zinc-100 max-w-[220px] sm:max-w-[280px] animate-fadeIn whitespace-normal break-words z-50">
              <div className="flex items-center gap-2 mb-1.5 border-b border-zinc-100 pb-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">💬</div>
                <span className="font-bold text-[11px] text-zinc-900 uppercase tracking-wide">Keriyo Support</span>
              </div>
              <p className="line-clamp-3 text-zinc-600 leading-relaxed font-medium">"{lastUnreadMessage}"</p>
              <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                Tap chat to reply
              </p>
            </div>
          )}
          <button 
            type="button"
            onClick={() => {
              setViewMode('menu');
              setHasUnread(false);
              setLastUnreadMessage(null);
            }}
            className="bg-zinc-950 hover:bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition active:scale-95 cursor-pointer relative border border-zinc-800"
            title="Chat with Keriyo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.522 1.522 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Lightbox image preview */}
      {previewImage && (
        <ImageViewerModal 
          src={previewImage} 
          alt="Chat Attachment Full View" 
          onClose={() => setPreviewImage(null)} 
        />
      )}
    </div>
  );
};

export default ChatWidget;
