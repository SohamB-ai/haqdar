import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Home } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

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

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AuthPages = ({ type, onSwitch, onFinish }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
      const res = await axios.post(`${apiUrl}/google-login`, {
        credential: credentialResponse.credential
      });
      onFinish(res.data.user);
    } catch (err) {
      console.error("Google Login Backend Error:", err);
      alert("Failed to login with Google. Please try again.");
    }
  };

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
      onFinish({ name: email.split('@')[0], email: email });
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

            <div style={styles.divider}>
              <div style={styles.line}></div>
              <span style={styles.dividerText}>OR</span>
              <div style={styles.line}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                text={isSignIn ? "signin_with" : "signup_with"}
                width="320"
              />
            </div>

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
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0',
  },
  line: {
    flex: 1,
    height: '1px',
    background: '#374151',
  },
  dividerText: {
    fontSize: '0.8rem',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    padding: '0.8rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    border: '1px solid #D1D5DB',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};

export default AuthPages;
