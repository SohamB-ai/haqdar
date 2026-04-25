import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ClipboardCheck, Users } from 'lucide-react';

const ProblemSolution = () => {
  const features = [
    {
      title: 'Discover Schemes',
      desc: 'AI-powered matching for 500+ central and state schemes.',
      icon: <Search size={32} />,
    },
    {
      title: 'Check Portability',
      desc: 'Track your benefits as you move across state borders.',
      icon: <MapPin size={32} />,
    },
    {
      title: 'Guided Application',
      desc: 'Step-by-step assistance for complex documentation.',
      icon: <ClipboardCheck size={32} />,
    },
    {
      title: 'Helper Support',
      desc: 'Connect with local volunteers for ground-level help.',
      icon: <Users size={32} />,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Problem Section */}
      <section id="problem" style={styles.section}>
        <div style={styles.content}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.sectionTitle}
          >
            The <span className="gold-text">Problem</span>
          </motion.h2>
          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={styles.list}
          >
            <li>Migrant workers lose access to welfare benefits after relocation.</li>
            <li>Government systems are fragmented and not interconnected.</li>
            <li>Lack of awareness leads to millions in unclaimed benefits.</li>
          </motion.ul>
        </div>
        <div style={styles.visual}>
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={styles.abstractCircle}
          />
        </div>
      </section>

      {/* Solution Section */}
      <section style={styles.section}>
        <div style={{ width: '100%' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '4rem' }}
          >
            Our <span className="gold-text">Solution</span>
          </motion.h2>

          <div style={styles.grid}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
                style={styles.featureCard}
              >
                <div style={styles.iconBox}>{f.icon}</div>
                <h3 style={styles.cardTitle}>{f.title}</h3>
                <p style={styles.cardDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '4rem 8rem',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8rem',
    gap: '4rem',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '2.5rem',
    marginBottom: '2.5rem',
    fontWeight: '700',
  },
  list: {
    fontSize: '1.1rem',
    color: '#A1A1AA',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    lineHeight: '1.8',
  },
  visual: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  abstractCircle: {
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '2px solid #40E0D0',
    boxShadow: '0 0 50px rgba(64, 224, 208, 0.2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconBox: {
    color: '#40E0D0',
    marginBottom: '1.5rem',
    padding: '1rem',
    borderRadius: '12px',
    background: 'rgba(64, 224, 208, 0.05)',
  },
  cardTitle: {
    fontSize: '1.2rem',
    marginBottom: '1.2rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
  },
  cardDesc: {
    color: '#A1A1AA',
    lineHeight: '1.8',
    fontSize: '0.9rem',
  },
};

export default ProblemSolution;
