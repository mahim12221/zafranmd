import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { ShopContext } from '../context/ShopContext';
import ImageViewerModal from './ImageViewerModal';

const AdminChat = ({ adminToken: token, ordersList = [] }) => {
  const { backendUrl, selectedChatUser, setSelectedChatUser, currency } = useContext(ShopContext);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const chatContainerRef = useRef(null);
  const [customersMap, setCustomersMap] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isUserOnline = (userIdToCheck, customerObj) => {
    if (!onlineUsers || !Array.isArray(onlineUsers) || onlineUsers.length === 0) return false;
    const targetId = String(userIdToCheck || '').trim().toLowerCase();
    const custObjId = String(customerObj?._id || '').trim().toLowerCase();
    const custEmail = String(customerObj?.email || '').trim().toLowerCase();

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
      const res = await axios.get(`${backendUrl || ''}/api/chat/online-users`);
      if (res.data && res.data.success && Array.isArray(res.data.onlineUsers)) {
        setOnlineUsers(res.data.onlineUsers);
      }
    } catch (e) {
      // quiet fallback
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 4000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Sync active user with context
  useEffect(() => {
    if (selectedChatUser) {
      setActiveUser(selectedChatUser);
    }
  }, [selectedChatUser]);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu({ visible: false, x: 0, y: 0, msg: null });
      setShowHeaderMenu(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, msg) => {
    if (msg.senderId !== 'admin') return;
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, msg });
  };

  const fetchAllUsersMap = async () => {
    if (!token) return;
    try {
      const res = await axios.post(`${backendUrl}/api/user/admin/all-users`, {}, { headers: { token } });
      if (res.data.success && Array.isArray(res.data.users)) {
        const map = {};
        res.data.users.forEach(u => {
          if (u._id) {
            map[u._id] = { ...u, fetched: true };
          }
        });
        setCustomersMap(prev => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.log('Error fetching all users for admin chat map:', err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllUsersMap();
    }
  }, [token, backendUrl]);

  const fetchCustomerInfo = async (custId) => {
    if (!custId || (customersMap[custId]?.fetched && customersMap[custId]?.name && !customersMap[custId]?.name.startsWith('Customer '))) return;
    try {
      const userRes = await axios.post(`${backendUrl}/api/user/admin/user-profile`, { userId: custId }, { headers: { token } });
      if (userRes.data.success && userRes.data.user) {
        setCustomersMap(prev => ({
          ...prev,
          [custId]: {
            ...userRes.data.user,
            fetched: true
          }
        }));
        return;
      }
    } catch (err) {
      console.log('Error fetching customer via admin API:', err.message);
    }

    const order = ordersList?.find(o => o.userId === custId);
    if (order && order.address) {
      setCustomersMap(prev => ({
        ...prev,
        [custId]: {
          _id: custId,
          name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || 'Valued Customer',
          email: order.address.email || 'customer@zafran.com',
          phone: order.address.phone || '',
          address: `${order.address.street || ''}, ${order.address.city || ''}`,
          profilePic: '',
          fetched: true
        }
      }));
    }
  };

  const getCustomerObj = (custId) => {
    if (customersMap[custId] && customersMap[custId].name && !customersMap[custId].name.startsWith('Customer ')) {
      return customersMap[custId];
    }
    if (ordersList && ordersList.length > 0) {
      const order = ordersList.find(o => o.userId === custId);
      if (order && order.address) {
        return {
          _id: custId,
          name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || 'Valued Customer',
          email: order.address.email || 'customer@zafran.com',
          phone: order.address.phone || '',
          address: `${order.address.street || ''}, ${order.address.city || ''}`,
          profilePic: ''
        };
      }
    }
    if (custId && !customersMap[custId]?.fetched) {
      fetchCustomerInfo(custId);
    }
    return customersMap[custId] || {
      _id: custId,
      name: 'Valued Customer',
      email: '',
      phone: '',
      address: '',
      profilePic: ''
    };
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
        if (activeUser && message.senderId === activeUser) {
          setMessages(prev => [...prev, message]);
        } else {
          toast.info(`New message from Customer`);
        }
        fetchConversations();
      });

      newSocket.on('messageAction', (actionData) => {
        if (actionData.action === 'delete') {
          setMessages(prev => prev.filter(m => m._id !== actionData.payload.messageId));
        } else if (actionData.action === 'edit') {
          setMessages(prev => prev.map(m => m._id === actionData.payload.messageId ? { ...m, text: actionData.payload.text } : m));
        } else if (actionData.action === 'deleteConv') {
          setMessages([]);
          setActiveUser(null);
          fetchConversations();
        }
      });

      return () => newSocket.close();
    }
  }, [token, activeUser, backendUrl]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/chat/conversations/admin`, { headers: { token } });
      if (res.data.success) {
        setConversations(res.data.conversations || []);
        res.data.conversations.forEach(conv => {
          const custId = conv.participants.find(p => p !== 'admin');
          if (custId) {
            fetchCustomerInfo(custId);
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

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    if (activeUser) {
      fetchCustomerInfo(activeUser);
      axios.get(`${backendUrl}/api/chat/messages/admin/${activeUser}`, { headers: { token } })
        .then(res => {
          if (res.data.success) {
            setMessages(res.data.messages || []);
            setTimeout(() => scrollToBottom(false), 50);
          }
        }).catch(err => console.log(err));
    } else {
      setMessages([]);
    }
  }, [activeUser, token, backendUrl]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;
    
    if (editingMessage) {
      try {
        const res = await axios.put(`${backendUrl}/api/chat/message/${editingMessage._id}`, { text: inputText }, { headers: { token }});
        if (res.data.success) {
          setMessages(prev => prev.map(m => m._id === editingMessage._id ? res.data.message : m));
          if (socket) {
            socket.emit('messageAction', { action: 'edit', receiverId: activeUser, payload: { messageId: editingMessage._id, text: inputText } });
          }
          setEditingMessage(null);
          setInputText('');
          toast.success('Message updated');
        }
      } catch (err) {
        toast.error('Failed to edit');
      }
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/chat/send`, {
        senderId: 'admin',
        receiverId: activeUser,
        text: inputText,
        messageType: 'text'
      }, { headers: { token } });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        if (socket) {
          socket.emit('sendMessage', res.data.message);
        }
        setInputText('');
        fetchConversations();
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/chat/message/${messageId}`, { headers: { token } });
      if (res.data.success) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        if (socket) {
          socket.emit('messageAction', { action: 'delete', receiverId: activeUser, payload: { messageId } });
        }
        toast.success('Message deleted');
      }
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/chat/conversation/${conversationId}`, { headers: { token } });
      if (res.data.success) {
        toast.success('Conversation deleted');
        if (socket && activeUser) {
          socket.emit('messageAction', { action: 'deleteConv', receiverId: activeUser, payload: { conversationId } });
        }
        setMessages([]);
        setActiveUser(null);
        if (setSelectedChatUser) setSelectedChatUser(null);
        fetchConversations();
      }
    } catch (err) {
      toast.error('Failed to delete conversation');
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

  const activeCustomer = activeUser ? getCustomerObj(activeUser) : null;
  const activeUserOrders = ordersList?.filter(o => o.userId === activeUser) || [];
  const activeUserSpent = activeUserOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  return (
    <div className="flex flex-col sm:flex-row h-[75vh] sm:h-[calc(100vh-200px)] min-h-[480px] max-h-[860px] border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs w-full min-w-0">
      {/* Sidebar: Conversations (Messenger Style) */}
      <div className={`w-full sm:w-80 border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0 h-full min-h-0 overflow-hidden ${activeUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-3.5 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-gray-900">Live Chats</h2>
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{conversations.length}</span>
            </div>
            <button 
              onClick={() => { fetchConversations(); fetchOnlineUsers(); }}
              className="text-xs text-gray-500 hover:text-black font-semibold cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {/* Quick search filter to find any user instantly */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search user name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100/90 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition"
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

        {/* Scrollable conversation items */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}
        >
          {(() => {
            const filteredConvs = conversations.filter(conv => {
              if (!searchTerm.trim()) return true;
              const custId = conv.participants.find(p => p !== 'admin');
              const cust = getCustomerObj(custId);
              const q = searchTerm.toLowerCase();
              return (
                (cust.name && cust.name.toLowerCase().includes(q)) ||
                (cust.email && cust.email.toLowerCase().includes(q)) ||
                (custId && custId.toLowerCase().includes(q)) ||
                (conv.lastMessage && conv.lastMessage.toLowerCase().includes(q))
              );
            });

            if (filteredConvs.length === 0) {
              return (
                <div className="text-center py-16 px-4">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-xs font-semibold text-gray-500">
                    {searchTerm ? 'No matching users found' : 'No conversations yet'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {searchTerm ? 'Try a different search term' : 'Customer chats will appear here in real-time.'}
                  </p>
                </div>
              );
            }

            return filteredConvs.map(conv => {
              const custId = conv.participants.find(p => p !== 'admin');
              const cust = getCustomerObj(custId);
              const isActive = activeUser === custId;
              const online = isUserOnline(custId, cust);
              
              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveUser(custId)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer hover:bg-gray-100/80 transition select-none ${isActive ? 'bg-sky-50/70 border-l-4 border-sky-400 font-medium' : ''}`}
                >
                  <div className="relative shrink-0">
                    {cust.profilePic ? (
                      <img src={cust.profilePic} alt={cust.name} className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${online ? 'bg-emerald-500 ring-2 ring-emerald-400/30' : 'bg-gray-400'}`}></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{cust.name}</p>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {cust.email && <p className="text-[10px] text-gray-400 truncate">{cust.email}</p>}
                    <div className="flex items-center justify-between text-gray-500 text-xs mt-0.5">
                      <p className="truncate mr-2">{conv.lastMessage || 'Sent an attachment'}</p>
                      {conv.updatedAt && (
                        <span className="text-[10px] text-gray-400 shrink-0">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Main Chat Area (Messenger Style) */}
      <div className={`flex-1 min-w-0 h-full min-h-0 flex flex-col bg-white relative overflow-hidden ${activeUser ? 'flex' : 'hidden sm:flex'}`}>
        {activeUser && activeCustomer ? (
          <>
            {/* Header */}
            <div className="p-2.5 sm:p-3 px-3 sm:px-5 border-b border-gray-200 bg-white shadow-2xs flex items-center justify-between z-10 shrink-0 gap-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button 
                  type="button"
                  onClick={() => { setActiveUser(null); if (setSelectedChatUser) setSelectedChatUser(null); }} 
                  className="sm:hidden text-gray-500 hover:text-black shrink-0 p-1 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                  title="Back to conversations"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <div className="relative shrink-0">
                  {activeCustomer.profilePic ? (
                    <img src={activeCustomer.profilePic} alt={activeCustomer.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 shadow-2xs" />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs">
                      {activeCustomer.name ? activeCustomer.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 border-2 border-white rounded-full ${isUserOnline(activeUser, activeCustomer) ? 'bg-emerald-500 ring-2 ring-emerald-400/40' : 'bg-gray-400'}`}></span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate leading-tight">{activeCustomer.name}</h3>
                  <p className={`text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 truncate ${isUserOnline(activeUser, activeCustomer) ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isUserOnline(activeUser, activeCustomer) ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="truncate">{isUserOnline(activeUser, activeCustomer) ? 'Active Now' : 'Offline'}</span>
                    {activeCustomer.email && (
                      <span className="hidden sm:inline text-gray-400 font-normal truncate">• {activeCustomer.email}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions Dropdown / Popup Menu */}
              <div className="relative shrink-0 flex items-center gap-1.5">
                {/* Desktop Buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="View User Profile (Read Only)"
                  >
                    <span>👤</span>
                    <span>View Profile</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      const conv = conversations.find(c => c.participants.includes(activeUser));
                      if (conv) handleDeleteConversation(conv._id);
                    }} 
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Delete Entire Conversation"
                  >
                    <span>🗑️</span>
                    <span>Delete Chat</span>
                  </button>
                </div>

                {/* Mobile Three-Dots Popup Menu Button */}
                <div className="sm:hidden relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHeaderMenu(prev => !prev);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-base flex items-center justify-center transition cursor-pointer border border-gray-200 shadow-2xs"
                    title="Chat menu options"
                  >
                    ⋮
                  </button>

                  {showHeaderMenu && (
                    <div 
                      className="absolute right-0 top-10 z-50 bg-white border border-gray-200 shadow-2xl rounded-2xl p-1.5 min-w-[150px] text-xs font-semibold text-gray-800 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowHeaderMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-sky-50 text-sky-900 rounded-xl flex items-center gap-2 cursor-pointer font-bold transition"
                      >
                        <span>👤</span>
                        <span>View Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowHeaderMenu(false);
                          const conv = conversations.find(c => c.participants.includes(activeUser));
                          if (conv) handleDeleteConversation(conv._id);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 cursor-pointer font-bold transition"
                      >
                        <span>🗑️</span>
                        <span>Delete Chat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Message Stream with Smooth Independent Scrolling */}
            <div 
              ref={chatContainerRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50/60 flex flex-col gap-3 overscroll-contain"
            >
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm font-medium">No messages in this chat.</p>
                  <p className="text-xs mt-1">Send a greeting message below.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAdmin = msg.senderId === 'admin';
                  return (
                    <div 
                      key={msg._id || index} 
                      className={`flex items-end gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[75%] min-w-0 ${isAdmin ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {!isAdmin && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 overflow-hidden mb-0.5">
                          {activeCustomer.profilePic ? (
                            <img src={activeCustomer.profilePic} alt={activeCustomer.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-neutral-800 text-white flex items-center justify-center text-[10px] font-bold">
                              {activeCustomer.name ? activeCustomer.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                          )}
                        </div>
                      )}

                      <div 
                        onContextMenu={(e) => handleContextMenu(e, msg)}
                        className={`rounded-2xl p-2.5 sm:p-3 text-xs sm:text-sm shadow-xs relative min-w-0 max-w-full overflow-hidden ${
                          isAdmin 
                            ? 'bg-black text-white rounded-br-xs cursor-context-menu' 
                            : 'bg-white text-gray-900 border border-gray-100 rounded-bl-xs'
                        }`}
                      >
                        {msg.messageType === 'image' && msg.fileUrl && (
                          <div 
                            onClick={() => setPreviewImage(msg.fileUrl)}
                            className="relative group cursor-pointer overflow-hidden rounded-xl mb-1.5 max-w-full block"
                            title="Click to zoom in full panel"
                          >
                            <img 
                              src={msg.fileUrl} 
                              alt="attachment" 
                              className="rounded-xl max-w-full max-h-52 sm:max-h-60 object-cover group-hover:scale-105 transition duration-200 w-full" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-[2px] rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                              </svg>
                              <span>Click to Zoom</span>
                            </div>
                          </div>
                        )}
                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.text}</p>}
                        
                        <div className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-gray-400' : 'text-gray-400'}`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Context Menu for edit/delete */}
            {contextMenu.visible && contextMenu.msg && (
              <div 
                style={{ top: contextMenu.y, left: contextMenu.x }} 
                className="fixed z-50 bg-white border border-gray-200 shadow-xl rounded-xl py-1 min-w-[150px] text-gray-800 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                {contextMenu.msg.messageType === 'text' && (
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-semibold flex items-center gap-2 cursor-pointer" 
                    onClick={() => { setEditingMessage(contextMenu.msg); setInputText(contextMenu.msg.text); setContextMenu({visible:false}); }}
                  >
                    ✏️ Edit Message
                  </button>
                )}
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs text-red-600 font-semibold flex items-center gap-2 cursor-pointer" 
                  onClick={() => { handleDeleteMessage(contextMenu.msg._id); setContextMenu({visible:false}); }}
                >
                  🗑️ Delete Message
                </button>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-2 sm:p-3 bg-white border-t border-gray-200 flex gap-1.5 sm:gap-2 items-center shrink-0">
              <label className="cursor-pointer text-gray-500 hover:text-black p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition shrink-0" title="Attach Image">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              
              <input 
                type="text" 
                placeholder={editingMessage ? "Editing..." : "Type reply..."} 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 min-w-0 bg-gray-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-gray-900 outline-none border border-transparent focus:border-gray-300 transition"
              />

              {editingMessage && (
                <button 
                  type="button" 
                  onClick={() => { setEditingMessage(null); setInputText(''); }}
                  className="text-[10px] sm:text-xs text-gray-500 hover:text-black font-semibold px-1 sm:px-2 shrink-0"
                >
                  Cancel
                </button>
              )}

              <button 
                type="submit" 
                className="bg-black text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-800 transition active:scale-95 cursor-pointer shrink-0"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mb-3">
              💬
            </div>
            <p className="font-bold text-gray-700 text-sm">Select a Conversation</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">Click any customer chat from the list on the left to start responding.</p>
          </div>
        )}
      </div>

      {/* READ-ONLY USER PROFILE MODAL (Admin View) */}
      {showProfileModal && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-[92vw] sm:max-w-md w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Customer Profile</h3>
                  <p className="text-[11px] text-sky-700 font-medium">🔒 Read-Only Admin View</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl leading-none font-bold flex items-center justify-center transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-sky-300 mb-2.5 shadow-md bg-gray-100 flex items-center justify-center shrink-0">
                {activeCustomer.profilePic ? (
                  <img src={activeCustomer.profilePic} alt={activeCustomer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-900 text-sky-300 flex items-center justify-center text-2xl font-bold">
                    {activeCustomer.name ? activeCustomer.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
              </div>
              <h4 className="font-bold text-base text-gray-900">{activeCustomer.name}</h4>
              <p className="text-xs text-gray-500 break-all">{activeCustomer.email || 'No email provided'}</p>
              <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Verified Customer
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                <span className="text-gray-500 font-medium">Phone Number</span>
                <span className="font-bold text-gray-900">{activeCustomer.phone || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-start gap-1">
                <span className="text-gray-500 font-medium">Default Address</span>
                <span className="font-bold text-gray-900 text-right max-w-full sm:max-w-[200px] break-words">{activeCustomer.address || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                <span className="text-gray-500 font-medium">Total Logins</span>
                <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{activeCustomer.loginCount || 1} times</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                <span className="text-gray-500 font-medium">Orders Placed</span>
                <span className="font-bold text-gray-900">{activeUserOrders.length} orders ({currency}{activeUserSpent.toLocaleString()})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap justify-between items-center gap-1">
                <span className="text-gray-500 font-medium">Joined Date</span>
                <span className="font-bold text-gray-800">
                  {activeCustomer.createdAt ? new Date(activeCustomer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Registered User'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <p className="text-[10px] text-gray-400 italic">User data is read-only.</p>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-sky-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Lightbox Viewer with Zoom & Controls */}
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

export default AdminChat;
