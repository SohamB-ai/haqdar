import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const ChatBot = ({ authEnabled, getToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! I am HaqDaar AI. How can I help you today with government schemes?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
      const token = getToken ? await getToken() : 'dev-token';
      const response = await axios.post(`${apiUrl}/chat`, {
        messages: [...messages, userMessage]
      }, {
        headers: { Authorization: `Bearer ${token || 'dev-token'}` }
      });
      
      const aiMessage = { role: 'assistant', content: response.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I am sorry, I am having trouble connecting to my brain right now. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={styles.fab}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={styles.window}
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerInfo}>
                <div style={styles.botIcon}>
                  <Bot size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={styles.title}>HaqDaar AI</h3>
                  <p style={styles.subtitle}>Online | Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} style={styles.messagesArea}>
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={styles.msgAvatar}>
                      <Bot size={14} />
                    </div>
                  )}
                  <div style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.userMessage : styles.botMessage)
                  }}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{...styles.msgAvatar, backgroundColor: 'rgba(34, 211, 238, 0.2)'}}>
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div style={styles.messageWrapper}>
                  <div style={styles.msgAvatar}>
                    <Bot size={14} />
                  </div>
                  <div style={{...styles.message, ...styles.botMessage}}>
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={styles.inputArea}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                style={styles.input}
              />
              <button type="submit" disabled={!input.trim() || isLoading} style={styles.sendBtn}>
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 1000,
  },
  fab: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(34, 211, 238, 0.4)',
    outline: 'none',
  },
  window: {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    width: '380px',
    height: '500px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  },
  header: {
    padding: '1.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  botIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  messageWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  msgAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#22d3ee',
  },
  message: {
    maxWidth: '80%',
    padding: '0.75rem 1rem',
    borderRadius: '16px',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  botMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#e2e8f0',
    borderBottomLeftRadius: '4px',
  },
  userMessage: {
    backgroundColor: '#0891b2',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  inputArea: {
    padding: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    color: '#fff',
    outline: 'none',
    fontSize: '0.9rem',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#22d3ee',
    border: 'none',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default ChatBot;
