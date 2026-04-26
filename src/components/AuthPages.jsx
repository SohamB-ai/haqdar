import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Home } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';

const FloatingPaths = ({ position }) => {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(34, 211, 238, ${0.05 + i * 0.01})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <svg
        style={{ width: '100%', height: '100%' }}
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="var(--accent-primary)"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const AuthPages = ({ type, onSwitch, onFinish, authEnabled, onSkip }) => {
  const isSignIn = type === 'signin';

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.backgroundContainer}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={styles.cardContainer}
      >
        {/* Left Pane - Visuals */}
        <div style={styles.leftPane}>
          <div style={styles.bgDecoration1}></div>
          <div style={styles.bgDecoration2}></div>
          
          <h1 style={styles.leftText}>
            Access your welfare benefits seamlessly across India.
          </h1>
        </div>

        {/* Right Pane - Form */}
        <div style={styles.rightPane}>
          <div style={styles.headerArea}>
            <div style={styles.topNav}>
               <div style={styles.homeBtn} onClick={() => onSwitch('landing')}>
                 <Home size={18} /> Home
               </div>
            </div>
          </div>

          <div style={styles.clerkWrapper}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              {authEnabled ? (
                isSignIn ? (
                  <SignIn 
                    appearance={{ baseTheme: dark }} 
                    routing="hash"
                  />
                ) : (
                  <SignUp 
                    appearance={{ baseTheme: dark }} 
                    routing="hash"
                  />
                )
              ) : (
                <div style={styles.fallbackCard}>
                  <h2 style={styles.fallbackTitle}>Clerk is not configured yet</h2>
                  <p style={styles.fallbackText}>
                    You can still continue in guest mode and test the welfare discovery flow locally.
                  </p>
                  <button className="gold-button" onClick={() => onSwitch('input')}>
                    Continue Without Sign In
                  </button>
                </div>
              )}

              {authEnabled && onSkip && (
                <div style={styles.skipSection}>
                  <div style={styles.divider}>
                    <span style={styles.dividerLine}></span>
                    <span style={styles.dividerText}>or</span>
                    <span style={styles.dividerLine}></span>
                  </div>
                  <button 
                    style={styles.skipBtn}
                    onClick={onSkip}
                    onMouseOver={(e) => e.target.style.color = '#38BDF8'}
                    onMouseOut={(e) => e.target.style.color = '#94A3B8'}
                  >
                    Continue as Guest
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  cardContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1000px',
    minHeight: '600px',
    backgroundColor: '#0F172A',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    zIndex: 1,
    flexWrap: 'wrap',
  },
  leftPane: {
    flex: '1.2',
    minWidth: '300px',
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  },
  bgDecoration1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '60%',
    height: '60%',
    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '60%',
    height: '60%',
    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  leftText: {
    color: '#F8FAFC',
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
    zIndex: 2,
    letterSpacing: '-0.02em',
  },
  rightPane: {
    flex: '1',
    minWidth: '350px',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#0F172A',
    zIndex: 10,
    overflowY: 'auto',
  },
  clerkWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: '1rem 0',
  },
  topNav: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '2rem',
  },
  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
  },
  headerArea: {
    marginBottom: '2.5rem',
  },
  fallbackCard: {
    maxWidth: '340px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    color: '#E2E8F0',
  },
  fallbackTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
  },
  fallbackText: {
    color: '#94A3B8',
    lineHeight: '1.7',
  },
  skipSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px',
    gap: '1rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#475569',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
  },
};

export default AuthPages;
