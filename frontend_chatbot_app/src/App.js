import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

// Simple utility to format HH:MM
const timeNow = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// PUBLIC_INTERFACE
function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'm0', sender: 'bot', text: "Hi! I'm your Ocean Assistant. How can I help today?", time: timeNow() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const appName = useMemo(() => process.env.REACT_APP_FRONTEND_URL || 'this app', []);

  // Accessibility: close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // PUBLIC_INTERFACE
  const openModal = () => setIsOpen(true);
  // PUBLIC_INTERFACE
  const closeModal = () => setIsOpen(false);

  const inputRef = useRef(null);
  const lastMsgRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, typing]);

  // PUBLIC_INTERFACE
  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { id: `u_${Date.now()}`, sender: 'user', text: trimmed, time: timeNow() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    // Simulate bot typing
    setTyping(true);
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      const isGreeting = /(\\bhi\\b|\\bhello\\b|\\bhey\\b)/i.test(lower);
      const replyText = isGreeting
        ? `Hello! 👋 Great to see you here at ${appName}. How can I assist you today?`
        : "I’m here to help! Ask me anything, or say 'Hi' to get started.";
      const botMsg = { id: `b_${Date.now()}`, sender: 'bot', text: replyText, time: timeNow() };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 650);
  };

  return (
    <div className="min-h-screen bg-ocean-gradient">
      {/* Example header area to demonstrate theme (can be minimal) */}
      <header className="w-full py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-3xl p-8 bg-surface shadow-soft ring-1 ring-black/5">
            <h1 className="text-2xl font-semibold text-textcolor">Chatbot Demo</h1>
            <p className="text-sm text-textcolor/70 mt-2">
              Click the floating chat button to start a conversation.
            </p>
          </div>
        </div>
      </header>

      {/* Floating Chat Button */}
      <ChatButton onClick={openModal} />

      {isOpen && (
        <ChatModal
          messages={messages}
          typing={typing}
          input={input}
          onChangeInput={setInput}
          onSend={sendMessage}
          onClose={closeModal}
          inputRef={inputRef}
          lastMsgRef={lastMsgRef}
        />
      )}
    </div>
  );
}

function ChatButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <div className="rounded-full p-4 shadow-soft bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary to-blue-600 text-white hover:scale-105 transition-transform duration-200">
        <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h8M8 14h5m8-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-secondary animate-ping opacity-75" />
    </button>
  );
}

function ChatModal({ messages, typing, input, onChangeInput, onSend, onClose, inputRef, lastMsgRef }) {
  // Focus trap rudimentary: keep focus within modal using tab-index wrappers
  const modalRef = useRef(null);
  useEffect(() => {
    const focusable = modalRef.current?.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    const handler = (e) => {
      if (e.key !== 'Tab' || !focusable || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Chat dialog"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-6 md:max-w-md">
        <div ref={modalRef} className="mx-4 md:mx-0 rounded-2xl shadow-soft bg-surface ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ocean-gradient">
            <div>
              <h2 className="text-base font-semibold text-textcolor">Ocean Assistant</h2>
              <p className="text-xs text-textcolor/60">Ask me anything</p>
            </div>
            <button
              className="p-2 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={onClose}
              aria-label="Close chat"
            >
              <svg className="h-5 w-5 text-textcolor/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 8.586 3.757 2.343 2.343 3.757 8.586 10l-6.243 6.243 1.414 1.414L10 11.414l6.243 6.243 1.414-1.414L11.414 10l6.243-6.243-1.414-1.414L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-96 min-h-[18rem] overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin bg-surface">
            {messages.map((m, idx) => (
              <MessageBubble key={m.id} msg={m} refProp={idx === messages.length - 1 ? lastMsgRef : null} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          {/* Input */}
          <div className="border-t border-black/5 bg-surface px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                aria-label="Type your message"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => onChangeInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-textcolor placeholder:text-textcolor/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button
                onClick={onSend}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-soft hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                aria-label="Send message"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.4 20.4 22 12 3.4 3.6 3 10l12 2-12 2z" />
                </svg>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, refProp }) {
  const isUser = msg.sender === 'user';
  return (
    <div ref={refProp} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-soft ${isUser ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-textcolor rounded-bl-sm'}`}>
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <div className={`text-[10px] mt-1 ${isUser ? 'text-white/80' : 'text-textcolor/60'}`}>{msg.time}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-textcolor/60 text-xs">
      <span className="h-2 w-2 bg-textcolor/40 rounded-full animate-bounce [animation-delay:-200ms]"></span>
      <span className="h-2 w-2 bg-textcolor/40 rounded-full animate-bounce [animation-delay:-100ms]"></span>
      <span className="h-2 w-2 bg-textcolor/40 rounded-full animate-bounce"></span>
      <span className="sr-only">Assistant is typing</span>
    </div>
  );
}

export default App;
