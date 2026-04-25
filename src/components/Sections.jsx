import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    { num: '01', title: 'Enter Details', desc: 'Provide your basic info and work profile.' },
    { num: '02', title: 'Get Matched', desc: 'See schemes you are eligible for instantly.' },
    { num: '03', title: 'Portability Check', desc: 'Understand how to transfer benefits.' },
    { num: '04', title: 'Guided Steps', desc: 'Follow the roadmap to successfully claim.' },
  ];

  return (
    <section id="how-it-works" style={styles.section}>
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        style={styles.title}
      >
        How It <span className="gold-text">Works</span>
      </motion.h2>

      <div style={styles.stepsContainer}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            style={styles.stepCard}
          >
            <div style={styles.stepNum}>{step.num}</div>
            <h3 style={styles.stepTitle}>{step.title}</h3>
            <p style={styles.stepDesc}>{step.desc}</p>
            {i < steps.length - 1 && <div style={styles.connector} />}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const TechStack = () => {
  const tech = [
    { category: 'Frontend', items: ['React', 'Framer Motion', 'Lucide'] },
    { category: 'Backend', items: ['FastAPI', 'Python', 'Node.js'] },
    { category: 'Database', items: ['PostgreSQL', 'Redis'] },
    { category: 'APIs', items: ['GovData API', 'OAuth 2.0'] },
  ];

  return (
    <section id="tech-stack" style={{ ...styles.section, background: 'var(--gradient-bg)' }}>
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        style={styles.title}
      >
        Tech <span className="gold-text">Stack</span>
      </motion.h2>

      <div style={styles.techGrid}>
        {tech.map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            style={styles.techCard}
          >
            <h3 style={styles.techCategory}>{t.category}</h3>
            <div style={styles.tags}>
              {t.items.map((item, j) => (
                <span key={j} style={styles.tag}>{item}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '8rem 8rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '6rem',
    fontWeight: '700',
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    gap: '2rem',
  },
  stepCard: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepNum: {
    fontSize: '3rem',
    fontWeight: '800',
    color: 'rgba(56, 189, 248, 0.1)',
    marginBottom: '-1.5rem',
    zIndex: 0,
  },
  stepTitle: {
    fontSize: '1.2rem',
    marginBottom: '1.2rem',
    zIndex: 1,
    fontWeight: '600',
  },
  stepDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    maxWidth: '200px',
    lineHeight: '1.8',
  },
  connector: {
    position: 'absolute',
    top: '2rem',
    right: '-1.5rem',
    width: '3rem',
    height: '1px',
    background: 'rgba(56, 189, 248, 0.2)',
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  techCard: {
    background: 'var(--glass-bg)',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid rgba(56, 189, 248, 0.1)',
  },
  techCategory: {
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
    color: '#22C55E',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.8rem',
    justifyContent: 'center',
  },
  tag: {
    background: 'rgba(56, 189, 248, 0.05)',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
};

export { HowItWorks, TechStack };
