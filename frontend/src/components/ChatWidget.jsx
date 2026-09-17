import React, { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ImageViewerModal from './ImageViewerModal';

const ChatWidget = () => {
  const { token, backendUrl, userData } = useContext(ShopContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const chatContainerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const [previewImage, setPreviewImage] = useState(null);
  const touchTimerRef = useRef(null);

  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, msg: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, msg) => {
    if (msg.senderId !== userId) return;
    e.preventDefault();
    setContextMenu({ 
      visible: true, 
      x: Math.min(e.clientX, window.innerWidth - 140), 
      y: Math.min(e.clientY, window.innerHeight - 100), 
      msg 
    });
  };

  const handleTouchStart = (e, msg) => {
    if (msg.senderId !== userId) return;
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

  // Decode user ID from token or fetch profile
  useEffect(() => {
    if (token) {
      axios.post(`${backendUrl}/api/user/profile`, { userId: 'not_used' }, { headers: { token } })
        .then(res => {
          if (res.data.success && res.data.user) {
            setUserId(res.data.user._id);
          }
        }).catch(err => console.log(err));
    } else {
        setUserId(null);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    if (userId && backendUrl) {
      const newSocket = io(backendUrl);
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('register', userId);
      });

      newSocket.on('receiveMessage', (message) => {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        // Show notification if closed
        if (!isOpen) {
          toast.info(`New message from Admin`);
          setHasUnread(true);
        }
      });
      
      newSocket.on('messageAction', (actionData) => {
        if (actionData.action === 'delete') {
           setMessages(prev => prev.filter(m => m._id !== actionData.payload.messageId));
        } else if (actionData.action === 'edit') {
           setMessages(prev => prev.map(m => m._id === actionData.payload.messageId ? { ...m, text: actionData.payload.text } : m));
        } else if (actionData.action === 'deleteConv') {
           setMessages([]);
           setIsOpen(false);
        }
      });

      return () => newSocket.close();
    }
  }, [userId, backendUrl, isOpen]);

  // Polling fallback to ensure messages are updated in real-time even if socket drops
  useEffect(() => {
    if (isOpen && userId) {
      const fetchMsgList = () => {
        axios.get(`${backendUrl}/api/chat/messages/${userId}/admin`)
          .then(res => {
            if (res.data.success) {
              setMessages(res.data.messages || []);
            }
          }).catch(err => console.log(err));
      };

      fetchMsgList();
      const interval = setInterval(fetchMsgList, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId, backendUrl]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !userId) return;

    if (editingMessage) {
        try {
           const res = await axios.put(`${backendUrl}/api/chat/message/${editingMessage._id}`, { text: inputText }, { headers: { token }});
           if (res.data.success) {
               setMessages(prev => prev.map(m => m._id === editingMessage._id ? res.data.message : m));
               if (socket) {
                   socket.emit('messageAction', { action: 'edit', receiverId: 'admin', payload: { messageId: editingMessage._id, text: inputText } });
               }
               setEditingMessage(null);
               setInputText('');
               toast.success('Message updated');
           }
        } catch(e) {
           toast.error('Failed to edit');
        }
        return;
    }

    const messageData = {
      senderId: userId,
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
          const res = await axios.delete(`${backendUrl}/api/chat/message/${msgId}`, { headers: { token }});
          if(res.data.success) {
             setMessages(prev => prev.filter(m => m._id !== msgId));
             if(socket) socket.emit('messageAction', { action: 'delete', receiverId: 'admin', payload: { messageId: msgId } });
          } else {
             toast.error(res.data.message || "Failed to delete message");
          }
      } catch (err) {
          toast.error("Failed to delete message");
      }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('senderId', userId);
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

  if (location.pathname.startsWith('/admin')) return null;
  if (!token) return null; // Require login to chat

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-80 h-96 flex flex-col overflow-hidden">
          <div className="bg-black text-white p-3.5 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                {userData?.profilePic ? (
                  <img src={userData.profilePic} alt={userData.name} className="w-8 h-8 rounded-full object-cover border border-white/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs border border-white/30">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full"></span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate leading-tight max-w-[140px] sm:max-w-[180px]">{userData?.name || 'Customer Support'}</h3>
                <p className="text-[10px] text-gray-300 truncate">Zafran Official Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white text-xl leading-none px-1 flex-shrink-0 cursor-pointer">&times;</button>
          </div>
          
          <div 
            ref={chatContainerRef}
            className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50 overscroll-contain"
          >
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-10">How can we help you today?</p>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                  onTouchStart={(e) => handleTouchStart(e, msg)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={`max-w-[82%] rounded-2xl p-2.5 text-xs sm:text-sm relative group ${
                    msg.senderId === userId 
                      ? 'bg-black text-white self-end rounded-br-xs shadow-xs select-none' 
                      : 'bg-white border border-gray-200 text-gray-900 self-start rounded-bl-xs shadow-xs'
                  }`}
                >
                  {/* Touch/hover action menu trigger for user's own messages */}
                  {msg.senderId === userId && (
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
                      className="absolute -top-2 -right-1 bg-white border border-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs opacity-80 sm:opacity-0 group-hover:opacity-100 transition"
                      title="Options (Tap to edit/delete)"
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
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                </div>
              ))
            )}
          </div>
          
          {contextMenu.visible && contextMenu.msg && (
              <div 
                style={{ top: contextMenu.y, left: contextMenu.x }} 
                className="fixed z-50 bg-white border border-gray-200 shadow-xl rounded-lg py-1 min-w-[120px] text-gray-800 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                 {contextMenu.msg.messageType === 'text' && (
                     <button 
                       className="w-full text-left px-4 py-2 hover:bg-gray-100 font-medium flex items-center gap-2" 
                       onClick={() => { setEditingMessage(contextMenu.msg); setInputText(contextMenu.msg.text); setContextMenu({visible:false}); }}
                     >
                       ✏️ Edit
                     </button>
                 )}
                 <button 
                   className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium flex items-center gap-2" 
                   onClick={() => { handleDeleteMessage(contextMenu.msg._id); setContextMenu({visible:false}); }}
                 >
                   🗑️ Delete
                 </button>
              </div>
          )}

          <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 bg-white flex gap-2 items-center">
            <label className="cursor-pointer text-gray-400 hover:text-black transition flex-shrink-0">
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
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="text-black p-1 hover:bg-gray-100 rounded-full transition flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={() => { setIsOpen(true); setHasUnread(false); }}
            className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.522 1.522 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </button>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
          )}
        </div>
      )}

      {/* Full-Screen Image Lightbox Viewer with Zoom & Controls for Users */}
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
