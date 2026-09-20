import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AiChatView = ({ userId, backendUrl, onBack, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const chatBottomRef = useRef(null);

  const starterSuggestions = [
    "🔥 What are your most popular EDC fidgets?",
    "📦 Delivery charges & delivery timeline?",
    "🎧 Recommend the best Bluetooth earbuds",
    "🛡️ What is your return & replacement policy?"
  ];

  const scrollToBottom = (smooth = true) => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadHistory = async () => {
      try {
        setFetchingHistory(true);
        const res = await axios.get(`${backendUrl}/api/chat/ai/history/${userId}`);
        if (isMounted && res.data && res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Error loading AI chat history:", err);
      } finally {
        if (isMounted) setFetchingHistory(false);
      }
    };

    loadHistory();
    return () => { isMounted = false; };
  }, [userId, backendUrl]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading || !userId) return;

    setInputText('');
    const tempUserMsg = {
      _id: 'temp_' + Date.now(),
      role: 'user',
      text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/api/chat/ai/message`, {
        userId,
        text
      });

      if (res.data && res.data.success) {
        const replyText = res.data.reply;
        const aiMsg = res.data.message || {
          _id: 'temp_ai_' + Date.now(),
          role: 'model',
          text: replyText,
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            _id: 'err_' + Date.now(),
            role: 'model',
            text: "Sorry, something went wrong. Please try asking again.",
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error("AI send error:", err);
      setMessages(prev => [
        ...prev,
        {
          _id: 'err_' + Date.now(),
          role: 'model',
          text: "Unable to connect. Please check your internet connection and try again.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Start a new conversation?")) {
      try {
        await axios.post(`${backendUrl}/api/chat/ai/clear`, { userId });
        setMessages([]);
      } catch (err) {
        console.error("Failed to clear chat:", err);
      }
    }
  };

  // Helper to format markdown (bold, bullet points, numbered lists) cleanly
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    const paragraphs = rawText.split('\n');
    return paragraphs.map((line, pIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={pIdx} className="h-1.5" />;
      }

      // Check for horizontal rule
      if (/^---+$/.test(trimmed)) {
        return <hr key={pIdx} className="my-2 border-zinc-200" />;
      }

      // Check if line is bullet item or numbered item
      const bulletMatch = trimmed.match(/^([-*•]|\d+[\.\)]|[০-৯]+[\.\)])\s+(.*)/);
      const isListItem = Boolean(bulletMatch);
      const listMarker = bulletMatch ? bulletMatch[1] : null;
      const content = bulletMatch ? bulletMatch[2] : line;

      // Parse bold **text**
      const parts = content.split(/(\*\*[^*]+\*\*)/g);

      const parsedNodes = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-zinc-950">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isListItem) {
        const isNumeric = /^\d+[\.\)]|[০-৯]+[\.\)]/.test(listMarker);
        return (
          <div key={pIdx} className="flex items-start gap-2 my-1 text-xs sm:text-[13px] leading-relaxed">
            <span className={`font-semibold flex-shrink-0 ${isNumeric ? 'text-zinc-700 min-w-[16px]' : 'text-orange-500 font-bold mt-0.5'}`}>
              {isNumeric ? listMarker : '•'}
            </span>
            <div className="flex-1 min-w-0">{parsedNodes}</div>
          </div>
        );
      }

      return (
        <p key={pIdx} className="my-1 text-xs sm:text-[13px] leading-relaxed break-words">
          {parsedNodes}
        </p>
      );
    });
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-2xl w-[330px] sm:w-[380px] h-[520px] flex flex-col overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-zinc-950 text-white p-3.5 sm:p-4 flex justify-between items-center border-b border-zinc-800 shadow-sm relative">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0"
            title="Back to menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 border border-orange-500/50 flex items-center justify-center p-1.5 shadow-xs">
              <img src="/keriyo-emblem.svg" alt="Keriyo AI" className="w-full h-full object-contain select-none" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full"></span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">Keriyo AI</h3>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0">
                AI
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Smart Gadgets &amp; Gear Concierge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {messages.length > 0 && (
            <button 
              type="button"
              onClick={handleClearHistory}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Start new conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer text-lg leading-none"
            title="Close"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3 bg-zinc-50/80 overscroll-contain">
        {/* Welcome Card if first time or empty */}
        {messages.length === 0 && !fetchingHistory && (
          <div className="flex flex-col gap-3 animate-fadeIn my-auto">
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs font-bold">
                  ✨
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900">
                  Welcome to Keriyo AI!
                </h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Hi! I'm Keriyo AI, your intelligent gadgets and EDC fidget gear concierge. Ask me anything about our products, specs, recommendations, delivery, or warranty.
              </p>
            </div>

            {/* Quick suggested chips */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                Suggested Questions:
              </span>
              <div className="flex flex-col gap-1.5">
                {starterSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs bg-white hover:bg-orange-50/80 hover:border-orange-300 border border-zinc-200/80 text-zinc-700 font-medium px-3 py-2 rounded-xl transition duration-150 shadow-2xs active:scale-[0.99] cursor-pointer flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <span className="text-zinc-400 group-hover:text-orange-500 transition">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Messages */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg._id || idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-1.5 max-w-[86%]">
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-zinc-900 border border-orange-500/40 flex items-center justify-center p-1 flex-shrink-0 mt-1 shadow-xs">
                    <img src="/keriyo-emblem.svg" alt="Keriyo" className="w-full h-full object-contain select-none" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-2xl shadow-xs select-text ${
                    isUser 
                      ? 'bg-zinc-900 text-white rounded-br-xs' 
                      : 'bg-white text-zinc-800 border border-zinc-200/90 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-1.5 max-w-[86%]">
            <div className="w-6 h-6 rounded-full bg-zinc-900 border border-orange-500/40 flex items-center justify-center p-1 flex-shrink-0 mt-1 shadow-xs">
              <img src="/keriyo-emblem.svg" alt="Keriyo" className="w-full h-full object-contain select-none" />
            </div>
            <div className="bg-white border border-zinc-200/90 p-3 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5 text-zinc-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-medium text-zinc-500 ml-1">Keriyo AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Field Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="border-t border-zinc-200 p-2.5 sm:p-3 bg-white flex gap-2 items-center">
        <input 
          type="text" 
          placeholder="Ask anything about gadgets, fidget toys, or orders..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 bg-zinc-100/90 hover:bg-zinc-100 focus:bg-white border border-transparent focus:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none transition disabled:opacity-60 placeholder:text-zinc-400"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim() || loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-200 text-white disabled:text-zinc-400 p-2.5 rounded-xl transition active:scale-95 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          title="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default AiChatView;
