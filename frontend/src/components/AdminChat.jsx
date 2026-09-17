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
  const [previewImage, setPreviewImage] = useState(null);

  // Sync active user with context
  useEffect(() => {
    if (selectedChatUser) {
      setActiveUser(selectedChatUser);
    }
  }, [selectedChatUser]);

  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, msg: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, msg) => {
    if (msg.senderId !== 'admin') return;
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, msg });
  };

  const fetchCustomerInfo = async (custId) => {
    if (!custId || customersMap[custId]?.fetched) return;
    try {
      const userRes = await axios.post(`${backendUrl}/api/user/profile`, { userId: custId }, { headers: { token } });
      if (userRes.data.success && userRes.data.user) {
        setCustomersMap(prev => ({
          ...prev,
          [custId]: {
            ...userRes.data.user,
            fetched: true
          }
        }));
      }
    } catch (err) {
      const order = ordersList?.find(o => o.userId === custId);
      if (order && order.address) {
        setCustomersMap(prev => ({
          ...prev,
          [custId]: {
            _id: custId,
            name: `${order.address.firstName} ${order.address.lastName}`,
            email: order.address.email || 'customer@zafran.com',
            phone: order.address.phone || '',
            address: `${order.address.street || ''}, ${order.address.city || ''}`,
            profilePic: '',
            fetched: true
          }
        }));
      }
    }
  };

  const getCustomerObj = (custId) => {
    if (customersMap[custId]) return customersMap[custId];
    if (ordersList && ordersList.length > 0) {
      const order = ordersList.find(o => o.userId === custId);
      if (order && order.address) {
        return {
          _id: custId,
          name: `${order.address.firstName} ${order.address.lastName}`,
          email: order.address.email || '',
          phone: order.address.phone || '',
          address: `${order.address.street || ''}, ${order.address.city || ''}`,
          profilePic: ''
        };
      }
    }
    return {
      _id: custId,
      name: 'Customer ' + (custId ? custId.substring(0, 6) : ''),
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
    <div className="flex flex-col sm:flex-row h-[calc(100vh-200px)] min-h-[520px] max-h-[820px] border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-xs">
      {/* Sidebar: Conversations (Messenger Style) */}
      <div className={`w-full sm:w-80 border-r border-gray-200 bg-gray-50/50 flex-col shrink-0 ${activeUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-gray-900">Live Chats</h2>
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{conversations.length}</span>
          </div>
          <button 
            onClick={fetchConversations}
            className="text-xs text-gray-500 hover:text-black font-semibold cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-xs font-semibold text-gray-500">No conversations yet</p>
              <p className="text-[11px] text-gray-400 mt-1">Customer chats will appear here in real-time.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const custId = conv.participants.find(p => p !== 'admin');
              const cust = getCustomerObj(custId);
              const isActive = activeUser === custId;
              
              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveUser(custId)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer hover:bg-gray-100/80 transition ${isActive ? 'bg-sky-50/70 border-l-4 border-sky-400 font-medium' : ''}`}
                >
                  <div className="relative shrink-0">
                    {cust.profilePic ? (
                      <img src={cust.profilePic} alt={cust.name} className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 truncate">{cust.name}</p>
                      {conv.updatedAt && (
                        <span className="text-[10px] text-gray-400">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'Sent an attachment'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area (Messenger Style) */}
      <div className={`flex-1 min-w-0 h-full min-h-0 flex flex-col bg-white relative overflow-hidden ${activeUser ? 'flex' : 'hidden sm:flex'}`}>
        {activeUser && activeCustomer ? (
          <>
            {/* Header */}
            <div className="p-3.5 px-5 border-b border-gray-200 bg-white shadow-xs flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setActiveUser(null); if (setSelectedChatUser) setSelectedChatUser(null); }} 
                  className="sm:hidden text-gray-500 hover:text-black mr-1 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <div className="relative">
                  {activeCustomer.profilePic ? (
                    <img src={activeCustomer.profilePic} alt={activeCustomer.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                      {activeCustomer.name ? activeCustomer.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900 truncate max-w-[200px] sm:max-w-xs">{activeCustomer.name}</h3>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active Now {activeCustomer.email ? `• ${activeCustomer.email}` : ''}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="View User Profile (Read Only)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 text-sky-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="hidden xs:inline">View Profile</span>
                  <span className="xs:hidden">Profile</span>
                </button>

                <button 
                  onClick={() => {
                    const conv = conversations.find(c => c.participants.includes(activeUser));
                    if (conv) handleDeleteConversation(conv._id);
                  }} 
                  className="text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Delete Entire Conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
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
                      className={`flex items-end gap-2 max-w-[80%] ${isAdmin ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden mb-0.5">
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
                        className={`rounded-2xl p-3 text-sm shadow-xs relative ${
                          isAdmin 
                            ? 'bg-black text-white rounded-br-xs cursor-context-menu' 
                            : 'bg-white text-gray-900 border border-gray-100 rounded-bl-xs'
                        }`}
                      >
                        {msg.messageType === 'image' && msg.fileUrl && (
                          <div 
                            onClick={() => setPreviewImage(msg.fileUrl)}
                            className="relative group cursor-pointer overflow-hidden rounded-xl mb-2 max-w-full block"
                            title="Click to zoom in full panel"
                          >
                            <img 
                              src={msg.fileUrl} 
                              alt="attachment" 
                              className="rounded-xl max-w-full max-h-60 object-cover group-hover:scale-105 transition duration-200" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-[2px] rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                              </svg>
                              <span>Click to Zoom</span>
                            </div>
                          </div>
                        )}
                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                        
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
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
              <label className="cursor-pointer text-gray-500 hover:text-black p-2 rounded-xl hover:bg-gray-100 transition shrink-0" title="Attach Image">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              
              <input 
                type="text" 
                placeholder={editingMessage ? "Editing message..." : "Type reply as Zafran Admin..."} 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none border border-transparent focus:border-gray-300 transition"
              />

              {editingMessage && (
                <button 
                  type="button" 
                  onClick={() => { setEditingMessage(null); setInputText(''); }}
                  className="text-xs text-gray-500 hover:text-black font-semibold px-2"
                >
                  Cancel
                </button>
              )}

              <button 
                type="submit" 
                className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
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
