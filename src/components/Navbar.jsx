import React from 'react';
import { Home, Info, Sparkles, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ onNavigate, currentView, isDashboard }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => onNavigate('landing')}>
        Haq<span className="gold-text">Daar</span>
      </div>

      <div style={styles.centerIcons}>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22D3EE' }}
          style={styles.iconWrapper}
          onClick={() => {
            onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={22} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22D3EE' }}
          style={styles.iconWrapper}
          onClick={() => {
            if (currentView !== 'landing') {
              onNavigate('landing');
              setTimeout(() => {
                const el = document.getElementById('problem');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            } else {
              const el = document.getElementById('problem');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Info size={22} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22D3EE' }}
          style={styles.iconWrapper}
          onClick={() => {
            if (currentView !== 'landing') {
              onNavigate('landing');
              setTimeout(() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            } else {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Sparkles size={22} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, color: '#22D3EE' }}
          style={styles.iconWrapper}
          onClick={() => {
            if (currentView !== 'landing') {
              onNavigate('landing');
              setTimeout(() => {
                const el = document.getElementById('tech-stack');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            } else {
              const el = document.getElementById('tech-stack');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Cpu size={22} />
        </motion.div>
      </div>

      <div style={styles.authButtons}>
        {isDashboard ? (
          <div style={styles.profileCircle}>
            <span>S</span>
          </div>
        ) : (
          currentView !== 'signin' && currentView !== 'signup' && (
            <>
              <button style={styles.signIn} onClick={() => onNavigate('signin')}>Sign In</button>
              <button className="gold-button" style={styles.signUp} onClick={() => onNavigate('signup')}>Sign Up</button>
            </>
          )
        )}
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
    borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.05em',
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
  profileCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    border: '2px solid rgba(34, 211, 238, 0.3)',
  },
};

export default Navbar;
