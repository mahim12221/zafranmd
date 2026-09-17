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
        }
        fetchConversations(); // refresh sidebar
      });

      return () => newSocket.close();
    }
  }, [token, activeUser]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/chat/conversations/admin`, { headers: { token } });
      if (res.data.success) {
        setConversations(res.data.conversations);
        // Also try to fetch customer names for these IDs
        res.data.conversations.forEach(conv => {
           const custId = conv.participants.find(p => p !== 'admin');
           if (custId && !customersMap[custId]) {
              axios.post(`${backendUrl}/api/user/profile`, { userId: custId }, { headers: { token } })
                .then(userRes => {
                   if (userRes.data.success) {
                      setCustomersMap(prev => ({...prev, [custId]: userRes.data.user.name || userRes.data.user.email }));
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
    if (activeUser) {
      axios.get(`${backendUrl}/api/chat/messages/admin/${activeUser}`, { headers: { token } })
        .then(res => {
          if (res.data.success) {
            setMessages(res.data.messages);
          }
        }).catch(err => console.log(err));
    }
  }, [activeUser, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;

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

  return (
    <div className="flex flex-col sm:flex-row h-[80vh] border border-gray-200 rounded-lg bg-white overflow-hidden mt-4">
      {/* Sidebar: Conversations */}
      <div className="w-full sm:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="font-bold text-lg">Customer Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-10">No messages yet.</p>
          ) : (
            conversations.map(conv => {
              const custId = conv.participants.find(p => p !== 'admin');
              const isActive = activeUser === custId;
              const name = customersMap[custId] || 'Customer ' + custId.substring(0,6);
              
              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveUser(custId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition ${isActive ? 'bg-gray-200' : ''}`}
                >
                  <p className="font-semibold text-gray-800 text-sm">{name}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeUser ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
              <h3 className="font-bold">Chat with {customersMap[activeUser] || activeUser.substring(0,8)}</h3>
              <button onClick={() => setActiveUser(null)} className="sm:hidden text-gray-500 hover:text-black">Close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
              {messages.map((msg, index) => (
                <div key={index} className={`max-w-[70%] rounded-xl p-3 text-sm ${msg.senderId === 'admin' ? 'bg-black text-white self-end rounded-br-none' : 'bg-gray-200 text-black self-start rounded-bl-none'}`}>
                  {msg.messageType === 'image' && msg.fileUrl ? (
                    <img src={msg.fileUrl} alt="attachment" className="rounded-md mb-2 max-w-full" />
                  ) : null}
                  {msg.text && <p>{msg.text}</p>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2 items-center">
              <label className="cursor-pointer text-gray-500 hover:text-black transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <input 
                type="text" 
                placeholder="Type your reply..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm outline-none border border-transparent focus:border-gray-300 transition"
              />
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a customer from the sidebar to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
