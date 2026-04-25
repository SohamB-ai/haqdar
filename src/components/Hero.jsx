import React from 'react';
import { motion } from 'framer-motion';
import IndiaMap from './IndiaMap';

const Hero = ({ onGetStarted }) => {
  return (
    <section style={styles.hero}>
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
  },
  headline: {
    fontSize: '3rem',
    lineHeight: '1.2',
    marginBottom: '2rem',
    fontWeight: '700',
  },
  subtext: {
    fontSize: '1rem',
    color: '#A1A1AA',
    marginBottom: '3rem',
    maxWidth: '450px',
    lineHeight: '1.8',
    letterSpacing: '0.05em',
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
  },
};

export default Hero;
