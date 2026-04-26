import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_CHATBOT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyATDllV01sGhgGifSQKNPM0Hiq1DV8ZQdI';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const suggestedQuestions = [
  'Which state is better for me?',
  'Compare health schemes',
  'What benefits do I lose by migrating?',
];

const AIChatbot = ({ userData, schemes, selectedCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hey! 👋 I'm your HaqDaar AI assistant. I can help you compare welfare schemes between **${userData?.homeState || 'your home state'}** and **${userData?.currentState || 'your current state'}**, and tell you which offers better benefits for your profile.\n\nAsk me anything!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pulseHint, setPulseHint] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Hide pulse hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPulseHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const buildSystemPrompt = useCallback(() => {
    const homeSchemes = schemes
      .filter((r) => r.current)
      .map((r) => `- ${r.current.name} [${r.current.tag}]: ${r.current.desc}`)
      .join('\n');

    const migratedSchemes = schemes
      .filter((r) => r.migrated)
      .map((r) => `- ${r.migrated.name} [${r.migrated.tag}]: ${r.migrated.desc}`)
      .join('\n');

    return `You are HaqDaar AI — a warm, knowledgeable assistant for Indian migrant workers navigating government welfare schemes.

USER PROFILE:
- Home State: ${userData?.homeState || 'Not specified'}
- Current State: ${userData?.currentState || 'Not specified'}
- Occupation: ${userData?.occupation || 'Not specified'}
- Gender: ${userData?.gender || 'Not specified'}
- Age: ${userData?.age || 'Not specified'}
- Income: ${userData?.income || 'Not specified'}
- Social Category: ${userData?.category || 'Not specified'}

CURRENT DASHBOARD CONTEXT:
- Selected Filter Category: ${selectedCategory || 'All'}
- Number of visible schemes: ${schemes.length}

HOME STATE SCHEMES (${userData?.homeState || 'Home'}):
${homeSchemes || 'No schemes loaded yet.'}

CURRENT/MIGRATED STATE SCHEMES (${userData?.currentState || 'Current'}):
${migratedSchemes || 'No schemes loaded yet.'}

INSTRUCTIONS:
- You now have access to the exact schemes the user is currently viewing on their dashboard.
- Compare schemes between home and current state when asked.
- Clearly state which state offers BETTER welfare benefits for the user's profile.
- Use simple language — the user may be a daily wage worker with limited education.
- Use bullet points and emojis to make responses easy to scan.
- Be empathetic and encouraging.
- Keep responses concise (under 250 words).
- If the user asks about a specific scheme, provide details from the data above.
- If asked "which state is better", weigh the number, quality, and relevance of schemes.`;
  }, [schemes, userData, selectedCategory]);

  const sendMessage = useCallback(async (overrideText) => {
    const trimmed = (overrideText || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for Gemini
      const conversationParts = messages
        .concat(userMsg)
        .map((m) => ({
          role: m.role === 'bot' ? 'model' : 'user',
          parts: [{ text: m.text }],
        }));

      // Prepend system context as a user+model pair
      const systemContext = buildSystemPrompt();
      const contents = [
        { role: 'user', parts: [{ text: systemContext }] },
        { role: 'model', parts: [{ text: 'Understood! I am HaqDaar AI, ready to help compare welfare schemes and guide the user. How can I help?' }] },
        ...conversationParts,
      ];

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, I could not process that. Please try again.';

      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Oops! Something went wrong. Please try again in a moment.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, buildSystemPrompt]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Simple markdown-like bold rendering
  const renderText = useCallback((text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#40E0D0' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }, []);



  return (
    <>
      {/* ── Floating Chat Button ───────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIsOpen(true); setPulseHint(false); }}
            style={styles.fab}
            id="ai-chatbot-fab"
          >
            <div style={styles.fabInner}>
              <Sparkles size={26} />
            </div>

            {/* Pulse ring */}
            {pulseHint && (
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={styles.pulseRing}
              />
            )}

            {/* Tooltip */}
            {pulseHint && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.tooltip}
              >
                Ask AI to compare states ✨
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={styles.chatWindow}
            id="ai-chatbot-window"
          >
            {/* Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                <div style={styles.botAvatar}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={styles.chatTitle}>HaqDaar AI</div>
                  <div style={styles.chatSubtitle}>
                    <span style={styles.onlineDot} />
                    Powered by Gemini
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    ...styles.messageBubble,
                    ...(msg.role === 'user' ? styles.userBubble : styles.botBubble),
                  }}
                >
                  {msg.role === 'bot' && (
                    <div style={styles.msgAvatar}>
                      <Bot size={14} />
                    </div>
                  )}
                  <div style={styles.msgContent}>
                    <div style={styles.msgText}>
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {renderText(line)}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div style={styles.userMsgAvatar}>
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ ...styles.messageBubble, ...styles.botBubble }}
                >
                  <div style={styles.msgAvatar}>
                    <Bot size={14} />
                  </div>
                  <div style={styles.typingIndicator}>
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      style={styles.typingDot}
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      style={styles.typingDot}
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      style={styles.typingDot}
                    />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (show only if few messages) */}
            {messages.length <= 2 && (
              <div style={styles.suggestionsRow}>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={styles.suggestionChip}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div style={styles.inputArea}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about schemes, compare states..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={styles.chatInput}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  ...styles.sendBtn,
                  opacity: isLoading || !input.trim() ? 0.4 : 1,
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  /* ── FAB Button ──────────────────────────────────── */
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 9999,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  fabInner: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0F766E, #14B8A6, #2DD4BF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: '0 4px 25px rgba(20, 184, 166, 0.5), 0 0 40px rgba(20, 184, 166, 0.2)',
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '2px solid rgba(20, 184, 166, 0.6)',
    pointerEvents: 'none',
  },
  tooltip: {
    position: 'absolute',
    right: '75px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(20, 184, 166, 0.3)',
    color: '#E2E8F0',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
  },

  /* ── Chat Window ─────────────────────────────────── */
  chatWindow: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '420px',
    height: '600px',
    borderRadius: '20px',
    background: 'linear-gradient(180deg, #0B1120 0%, #0F172A 100%)',
    border: '1px solid rgba(20, 184, 166, 0.25)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(20, 184, 166, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999,
  },

  /* ── Header ──────────────────────────────────────── */
  chatHeader: {
    padding: '1rem 1.2rem',
    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(15, 23, 42, 0.95))',
    borderBottom: '1px solid rgba(20, 184, 166, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
  },
  botAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  chatTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#F1F5F9',
    letterSpacing: '0.03em',
  },
  chatSubtitle: {
    fontSize: '0.7rem',
    color: '#64748B',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10B981',
    display: 'inline-block',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#94A3B8',
    padding: '0.4rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  /* ── Messages ────────────────────────────────────── */
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(20, 184, 166, 0.3) transparent',
  },
  messageBubble: {
    display: 'flex',
    gap: '0.6rem',
    maxWidth: '92%',
    alignItems: 'flex-start',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(20, 184, 166, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#14B8A6',
    flexShrink: 0,
    marginTop: '2px',
  },
  userMsgAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818CF8',
    flexShrink: 0,
    marginTop: '2px',
  },
  msgContent: {
    flex: 1,
  },
  msgText: {
    padding: '0.7rem 1rem',
    borderRadius: '14px',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    color: '#E2E8F0',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },

  /* ── Typing Indicator ────────────────────────────── */
  typingIndicator: {
    display: 'flex',
    gap: '4px',
    padding: '0.8rem 1rem',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  typingDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#14B8A6',
    display: 'inline-block',
  },

  /* ── Suggestions ─────────────────────────────────── */
  suggestionsRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0 1rem 0.5rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    borderRadius: '20px',
    border: '1px solid rgba(20, 184, 166, 0.25)',
    background: 'rgba(20, 184, 166, 0.08)',
    color: '#5EEAD4',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    fontWeight: '500',
  },

  /* ── Input Area ──────────────────────────────────── */
  inputArea: {
    padding: '0.8rem 1rem',
    borderTop: '1px solid rgba(20, 184, 166, 0.1)',
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.6)',
  },
  chatInput: {
    flex: 1,
    padding: '0.7rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(20, 184, 166, 0.15)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#E2E8F0',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
};

export default memo(AIChatbot);
