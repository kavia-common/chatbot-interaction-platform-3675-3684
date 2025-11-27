import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

// Simple utility to format HH:MM
const timeNow = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Normalize helper
const normalize = (s) => s.trim().toLowerCase();

// PUBLIC_INTERFACE
export function matchIntent(text) {
  /**
   * PUBLIC_INTERFACE
   * Determine a simple intent keyword based on the user's message.
   * Returns a string key for the intent.
   */
  const t = normalize(text);

  // Clear chat commands
  if (/(^|\s)(clear|reset|wipe)\s+(chat|history|conversation)s?($|\s)/i.test(text)) return 'clear';

  // Help / usage
  if (/(^|\s)(help|usage|guide)(\s|$)/i.test(t) || /(how (to|do) (i|you)|what can (you|u) do)/i.test(t)) return 'help';

  // Features
  if (/(features?|capabilit(y|ies)|what.*offer|what.*can.*do)/i.test(t)) return 'features';

  // About
  if (/(^|\s)(about)(\s|$)/i.test(t) || /(who.*(are|r) you|what.*(is|are) this|tell me about)/i.test(t)) return 'about';

  // Theme info
  if (/(theme|colors?|colour|palette|style|ocean (professional)?)/i.test(t)) return 'theme';

  // Small talk: how are you
  if (/(how are you|how’s it going|hows it going|how r u|how do you do)/i.test(t)) return 'how_are_you';

  // Small talk: who are you
  if (/(who.*are you|your name|what are you)/i.test(t)) return 'who_are_you';

  // Greetings
  if (/(\bhi\b|\bhello\b|\bhey\b|\bgood (morning|afternoon|evening)\b)/i.test(t)) return 'greeting';

  // Thanks
  if (/(thanks|thank you|ty|thx)/i.test(t)) return 'thanks';

  // Fallback
  return 'fallback';
}

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

  const botReplyForIntent = (intent) => {
    switch (intent) {
      case 'greeting':
        return `Hello! 👋 Great to see you here at ${appName}. How can I assist you today?`;
      case 'help':
        return "Here to help! 💡 Try:\n• 'features' to see what I can do\n• 'about' to learn about this app\n• 'theme' to view colors/style\n• 'clear chat' to reset history";
      case 'features':
        return "I can help with:\n• Quick tips and usage help\n• About this app and theme info\n• Small talk and friendly guidance\n• Clearing chat history\nAll right here in the chat ✨";
      case 'about':
        return `This is a modern React chatbot demo with the Ocean Professional theme. It uses a floating button, modal chat, and Tailwind styling—no external services needed. 🌊`;
      case 'theme':
        return "Ocean Professional 🌊\n• Primary: #2563EB (blue)\n• Secondary: #F59E0B (amber)\n• Surface: #ffffff • Text: #111827\nClean, modern UI with soft shadows and smooth gradients.";
      case 'how_are_you':
        return "I'm feeling waves of positivity today 🌊😄 How can I help you?";
      case 'who_are_you':
        return "I’m your Ocean Assistant—your friendly in-app guide for quick info, tips, and theme details. 🤝";
      case 'thanks':
        return "You're welcome! 😊 Anything else I can help with?";
      case 'clear':
        // Clearing handled outside switch; provide confirmation text
        return "Chat history cleared! 🧹 Start fresh—how can I help?";
      case 'fallback':
      default:
        return "I didn’t fully catch that. Try 'help', 'features', 'about', 'theme', or say 'clear chat'. 😊";
    }
  };

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
      const intent = matchIntent(trimmed);

      // Clear chat handling: reset but keep a confirmation message
      if (intent === 'clear') {
        const confirmMsg = { id: `b_${Date.now()}`, sender: 'bot', text: botReplyForIntent('clear'), time: timeNow() };
        setMessages([confirmMsg]); // start fresh with confirmation
        setTyping(false);
        return;
      }

      const botMsg = { id: `b_${Date.now()}`, sender: 'bot', text: botReplyForIntent(intent), time: timeNow() };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 550);
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Fixed bottom-right wrapper with viewport-constrained width */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] left-4 sm:left-auto">
        <div
          ref={modalRef}
          className="w-full max-w-[min(100vw-1rem,380px)] sm:max-w-[min(100vw-1rem,380px)] rounded-xl shadow-lg bg-surface ring-1 ring-black/5 overflow-hidden
                     max-h-[min(100vh-2rem,600px)] h-[min(80vh,600px)]"
        >
          {/* Panel uses flex column to allow messages to grow and input to stick to bottom */}
          <div className="flex h-full flex-col overscroll-contain">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-4 py-3 bg-ocean-gradient sticky top-0 z-10">
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

            {/* Messages area: grow + scrollable, safe bottom padding to avoid input overlap */}
            <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto scrollbar-thin bg-surface overscroll-contain pb-20 sm:pb-24">
              {messages.map((m, idx) => (
                <MessageBubble key={m.id} msg={m} refProp={idx === messages.length - 1 ? lastMsgRef : null} />
              ))}
              {typing && <TypingIndicator />}
              {/* Safe-area spacer */}
              <div className="h-[max(0px,env(safe-area-inset-bottom))]" />
            </div>

            {/* Input area: sticks to bottom, safe-area padding */}
            <div className="shrink-0 border-t border-black/5 bg-surface px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sticky bottom-0">
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
    </div>
  );
}

function MessageBubble({ msg, refProp }) {
  const isUser = msg.sender === 'user';
  return (
    <div ref={refProp} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-soft break-words [overflow-wrap:anywhere] ${isUser ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-textcolor rounded-bl-sm'}`}>
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.text}</p>
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
