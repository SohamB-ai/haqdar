import React from 'react';
import { motion } from 'framer-motion';

const AuthPages = ({ type, onSwitch, onFinish }) => {
  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={styles.authCard}
      >
        <h2 style={styles.title}>{type === 'signin' ? 'Welcome Back' : 'Join HaqDaar'}</h2>
        <p style={styles.subtitle}>Enter your credentials to access the platform</p>

        <form style={styles.form} onSubmit={(e) => { e.preventDefault(); onFinish(); }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" placeholder="name@example.com" style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" placeholder="••••••••" style={styles.input} required />
          </div>

          <button type="submit" className="gold-button" style={styles.submitBtn}>
            {type === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          {type === 'signin' ? (
            <p>Don't have an account? <span style={styles.link} onClick={() => onSwitch('signup')}>Sign Up</span></p>
          ) : (
            <p>Already have an account? <span style={styles.link} onClick={() => onSwitch('signin')}>Sign In</span></p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0B0B0B',
  },
  authCard: {
    width: '100%',
    maxWidth: '450px',
    padding: '3rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#A1A1AA',
    marginBottom: '2.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    textAlign: 'left',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#40E0D0',
    fontWeight: '600',
  },
  input: {
    background: '#1a1a1a',
    border: '1px solid rgba(64, 224, 208, 0.2)',
    padding: '1rem',
    borderRadius: '4px',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  submitBtn: {
    marginTop: '1rem',
    padding: '1rem',
  },
  footer: {
    marginTop: '2rem',
    color: '#A1A1AA',
  },
  link: {
    color: '#40E0D0',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default AuthPages;
