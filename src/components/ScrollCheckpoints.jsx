import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const checkpoints = [
  { id: 'problem', label: 'The Problem' },
  { id: 'solution', label: 'Our Solution' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'tech-stack', label: 'Tech Stack' },
];

const ScrollCheckpoints = () => {
  const [activeSection, setActiveSection] = useState(checkpoints[0].id);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger exactly when the section crosses the middle of the viewport
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    checkpoints.forEach((point) => {
      const element = document.getElementById(point.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.track}>
        {checkpoints.map((point, index) => {
          const isActive = activeSection === point.id;
          return (
            <div key={point.id} style={styles.pointWrapper} onClick={() => scrollToSection(point.id)}>
              <span style={{
                ...styles.label,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0)' : 'translateX(10px)',
              }}>
                {point.label}
              </span>
              <div style={styles.dotContainer}>
                <motion.div
                  animate={{
                    scale: isActive ? 1.5 : 1,
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'rgba(56, 189, 248, 0.2)',
                  }}
                  transition={{ duration: 0.3 }}
                  style={styles.dot}
                />
              </div>
              {index < checkpoints.length - 1 && (
                <div style={styles.line} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    right: '2rem',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  track: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  pointWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    height: '60px',
    cursor: 'pointer',
    width: '150px',
  },
  label: {
    position: 'absolute',
    right: '30px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },
  dotContainer: {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: '0',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  line: {
    position: 'absolute',
    right: '7px',
    top: '38px', // Starts after the dot (height/2 + dot/2)
    height: '44px', // connects to the next dot
    width: '2px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
};

export default ScrollCheckpoints;
