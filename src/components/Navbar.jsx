import React from 'react';
import { Home, Info, Sparkles, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ onNavigate }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => onNavigate('home')}>
        Haq<span className="gold-text">Daar</span>
      </div>

      <div style={styles.centerIcons}>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22C55E' }}
          style={styles.iconWrapper}
          onClick={() => {
            if (window.location.pathname !== '/') onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={22} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22C55E' }}
          style={styles.iconWrapper}
          onClick={() => {
            const el = document.getElementById('problem');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Info size={22} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22C55E' }}
          style={styles.iconWrapper}
          onClick={() => {
            const el = document.getElementById('how-it-works');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Sparkles size={22} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22C55E' }}
          style={styles.iconWrapper}
          onClick={() => {
            const el = document.getElementById('tech-stack');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Cpu size={22} />
        </motion.div>
      </div>

      <div style={styles.authButtons}>
        <button style={styles.signIn} onClick={() => onNavigate('signin')}>Sign In</button>
        <button className="gold-button" style={styles.signUp} onClick={() => onNavigate('signup')}>Sign Up</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 4rem',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
    borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.2em',
    color: 'var(--accent-primary)',
  },
  centerIcons: {
    display: 'flex',
    gap: '4rem',
    color: '#A1A1AA',
  },
  iconWrapper: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  authButtons: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  signIn: {
    background: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: '500',
  },
  signUp: {
    padding: '0.6rem 1.5rem',
  },
};

export default Navbar;
