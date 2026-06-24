import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Loader2 as Loader } from '@shared/icons';
import { sendMessage, getChatHistory } from '../services/api';
import sidebarBadge from '../../../public/ChatGPT Image May 24, 2026, 11_00_50 AM.png';

interface Message {
  _id: string;
  role: 'user' | 'bot';
  message: string;
  createdAt: string;
}

const suggestions = [
  'How to start a test?',
  'Where can I see my results?',
  'How to enroll in a test series?',
  'What subscription plans are available?',
];

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !hasLoaded) {
      setLoading(true);
      getChatHistory()
        .then(setMessages)
        .catch(() => {})
        .finally(() => { setLoading(false); setHasLoaded(true); });
    }
  }, [open, hasLoaded]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = { _id: tempId, role: 'user', message: msg, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    try {
      const res = await sendMessage(msg);
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _id: res.userMessage._id } : m));
      setMessages(prev => [...prev, res.botMessage]);
    } catch {
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-16 sm:bottom-24 right-3 left-3 sm:left-auto z-50 flex w-auto sm:w-[380px] flex-col rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)] animate-slide-up origin-bottom-right"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#1a237e] via-[#283593] to-[#3273e6] px-5 py-4 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 p-0.5 shadow-lg shadow-black/20">
                <img src={sidebarBadge} alt="" className="h-full w-full rounded-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Doubt Solver</p>
                <p className="text-[11px] text-white/70">Powered by AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="relative rounded-full p-1.5 hover:bg-white/15 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 bg-gray-50/50" style={{ minHeight: 300, maxHeight: 420 }}>
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader size={20} className="animate-spin text-tb-blue" /></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tb-blue/10 to-blue-100">
                  <Sparkles className="h-7 w-7 text-tb-blue" />
                </div>
                <p className="text-sm font-semibold text-tb-navy">Hi! How can I help you?</p>
                <p className="mt-1 text-xs text-tb-gray-400 max-w-[260px]">Ask me anything about tests, results, study materials, or the platform.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-tb-blue shadow-sm ring-1 ring-tb-blue/20 transition-all hover:bg-tb-blue hover:text-white hover:ring-tb-blue"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[88%] gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-gradient-to-br from-tb-blue to-blue-600 text-white shadow-sm' : 'bg-white text-tb-gray-400 shadow-sm ring-1 ring-gray-200'}`}>
                      {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-tb-blue to-blue-600 text-white' : 'bg-white text-tb-navy ring-1 ring-gray-100'}`}>
                      {msg.message.split('\n').map((line, i) => (
                        <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="flex max-w-[88%] gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-tb-gray-400 shadow-sm ring-1 ring-gray-200">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-100">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-tb-gray-300" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-tb-gray-300" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-tb-gray-300" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-4 py-3 rounded-b-2xl">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your doubt..."
              className="flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-tb-blue/40 transition-all placeholder:text-gray-400"
              disabled={sending}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tb-blue to-blue-600 text-white shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
        {!open && (
          <div className="hidden sm:flex animate-fade-in items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-1 ring-gray-100">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-medium text-tb-navy whitespace-nowrap">Ask me anything</span>
          </div>
        )}
        <div className="relative">
          {!open && (
            <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-tb-blue/30 to-blue-400/30 animate-ping" />
          )}
          <button
            onClick={() => setOpen(!open)}
            className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3273e6] text-white shadow-[0_4px_20px_rgba(50,115,230,0.4)] transition-all hover:scale-110 hover:shadow-[0_6px_28px_rgba(50,115,230,0.5)] active:scale-95"
          >
            {open ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <>
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 absolute transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                  <span className="text-[7px] sm:text-[8px] font-bold text-white">AI</span>
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatbotWidget;
