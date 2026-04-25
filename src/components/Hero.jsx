import React from 'react';
import { motion } from 'framer-motion';
import IndiaMap from './IndiaMap';
import CanvasCursor from './CanvasCursor';

const Hero = ({ onGetStarted }) => {
  return (
    <section style={styles.hero}>
      {/* Decorative Splashes */}
      <div style={styles.splash1}></div>
      <div style={styles.splash2}></div>
      <div style={styles.splash3}></div>

      <div style={styles.left}>
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={styles.headline}
        >
          Access Your Welfare <br />
          <span style={{
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Benefits Anywhere</span> in India
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={styles.subtext}
        >
          Discover, transfer, and claim government schemes seamlessly across states.
          A unified platform for the modern Indian citizen.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="gold-button"
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem', width: 'fit-content' }}
          onClick={onGetStarted}
        >
          Get Started
        </motion.button>
      </div>

      <div style={styles.right}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={styles.mapWrapper}
        >
          <IndiaMap />
        </motion.div>
      </div>
      <CanvasCursor />
    </section>
  );
};

const styles = {
  hero: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8rem',
    gap: '4rem',
    marginTop: '2rem',
  },
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  headline: {
    fontSize: '3.5rem',
    lineHeight: '1.2',
    marginBottom: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  subtext: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    marginBottom: '3rem',
    maxWidth: '450px',
    lineHeight: '1.8',
    letterSpacing: '0.01em',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 10,
  },
  splash1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: '400px',
    height: '400px',
    background: 'var(--accent-secondary)', // Deep Blue
    filter: 'blur(120px)',
    opacity: 0.4,
    borderRadius: '50%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  splash2: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    width: '500px',
    height: '500px',
    background: 'var(--accent-primary)', // Cyan
    filter: 'blur(140px)',
    opacity: 0.3,
    borderRadius: '50%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  splash3: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: '300px',
    height: '300px',
    background: 'var(--accent-secondary)', // Deep Blue
    filter: 'blur(100px)',
    opacity: 0.35,
    borderRadius: '50%',
    zIndex: 1,
    pointerEvents: 'none',
  },
};

export default Hero;
