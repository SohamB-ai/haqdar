import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { statesData } from './statesData';
import axios from 'axios';

const IndiaMap = () => {
  const [activeStateIndex, setActiveStateIndex] = useState(0);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        const res = await axios.get(`${apiUrl}/state-stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch state stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStateIndex((prev) => (prev + 1) % statesData.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentStateName = statesData[activeStateIndex].name;
  const currentCount = stats[currentStateName] || stats[currentStateName.replace(' & ', ' and ')] || (activeStateIndex * 7) % 40 + 20;

  return (
    <div style={styles.container}>
      <svg
        viewBox="0 0 612 696"
        style={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {statesData.map((state, index) => (
          <motion.path
            key={state.id}
            d={state.d}
            fill={index === activeStateIndex ? '#22D3EE' : '#F3F4F6'}
            stroke="#22D3EE"
            strokeWidth="0.5"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: index === activeStateIndex ? 1 : 0.4,
              fill: index === activeStateIndex ? '#22D3EE' : '#F3F4F6',
              scale: index === activeStateIndex ? 1.02 : 1,
              filter: index === activeStateIndex ? 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))' : 'none',
            }}
            transition={{ duration: 0.8 }}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>
      <div style={styles.labelContainer}>
        <AnimatePresence mode="wait">
          <motion.div
            key={statesData[activeStateIndex].id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={styles.stateLabel}
          >
            {currentStateName} 
            <span style={styles.schemeCount}>
              ({currentCount} Schemes Available)
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    width: '90%',
    height: 'auto',
    maxHeight: '500px',
  },
  labelContainer: {
    marginTop: '20px',
    height: '30px',
  },
  stateLabel: {
    fontSize: '1.2rem',
    color: '#22D3EE',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  schemeCount: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    textTransform: 'none',
    fontWeight: '400',
  },
};

export default IndiaMap;
