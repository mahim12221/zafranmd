import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const Chat = ({ token }) => {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [customersMap, setCustomersMap] = useState({});

  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const touchTimerRef = useRef(null);

  const isUserOnline = (userIdToCheck, custInfo) => {
    if (!onlineUsers || !Array.isArray(onlineUsers) || onlineUsers.length === 0) return false;
    const targetId = String(userIdToCheck || '').trim().toLowerCase();
    const custObjId = String(custInfo?._id || '').trim().toLowerCase();
    const custEmail = String(custInfo?.email || '').trim().toLowerCase();

    return onlineUsers.some(item => {
      const val = String(item || '').trim().toLowerCase();
      if (!val || val === 'admin') return false;
      return (targetId && val === targetId) || 
             (custObjId && val === custObjId) || 
             (custEmail && val === custEmail);
    });
  };

  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/chat/online-users`);
      if (res.data && res.data.success && Array.isArray(res.data.onlineUsers)) {
        setOnlineUsers(res.data.onlineUsers);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, msg: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({ 
      visible: true, 
      x: Math.min(e.clientX, window.innerWidth - 140), 
      y: Math.min(e.clientY, window.innerHeight - 100), 
      msg 
    });
  };

  const handleTouchStart = (e, msg) => {
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

  useEffect(() => {
    if (token) {
      const newSocket = io(backendUrl);
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('register', 'admin');
      });

      newSocket.on('onlineUsers', (usersList) => {
        setOnlineUsers(usersList);
      });

      newSocket.on('receiveMessage', (message) => {
        if (activeUser && (message.senderId === activeUser || message.receiverId === activeUser)) {
          setMessages(prev => {
            if (prev.some(m => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
        fetchConversations(); // refresh sidebar
      });

      newSocket.on('messageAction', (actionData) => {
        if (actionData.action === 'delete') {
           setMessages(prev => prev.filter(m => m._id !== actionData.payload.messageId));
        } else if (actionData.action === 'edit') {
           setMessages(prev => prev.map(m => m._id === actionData.payload.messageId ? { ...m, text: actionData.payload.text } : m));
        } else if (actionData.action === 'deleteConv') {
           if (activeUser === actionData.receiverId || activeUser === actionData.senderId) {
             setMessages([]);
             setActiveUser(null);
           }
           fetchConversations();
        }
      });

      return () => newSocket.close();
    }
  }, [token, activeUser]);

  const fetchConversations = async () => {
    try {
      // Load all registered users first to map profile pictures and names
      try {
        const usersRes = await axios.get(`${backendUrl}/api/user/admin/all-users`, { headers: { token } });
        if (usersRes.data.success && usersRes.data.users) {
          const map = {};
          usersRes.data.users.forEach(u => {
            map[u._id] = {
              name: u.name || 'Valued Customer',
              email: u.email || '',
              profilePic: u.profilePic || '',
              phone: u.phone || ''
            };
          });
          setCustomersMap(prev => ({ ...map, ...prev }));
        }
      } catch (e) {
        console.log("Error fetching all users:", e);
      }

      const res = await axios.get(`${backendUrl}/api/chat/conversations/admin`, { headers: { token } });
      if (res.data.success) {
        setConversations(res.data.conversations);
        // Fetch specific profile for each conversation participant
        res.data.conversations.forEach(conv => {
           const custId = conv.participants.find(p => p !== 'admin');
           if (custId) {
              axios.get(`${backendUrl}/api/user/admin/user-profile/${custId}`, { headers: { token } })
                .then(userRes => {
                   if (userRes.data.success && userRes.data.user) {
                      setCustomersMap(prev => ({
                        ...prev, 
                        [custId]: {
                          name: userRes.data.user.name || 'Valued Customer',
                          email: userRes.data.user.email || '',
                          profilePic: userRes.data.user.profilePic || '',
                          phone: userRes.data.user.phone || ''
                        }
                      }));
                   }
                }).catch(()=>{});
           }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (activeUser && token) {
      const fetchActiveMessages = () => {
        axios.get(`${backendUrl}/api/chat/messages/admin/${activeUser}`, { headers: { token } })
          .then(res => {
            if (res.data.success) {
              setMessages(res.data.messages || []);
            }
          }).catch(err => console.log(err));
      };

      fetchActiveMessages();
      const interval = setInterval(fetchActiveMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeUser, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;

    if (editingMessage) {
      try {
        const res = await axios.put(`${backendUrl}/api/chat/message/${editingMessage._id}`, { text: inputText }, { headers: { token } });
        if (res.data.success) {
          setMessages(prev => prev.map(m => m._id === editingMessage._id ? res.data.message : m));
          if (socket) {
            socket.emit('messageAction', { action: 'edit', receiverId: activeUser, payload: { messageId: editingMessage._id, text: inputText } });
          }
          setEditingMessage(null);
          setInputText('');
          toast.success('Message edited');
        }
      } catch (e) {
        toast.error('Failed to edit message');
      }
      return;
    }

    const messageData = {
      senderId: 'admin',
      receiverId: activeUser,
      text: inputText,
      messageType: 'text'
    };

    try {
      const res = await axios.post(`${backendUrl}/api/chat/send`, messageData, { headers: { token } });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        if (socket) {
          socket.emit('sendMessage', res.data.message);
        }
        setInputText('');
        fetchConversations(); // update sidebar
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/chat/message/${msgId}`, { headers: { token } });
      if (res.data.success) {
        setMessages(prev => prev.filter(m => m._id !== msgId));
        if (socket) {
          socket.emit('messageAction', { action: 'delete', receiverId: activeUser, payload: { messageId: msgId } });
        }
        toast.success("Message deleted");
      } else {
        toast.error(res.data.message || "Failed to delete message");
      }
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const handleDeleteConversation = async (custId) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই কাস্টমারের সাথে সম্পূর্ণ চ্যাট ডিলেট করতে চান?")) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/chat/conversation/${custId}`, { headers: { token } });
      if (res.data.success) {
        toast.success("কনভারসেশন সম্পূর্ণ মুছে ফেলা হয়েছে");
        if (socket) {
          socket.emit('messageAction', { action: 'deleteConv', receiverId: custId });
        }
        setActiveUser(null);
        setMessages([]);
        fetchConversations();
      } else {
        toast.error(res.data.message || "Failed to delete conversation");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete conversation");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeUser) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('senderId', 'admin');
    formData.append('receiverId', activeUser);
    formData.append('messageType', 'image');

    try {
      const res = await axios.post(`${backendUrl}/api/chat/send`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          token 
        }
      });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        if (socket) {
          socket.emit('sendMessage', res.data.message);
        }
        fetchConversations();
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to send image');
    }
  };

  const activeCustomerInfo = customersMap[activeUser] || {};

  return (
    <div className="flex flex-col sm:flex-row h-[82vh] border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs mt-3 w-full min-w-0">
      {/* Sidebar: Conversations List */}
      <div className={`w-full sm:w-1/3 border-r border-gray-200 bg-gray-50/70 flex flex-col h-full min-h-0 overflow-hidden ${activeUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-3 bg-white border-b border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span>💬</span>
              <span>Customer Live Chats</span>
            </h2>
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div 
          className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}
        >
          {(() => {
            const filteredConvs = conversations.filter(conv => {
              if (!searchTerm.trim()) return true;
              const custId = conv.participants.find(p => p !== 'admin');
              const custInfo = customersMap[custId] || {};
              const q = searchTerm.toLowerCase();
              return (
                (custInfo.name && custInfo.name.toLowerCase().includes(q)) ||
                (custInfo.email && custInfo.email.toLowerCase().includes(q)) ||
                (custId && custId.toLowerCase().includes(q)) ||
                (conv.lastMessage && conv.lastMessage.toLowerCase().includes(q))
              );
            });

            if (filteredConvs.length === 0) {
              return (
                <div className="text-center p-8 text-gray-400 text-xs">
                  <p className="text-2xl mb-1">📭</p>
                  <p>{searchTerm ? 'No matching customer chats found' : 'No customer chats found'}</p>
                </div>
              );
            }

            return filteredConvs.map(conv => {
              const custId = conv.participants.find(p => p !== 'admin');
              const isActive = activeUser === custId;
              const custInfo = customersMap[custId] || {};
              const displayName = custInfo.name || 'Customer ' + custId.substring(0, 6);
              const profilePic = custInfo.profilePic;
              const online = isUserOnline(custId, custInfo);

              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveUser(custId)}
                  className={`p-3 sm:p-3.5 cursor-pointer hover:bg-gray-100/80 transition flex items-center gap-3 ${isActive ? 'bg-gray-200/80 border-l-4 border-black' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {profilePic ? (
                      <img src={profilePic} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${online ? 'bg-emerald-500 ring-2 ring-emerald-400/30' : 'bg-gray-400'}`}></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-1">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{displayName}</p>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {custInfo.email && <p className="text-[10px] text-gray-400 truncate">{custInfo.email}</p>}
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'Sent an attachment'}</p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`w-full sm:w-2/3 flex-col bg-white h-full ${!activeUser ? 'hidden sm:flex' : 'flex'}`}>
        {activeUser ? (
          <>
            {/* Active Customer Chat Header */}
            <div className="p-2.5 sm:p-4 border-b border-gray-200 bg-white shadow-xs flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <button 
                  onClick={() => setActiveUser(null)} 
                  className="sm:hidden text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  <span>←</span>
                  <span>Chats</span>
                </button>
                
                <div className="relative shrink-0">
                  {activeCustomerInfo.profilePic ? (
                    <img src={activeCustomerInfo.profilePic} alt={activeCustomerInfo.name || 'User'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs">
                      {(activeCustomerInfo.name || 'User').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 border-2 border-white rounded-full ${isUserOnline(activeUser, activeCustomerInfo) ? 'bg-emerald-500 ring-2 ring-emerald-400/40' : 'bg-gray-400'}`}></span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate max-w-[120px] sm:max-w-xs">
                      {activeCustomerInfo.name || 'Customer (' + activeUser.substring(0, 6) + ')'}
                    </h3>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${isUserOnline(activeUser, activeCustomerInfo) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                      {isUserOnline(activeUser, activeCustomerInfo) ? 'Active Now' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 truncate">
                    {activeCustomerInfo.email && <span className="truncate hidden xs:inline">{activeCustomerInfo.email}</span>}
                    {activeCustomerInfo.phone && <span className="font-semibold text-gray-700">{activeCustomerInfo.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button 
                  onClick={() => handleDeleteConversation(activeUser)} 
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Delete entire conversation"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Delete Chat</span>
                </button>
                <button 
                  onClick={() => setActiveUser(null)} 
                  className="hidden sm:block text-xs text-gray-400 hover:text-gray-700 font-medium px-2 py-1"
                >
                  Close Chat
                </button>
              </div>
            </div>
            
            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 bg-gray-50/70 flex flex-col gap-2.5 sm:gap-3">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                  onTouchStart={(e) => handleTouchStart(e, msg)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-2.5 sm:p-3 text-xs sm:text-sm relative group min-w-0 overflow-hidden ${
                    msg.senderId === 'admin' 
                      ? 'bg-black text-white self-end rounded-br-xs shadow-xs select-none' 
                      : 'bg-white border border-gray-200 text-gray-900 self-start rounded-bl-xs shadow-xs select-none'
                  }`}
                >
                  {/* Touch/hover action menu trigger */}
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
                    className={`absolute -top-2 ${msg.senderId === 'admin' ? '-left-1' : '-right-1'} bg-white border border-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs opacity-80 sm:opacity-0 group-hover:opacity-100 transition`}
                    title="Options (Tap to edit/delete)"
                  >
                    ⋮
                  </button>

                  {msg.messageType === 'image' && msg.fileUrl ? (
                    <img src={msg.fileUrl} alt="attachment" className="rounded-xl mb-1.5 max-w-full max-h-52 sm:max-h-60 object-cover w-full" />
                  ) : null}
                  {msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.text}</p>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {contextMenu.visible && contextMenu.msg && (
              <div 
                style={{ top: contextMenu.y, left: contextMenu.x }} 
                className="fixed z-50 bg-white border border-gray-200 shadow-xl rounded-xl py-1 min-w-[130px] text-gray-800 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                 {contextMenu.msg.senderId === 'admin' && contextMenu.msg.messageType === 'text' && (
                     <button 
                       className="w-full text-left px-4 py-2 hover:bg-gray-100 font-medium flex items-center gap-2 cursor-pointer" 
                       onClick={() => { setEditingMessage(contextMenu.msg); setInputText(contextMenu.msg.text); setContextMenu({visible:false}); }}
                     >
                       ✏️ Edit Message
                     </button>
                 )}
                 <button 
                   className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium flex items-center gap-2 cursor-pointer" 
                   onClick={() => { handleDeleteMessage(contextMenu.msg._id); setContextMenu({visible:false}); }}
                 >
                   🗑️ Delete Message
                 </button>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
              <label className="cursor-pointer text-gray-400 hover:text-black transition p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <input 
                type="text" 
                placeholder="Type your reply..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none border border-transparent focus:border-gray-300 focus:bg-white transition"
              />
              <button type="submit" className="bg-black text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-neutral-800 transition shadow-xs flex-shrink-0 cursor-pointer">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <span className="text-4xl mb-2">💬</span>
            <p className="font-semibold text-gray-600 text-sm">Select a customer chat</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">Click on any conversation from the sidebar to start messaging in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
