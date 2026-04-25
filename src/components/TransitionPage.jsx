import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';
import Dashboard from './Dashboard';

const stateImages = [
  {
    src: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1280&h=720&fit=crop&auto=format&q=80',
    alt: 'Taj Mahal, Uttar Pradesh',
  },
  {
    src: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1280&h=720&fit=crop&auto=format&q=80',
    alt: 'Hawa Mahal, Rajasthan',
  },
  {
    src: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=800&fit=crop&auto=format&q=80',
    alt: 'Backwaters, Kerala',
  },
  {
    src: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1280&h=720&fit=crop&auto=format&q=80',
    alt: 'Gateway of India, Mumbai',
  },
  {
    src: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=800&fit=crop&auto=format&q=80',
    alt: 'Golden Temple, Punjab',
  },
  {
    src: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1280&h=720&fit=crop&auto=format&q=80',
    alt: 'Varanasi Ghats, Uttar Pradesh',
  },
  {
    src: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1280&h=720&fit=crop&auto=format&q=80',
    alt: 'India Gate, Delhi',
  },
];

/*
  Each image wrapper is a full-screen centered flexbox.
  The inner <div> holds the image at a default 25vw × 25vh, centered.
  For indices 1–6 the inner div is offset from center via top/left overrides.
  On scroll every wrapper scales from center, so offsets fly outward naturally.
*/
const innerOverrides = [
  // 0 — center hero (no offset, just default size)
  { width: '25vw', height: '25vh' },
  // 1 — top-left
  { width: '35vw', height: '30vh', top: '-30vh', left: '5vw' },
  // 2 — left
  { width: '20vw', height: '45vh', top: '-10vh', left: '-25vw' },
  // 3 — right
  { width: '25vw', height: '25vh', top: '0vh',   left: '27.5vw' },
  // 4 — bottom-right
  { width: '20vw', height: '25vh', top: '27.5vh', left: '5vw' },
  // 5 — bottom-left
  { width: '30vw', height: '25vh', top: '27.5vh', left: '-22.5vw' },
  // 6 — far-right small
  { width: '15vw', height: '15vh', top: '22.5vh', left: '25vw' },
];

// ── ZoomParallax ─────────────────────────────────────────────────────────────
function ZoomParallax({ images }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} style={{ position: 'relative', height: '300vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg-primary)',
        }}
      >
        {images.map(({ src, alt }, index) => {
          const scale = scales[index % scales.length];
          const override = innerOverrides[index] || innerOverrides[0];
          const isCenter = index === 0;

          return (
            <motion.div
              key={index}
              style={{
                scale,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: override.width,
                  height: override.height,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  ...((!isCenter) && {
                    position: 'relative',
                    top: override.top,
                    left: override.left,
                  }),
                }}
              >
                <img
                  src={src}
                  alt={alt || `Parallax image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── TransitionPage ───────────────────────────────────────────────────────────
const TransitionPage = ({ onHome }) => {
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollHint(window.scrollY < 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* ── Intro Section ──────────────────────────────────────── */}
      <section style={styles.introSection}>
        <div style={styles.bgGlow1} />
        <div style={styles.bgGlow2} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={styles.introContent}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            style={styles.iconPulse}
          >
            <MapPin size={32} />
          </motion.div>

          <h1 style={styles.introTitle}>
            States{' '}
            <span style={{ color: 'var(--accent-primary)' }}>Integrity</span>
          </h1>
          <p style={styles.introSub}>
            Bridging welfare across boundaries — your schemes, anywhere in India
          </p>
        </motion.div>

        <AnimatePresence>
          {showScrollHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.scrollHint}
            >
              <p style={styles.scrollText}>Scroll down to explore</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown size={28} style={{ color: 'var(--accent-primary)' }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Zoom Parallax Gallery ──────────────────────────────── */}
      <ZoomParallax images={stateImages} />

      {/* ── Results Banner ─────────────────────────────────────── */}
      <section style={styles.resultsBanner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={styles.resultsBannerInner}
        >
          <h2 style={styles.resultsTitle}>Your Welfare Results</h2>
          <p style={styles.resultsSub}>
            Here are the government schemes available for you across states
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={24} style={{ color: 'var(--accent-primary)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Dashboard ──────────────────────────────────────────── */}
      <Dashboard onHome={onHome} />
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  introSection: {
    height: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'var(--accent-primary)',
    filter: 'blur(180px)',
    opacity: 0.12,
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'var(--accent-secondary)',
    filter: 'blur(200px)',
    opacity: 0.1,
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  introContent: {
    textAlign: 'center',
    zIndex: 10,
  },
  iconPulse: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'rgba(34, 211, 238, 0.1)',
    border: '2px solid rgba(34, 211, 238, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
    color: 'var(--accent-primary)',
  },
  introTitle: {
    fontSize: '3.5rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    marginBottom: '1rem',
    lineHeight: 1.1,
  },
  introSub: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    maxWidth: '500px',
    lineHeight: 1.8,
    margin: '0 auto',
  },
  scrollHint: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    zIndex: 100,
  },
  scrollText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  resultsBanner: {
    height: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  resultsBannerInner: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  resultsTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.01em',
  },
  resultsSub: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
    lineHeight: 1.6,
  },
};

export default TransitionPage;
