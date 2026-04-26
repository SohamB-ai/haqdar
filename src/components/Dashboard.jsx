import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Filter, ChevronRight, X, Download, Share2, Bookmark, User, LogOut, Settings, Heart, Search, Home } from 'lucide-react';
import axios from 'axios';
import AIChatbot from './AIChatbot';

const Dashboard = ({ userData, googleUser, onLogout, onHome }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [compareMode, setCompareMode] = useState('Category');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        
        console.log('Fetching from:', apiUrl);
        
        const res = await axios.post(`${apiUrl}/compare`, {
          homeState: userData?.homeState || 'All',
          currentState: userData?.currentState || 'All',
          occupation: userData?.occupation || '',
          category: selectedCategory,
          gender: userData?.gender || '',
          income: userData?.income || '',
        }, { timeout: 30000 });
        
        const { home_schemes = [], current_schemes = [], category_counts = {} } = res.data;
        setCategoryCounts(category_counts);
        
        const maxLength = Math.max(home_schemes.length, current_schemes.length);
        const paired = [];
        
        for (let i = 0; i < maxLength; i++) {
          const home = home_schemes[i];
          const curr = current_schemes[i];
          
          paired.push({
            category: (home?.schemeCategory || curr?.schemeCategory || 'All').split(',')[0].trim(),
            current: home ? {
              ...home,
              name: home.scheme_name || 'Unnamed Scheme',
              desc: (home.details || '').substring(0, 120) + '...',
              tag: home.level || 'Central',
              status: 'Available',
              statusColor: '#10B981'
            } : null,
            migrated: curr ? {
              ...curr,
              name: curr.scheme_name || 'Unnamed Scheme',
              desc: (curr.details || '').substring(0, 120) + '...',
              tag: curr.level || 'Central',
              status: 'New',
              statusColor: '#3B82F6'
            } : null
          });
        }
        setSchemes(paired);
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [userData, selectedCategory]);

  const filteredRows = schemes.filter(row => {
    const matchesCategory = selectedCategory === 'All' || (row.category || '').includes(selectedCategory);
    const matchesSearch = !searchQuery || 
                          (row.current?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (row.migrated?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryIcons = {
    'Education & Learning': '🎓',
    'Social welfare & Empowerment': '🤝',
    'Health & Wellness': '🏥',
    'Agriculture': '🌾',
    'Housing & Shelter': '🏠',
    'Skills & Employment': '💼',
    'Business & Entrepreneurship': '🚀',
    'Utility & Sanitation': '🧹',
    'Transport & Infrastructure': '🏗️',
    'Women and Child': '👩‍👧',
    'Banking': '🏦'
  };

  const categories = ['All', ...Object.keys(categoryIcons)];

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.homeIcon} onClick={onHome}><Home size={20} /></div>
          <h1 style={styles.headerTitle}>Your Welfare Comparison</h1>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.locationBadge}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>HOME</span>
            <span>{userData?.homeState}</span>
          </div>
          <ArrowRight size={20} style={{ margin: '0 1rem', opacity: 0.5 }} />
          <div style={styles.locationBadge}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CURRENT</span>
            <span>{userData?.currentState}</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.profileWrapper} onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
            <div style={styles.profileIcon}>{googleUser?.name?.[0] || 'U'}</div>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={styles.profileMenu}>
                  <div style={styles.menuHeader}>
                    <strong>{googleUser?.name || 'User'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{googleUser?.email}</div>
                  </div>
                  <div style={styles.menuDivider} />
                  <div style={styles.menuItem} onClick={onLogout}><LogOut size={14} /> Logout</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div style={styles.mainContainer}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}><Filter size={16} /> Categories</h3>
            <div style={styles.filterList}>
              {categories.map(cat => (
                <div key={cat} onClick={() => setSelectedCategory(cat)} style={{
                  ...styles.filterItem,
                  background: selectedCategory === cat ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span>{categoryIcons[cat] || '📂'}</span> {cat}
                  </div>
                  {cat !== 'All' && categoryCounts[cat] > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      {categoryCounts[cat]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main style={styles.content}>
          <div style={styles.summaryBar}>
             <div style={styles.scoreRing}>
                {schemes.length > 0 ? Math.round((schemes.filter(r => r.current && r.migrated).length / schemes.length) * 100) : 0}%
             </div>
             <div style={styles.summaryStats}>
                <div style={styles.statBox}><strong>{schemes.length}</strong> Matches</div>
                <div style={styles.statBox}><strong>{schemes.filter(r => r.current).length}</strong> Home</div>
                <div style={styles.statBox}><strong>{schemes.filter(r => r.migrated).length}</strong> Current</div>
             </div>
          </div>

          <div style={styles.gridHeader}>
            <div>{userData?.homeState}</div>
            <div style={styles.divider} />
            <div>{userData?.currentState}</div>
          </div>

          <div style={styles.gridBody}>
            {loading ? <div style={{ textAlign: 'center', padding: '5rem' }}>⏳ Matching schemes...</div> : 
             filteredRows.map((row, i) => (
              <div key={i} style={styles.comparisonRow}>
                <div style={styles.rowSide}>{row.current && <SchemeCard scheme={row.current} onOpen={() => setSelectedScheme(row.current)} />}</div>
                <div style={styles.rowDivider} />
                <div style={styles.rowSide}>{row.migrated && <SchemeCard scheme={row.migrated} onOpen={() => setSelectedScheme(row.migrated)} highlight />}</div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {selectedScheme && <DetailModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />}
      <AIChatbot userData={userData} schemes={filteredRows} selectedCategory={selectedCategory} />
    </div>
  );
};

const SchemeCard = ({ scheme, onOpen, highlight }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="card" style={{
    padding: '1.5rem',
    border: highlight ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{scheme.tag}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: scheme.statusColor }}>{scheme.status}</span>
    </div>
    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{scheme.name}</h3>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{scheme.desc}</p>
    <button onClick={onOpen} style={{ background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', border: 'none' }}>
      View Details <ChevronRight size={16} />
    </button>
  </motion.div>
);

const DetailModal = ({ scheme, onClose }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.modalContent} onClick={e => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h2>{scheme.name}</h2>
        <X onClick={onClose} style={{ cursor: 'pointer' }} />
      </div>
      <div style={styles.modalBody}>
        <div style={styles.modalSection}>
          <h4>Details</h4>
          <p>{scheme.details || scheme.desc}</p>
        </div>
        <div style={styles.modalSection}>
          <h4>Eligibility</h4>
          <p>{scheme.eligibility || 'Check official guidelines.'}</p>
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: '2rem' }}>
        <button className="gold-button" onClick={onClose}>Close</button>
      </div>
    </motion.div>
  </div>
);

const styles = {
  dashboard: { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' },
  header: { padding: '1rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.1em' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  homeIcon: { cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: 'rgba(34, 211, 238, 0.1)' },
  headerCenter: { display: 'flex', alignItems: 'center' },
  locationBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  profileWrapper: { position: 'relative' },
  profileIcon: { width: '36px', height: '36px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  profileMenu: { position: 'absolute', top: '100%', right: 0, width: '200px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem', zIndex: 50 },
  menuHeader: { marginBottom: '0.5rem' },
  menuDivider: { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' },
  menuItem: { cursor: 'pointer', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' },
  mainContainer: { display: 'flex', flex: 1 },
  sidebar: { width: '260px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '2rem' },
  sidebarTitle: { fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  filterList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  filterItem: { cursor: 'pointer', padding: '0.7rem 1rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.8rem' },
  content: { flex: 1, padding: '2rem 3rem' },
  summaryBar: { display: 'flex', alignItems: 'center', gap: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem 2rem', borderRadius: '12px', marginBottom: '2rem' },
  scoreRing: { width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' },
  summaryStats: { display: 'flex', gap: '2rem' },
  statBox: { fontSize: '0.9rem' },
  gridHeader: { display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' },
  divider: { width: '2px', background: 'var(--accent-primary)' },
  gridBody: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  comparisonRow: { display: 'flex', gap: '2rem' },
  rowSide: { flex: 1 },
  rowDivider: { width: '1px', background: 'rgba(255,255,255,0.1)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' },
  modalContent: { background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '700px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  modalSection: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
};

export default Dashboard;
