import React from 'react';
import { Home, Info, Sparkles, Cpu, ClipboardList, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UserButton, SignInButton, SignUpButton } from '@clerk/react';

const Navbar = ({ authEnabled, isSignedIn, onNavigate, currentView, onSkip }) => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
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
        
        {isSignedIn && (
          <>
            <motion.div
              whileHover={{ scale: 1.2, color: '#22D3EE' }}
              style={{
                ...styles.iconWrapper,
                color: currentView === 'input' ? 'var(--accent-primary)' : '#A1A1AA'
              }}
              onClick={() => onNavigate('input')}
              title="Discovery Form"
            >
              <ClipboardList size={22} />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2, color: '#22D3EE' }}
              style={{
                ...styles.iconWrapper,
                color: currentView === 'dashboard' ? 'var(--accent-primary)' : '#A1A1AA'
              }}
              onClick={() => onNavigate('dashboard')}
              title="Dashboard"
            >
              <LayoutDashboard size={22} />
            </motion.div>
          </>
        )}
      </div>

      <div style={styles.authButtons}>
        <div style={styles.langSwitcher}>
          <select 
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            style={styles.langSelect}
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="mr">MR</option>
          </select>
        </div>
        {isSignedIn ? (
          authEnabled ? <UserButton afterSignOutUrl="/" /> : <button className="gold-button" style={styles.signUp} onClick={() => onNavigate('input')}>Continue</button>
        ) : authEnabled ? (
          <>
            <SignInButton mode="modal">
              <button style={styles.signIn}>Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="gold-button" style={styles.signUp}>Sign Up</button>
            </SignUpButton>
            {onSkip && (
              <button 
                style={{ ...styles.signIn, fontSize: '0.8rem', opacity: 0.7 }} 
                onClick={onSkip}
              >
                Guest
              </button>
            )}
          </>
        ) : (
          <>
            <button style={styles.signIn} onClick={() => onNavigate('input')}>Explore</button>
            <button className="gold-button" style={styles.signUp} onClick={() => onNavigate('input')}>Get Started</button>
          </>
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
  langSwitcher: {
    marginRight: '1rem',
  },
  langSelect: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    outline: 'none',
  }
};

export default Navbar;
