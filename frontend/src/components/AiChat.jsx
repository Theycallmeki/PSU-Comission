import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, X, Bot, User, Sparkles, Reply } from 'lucide-react';
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Don't show on auth page
  if (location.pathname === '/auth') return null;

  const handleReply = (content) => {
    // Take a snippet of the AI's message
    const snippet = content.substring(0, 80).replace(/\n/g, ' ') + (content.length > 80 ? '...' : '');
    setReplyingTo(snippet);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Construct the final message with the quote if replying
    let finalMessage = userMessage;
    if (replyingTo) {
      finalMessage = `> **Replying to Mark AI:**\n> *"${replyingTo}"*\n\n${userMessage}`;
    }
    setReplyingTo(null);
    
    // Grab history before adding the new message, exclude the very first default greeting
    const historyToSend = messages.slice(1);
    
    setMessages(prev => [...prev, { role: 'user', content: finalMessage }]);
    setIsLoading(true);

    try {
      const data = await aiApi.chat(finalMessage, historyToSend);
      
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
                  {msg.role === 'ai' && (
                    <button 
                      className="message-reply-btn" 
                      onClick={() => handleReply(msg.content)}
                      title="Reply"
                    >
                      <Reply size={14} /> Reply
                    </button>
                  )}
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

            <div className="ai-chat-input-wrapper">
              {replyingTo && (
                <div className="reply-indicator">
                  <div className="reply-indicator-content">
                    <strong>Replying to Mark AI</strong>
                    <p>{replyingTo}</p>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="cancel-reply-btn">
                    <X size={14} />
                  </button>
                </div>
              )}
              <form className="ai-chat-input-area" onSubmit={handleSend}>
                <input
                  ref={inputRef}
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
            </div>
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
