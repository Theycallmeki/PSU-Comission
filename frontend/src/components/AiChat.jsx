import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { aiApi } from '../api/api';
import '../styles/AiChat.css';

const AiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am Mark AI, your GEMS Assistant. Ask me anything about the school data, enrollment trends, or classroom allocations.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Don't show on auth page
  if (location.pathname === '/auth') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await aiApi.chat(userMessage);
      
      if (data && data.response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error processing your request." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Connection error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="ai-chat-header">
              <Sparkles size={20} />
              <h3>Mark AI Assistant</h3>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ai-chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message message--${msg.role}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ))}
              {isLoading && (
                <div className="message message--ai">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="ai-chat-input-area" onSubmit={handleSend}>
              <input
                type="text"
                className="ai-chat-input"
                placeholder="Ask me about the data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="ai-chat-send" disabled={isLoading}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="ai-chat-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>
    </div>
  );
};

export default AiChat;
