import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Filter, ChevronRight, X, Download, Share2, Bookmark } from 'lucide-react';
import { comparisonData } from './dashboardData';

const Dashboard = ({ userData }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [compareMode, setCompareMode] = useState('Category');

  const filteredRows = selectedCategory === 'All'
    ? comparisonData.rows
    : comparisonData.rows.filter(row => row.category === selectedCategory);

  return (
    <div style={styles.dashboard}>
      {/* 🔝 TOP HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.headerTitle}>Your Welfare Comparison</h1>
        </div>
        <div style={styles.headerCenter}>
          <span style={{ color: 'var(--accent-primary)' }}>Maharashtra</span>
          <ArrowRight size={20} style={{ color: 'var(--accent-primary)', margin: '0 1rem' }} />
          <span style={{ color: 'var(--accent-primary)' }}>Goa</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.profileIcon}>S</div>
        </div>
      </header>

      <div style={styles.mainContainer}>
        {/* 📂 LEFT SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}><Filter size={18} /> Filters</h3>
            <div style={styles.filterList}>
              {['All', ...comparisonData.categories].map(cat => (
                <div
                  key={cat}
                  style={{
                    ...styles.filterItem,
                    color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <div style={{
                    ...styles.checkbox,
                    background: selectedCategory === cat ? 'var(--accent-primary)' : 'transparent',
                    borderColor: 'var(--accent-primary)'
                  }} />
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Eligibility</h3>
            <div style={styles.filterList}>
              {['Eligible', 'Almost Eligible', 'Not Eligible'].map(el => (
                <div key={el} style={styles.filterItem}>
                  <div style={styles.checkbox} /> {el}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ⚖️ MAIN COMPARISON AREA */}
        <main style={styles.content}>
          {/* Summary Bar */}
          <div style={styles.summaryBar}>
            <div style={styles.modeToggle}>
              <span
                style={{ ...styles.modeBtn, color: compareMode === 'Category' ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                onClick={() => setCompareMode('Category')}
              >Compare by Category</span>
              <span
                style={{ ...styles.modeBtn, color: compareMode === 'Eligibility' ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                onClick={() => setCompareMode('Eligibility')}
              >Compare by Eligibility</span>
            </div>
            <div style={styles.summaryStats}>
              <span style={styles.stat}><span style={{ color: '#10B981' }}>●</span> 3 benefits continue</span>
              <span style={styles.stat}><span style={{ color: '#3B82F6' }}>●</span> 2 new available</span>
              <span style={styles.stat}><span style={{ color: '#F59E0B' }}>●</span> 1 requires action</span>
            </div>
          </div>

          {/* Comparison Grid */}
          <div style={styles.gridHeader}>
            <div style={styles.gridHeaderLeft}>Current State</div>
            <div style={styles.divider} />
            <div style={styles.gridHeaderRight}>Migrated State</div>
          </div>

          <div style={styles.gridBody}>
            {filteredRows.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.comparisonRow}
              >
                {/* Current Side */}
                <div style={styles.rowSide}>
                  {row.current ? (
                    <SchemeCard scheme={row.current} onOpen={() => setSelectedScheme(row.current)} />
                  ) : (
                    <div style={styles.emptyCard}>No existing scheme in this category</div>
                  )}
                </div>

                {/* Divider */}
                <div style={styles.rowDivider} />

                {/* Migrated Side */}
                <div style={styles.rowSide}>
                  {row.migrated ? (
                    <SchemeCard
                      scheme={row.migrated}
                      onOpen={() => setSelectedScheme(row.migrated)}
                      highlight={row.migrated.isNew}
                      faded={row.migrated.isFaded}
                    />
                  ) : (
                    <div style={styles.emptyCard}>Benefit lost after migration</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* 🔍 SCHEME DETAIL MODAL */}
      <AnimatePresence>
        {selectedScheme && (
          <DetailModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const SchemeCard = ({ scheme, onOpen, highlight, faded }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="card"
    style={{
      ...styles.card,
      opacity: faded ? 0.4 : 1,
      borderColor: highlight ? '#40E0D0' : 'rgba(64,224,208,0.1)',
      boxShadow: highlight ? '0 0 15px rgba(64,224,208,0.3)' : 'none',
    }}
  >
    <div style={styles.cardHeader}>
      <span style={styles.categoryTag}>{scheme.tag}</span>
      <span style={{ ...styles.statusBadge, background: scheme.statusColor }}>{scheme.status}</span>
    </div>
    <h3 style={styles.cardName}>{scheme.name}</h3>
    <p style={styles.cardDesc}>{scheme.desc}</p>
    <button onClick={onOpen} style={styles.viewBtn}>
      View Details <ChevronRight size={16} />
    </button>
  </motion.div>
);

const DetailModal = ({ scheme, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={styles.modalOverlay}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      style={styles.modalContent}
      onClick={e => e.stopPropagation()}
    >
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>{scheme.name}</h2>
        <X onClick={onClose} style={{ cursor: 'pointer' }} />
      </div>
      <div style={styles.modalBody}>
        <div style={styles.modalSection}>
          <h4 style={styles.sectionHeading}>Current Status</h4>
          <span style={{ ...styles.statusBadge, background: scheme.statusColor }}>{scheme.status}</span>
        </div>
        <div style={styles.modalSection}>
          <h4 style={styles.sectionHeading}>Application Roadmap</h4>
          <ul style={styles.roadmap}>
            <li>1. Update residence proof at local ward office (2 days)</li>
            <li>2. Link Aadhaar with new mobile number (Instant)</li>
            <li>3. Submit online form via State Portal (15 mins)</li>
          </ul>
        </div>
        <div style={styles.modalSection}>
          <h4 style={styles.sectionHeading}>Required Documents</h4>
          <div style={styles.tags}>
            <span style={styles.tag}>Aadhaar Card</span>
            <span style={styles.tag}>Ration Card</span>
            <span style={styles.tag}>Income Certificate</span>
          </div>
        </div>
      </div>
      <div style={styles.modalFooter}>
        <div style={styles.footerBtns}>
          <button style={styles.iconBtn}><Bookmark size={18} /></button>
          <button style={styles.iconBtn}><Share2 size={18} /></button>
          <button style={styles.iconBtn}><Download size={18} /></button>
        </div>
        <button className="gold-button" onClick={onClose}>Close</button>
      </div>
    </motion.div>
  </motion.div>
);

const styles = {
  dashboard: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--text-primary)',
  },
  header: {
    padding: '1rem 3rem',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  headerCenter: {
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  profileIcon: {
    width: '40px',
    height: '40px',
    background: 'var(--accent-primary)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    width: '280px',
    background: 'var(--bg-primary)',
    borderRight: '1px solid rgba(56, 189, 248, 0.05)',
    padding: '2rem',
    height: 'calc(100vh - 65px)',
    position: 'sticky',
    top: '65px',
  },
  sidebarSection: {
    marginBottom: '3rem',
  },
  sidebarTitle: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#666',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  filterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    border: '1px solid',
    borderRadius: '4px',
  },
  content: {
    flex: 1,
    padding: '2rem 3rem',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(56, 189, 248, 0.05)',
    padding: '1rem 2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  modeToggle: {
    display: 'flex',
    gap: '2rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  modeBtn: {
    cursor: 'pointer',
  },
  summaryStats: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.9rem',
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
    marginBottom: '2rem',
  },
  divider: {
    width: '1px',
    background: 'var(--accent-primary)',
    boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)',
  },
  gridBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  comparisonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: '4rem',
  },
  rowSide: {
    flex: 1,
  },
  rowDivider: {
    width: '1px',
    background: 'rgba(56, 189, 248, 0.1)',
  },
  card: {
    padding: '1.5rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  categoryTag: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.6rem',
    background: 'rgba(56, 189, 248, 0.05)',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  statusBadge: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontWeight: '700',
    color: '#fff',
  },
  cardName: {
    fontSize: '1rem',
    marginBottom: '1rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    flex: 1,
    lineHeight: '1.8',
  },
  viewBtn: {
    background: 'transparent',
    color: 'var(--accent-primary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    justifyContent: 'flex-start',
    padding: 0,
  },
  emptyCard: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    border: '1px dashed #333',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    background: 'var(--bg-primary)',
    width: '90%',
    maxWidth: '600px',
    borderRadius: '12px',
    border: '1px solid var(--accent-primary)',
    padding: '2.5rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  modalTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
  },
  modalSection: {
    marginBottom: '2rem',
  },
  sectionHeading: {
    fontSize: '1rem',
    color: 'var(--accent-primary)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  roadmap: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    color: 'var(--text-secondary)',
  },
  tags: {
    display: 'flex',
    gap: '0.8rem',
  },
  tag: {
    background: 'rgba(56, 189, 248, 0.1)',
    color: 'var(--accent-primary)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  modalFooter: {
    marginTop: '3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBtns: {
    display: 'flex',
    gap: '1rem',
  },
  iconBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '8px',
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(56, 189, 248, 0.1)',
  },
};

export default Dashboard;
