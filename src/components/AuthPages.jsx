import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Home } from 'lucide-react';

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

const AuthPages = ({ type, onSwitch, onFinish }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value) => {
    return value.length >= 8;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      console.log("Form submitted successfully!");
      // Proceed to the next step
      onFinish();
    }
  };

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
          {/* Abstract Decorations matching the prompt's blur/gradient vibe */}
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
            <div style={styles.iconWrapper}>
              <Sun size={40} />
            </div>
            <h2 style={styles.header}>
              {isSignIn ? "Welcome Back" : "Get Started"}
            </h2>
            <p style={styles.subheader}>
              {isSignIn 
                ? "Welcome back to HaqDaar — Sign in to continue" 
                : "Welcome to HaqDaar — Let's get started"}
            </p>
          </div>

          <form style={styles.form} onSubmit={handleSubmit} noValidate>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Your email</label>
              <input
                type="email"
                id="email"
                placeholder="hi@example.com"
                style={{
                  ...styles.input,
                  ...(emailError ? styles.inputError : {})
                }}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
              />
              {emailError && <p style={styles.errorText}>{emailError}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                {isSignIn ? "Password" : "Create new password"}
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                style={{
                  ...styles.input,
                  ...(passwordError ? styles.inputError : {})
                }}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
              />
              {passwordError && <p style={styles.errorText}>{passwordError}</p>}
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                backgroundColor: isHoveringBtn ? 'var(--accent-secondary)' : 'var(--accent-primary)'
              }}
              onMouseEnter={() => setIsHoveringBtn(true)}
              onMouseLeave={() => setIsHoveringBtn(false)}
            >
              {isSignIn ? "Sign In" : "Create a new account"}
            </button>

            <div style={styles.footerText}>
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <span 
                style={styles.link} 
                onClick={() => onSwitch(isSignIn ? 'signup' : 'signin')}
              >
                {isSignIn ? "Sign Up" : "Login"}
              </span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Responsive handling would typically be done via CSS media queries, 
// but using flexWrap is a standard React inline-style approach for split screens.
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#020617', // Deep Dark
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  cardContainer: {
    width: '100%',
    maxWidth: '1000px',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows stacking on small screens
    boxShadow: '0 25px 50px -12px rgba(34, 211, 238, 0.1)',
    borderRadius: '24px',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  leftPane: {
    flex: '1 1 400px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '4rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  leftText: {
    fontSize: '2.5rem',
    fontWeight: '500',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    position: 'relative',
    zIndex: 10,
  },
  bgDecoration1: {
    width: '300px',
    height: '300px',
    background: 'var(--accent-secondary)', // Deep Blue
    position: 'absolute',
    bottom: '-50px',
    left: '-50px',
    borderRadius: '50%',
    zIndex: 1,
    filter: 'blur(80px)',
    opacity: 0.5,
  },
  bgDecoration2: {
    width: '400px',
    height: '400px',
    background: 'var(--accent-primary)', // Neon Cyan
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    borderRadius: '50%',
    zIndex: 1,
    filter: 'blur(90px)',
    opacity: 0.2,
  },
  rightPane: {
    flex: '1 1 400px',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#0F172A',
    zIndex: 10,
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
    '&:hover': {
      color: 'var(--accent-primary)',
    }
  },
  headerArea: {
    marginBottom: '2.5rem',
  },
  iconWrapper: {
    color: 'var(--accent-primary)',
    marginBottom: '1.5rem',
  },
  header: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  subheader: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    opacity: 0.8,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  },
  submitBtn: {
    width: '100%',
    color: '#fff',
    padding: '0.8rem',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.2s ease',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#4B5563',
  },
  link: {
    color: 'var(--text-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  }
};

export default AuthPages;
