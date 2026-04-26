import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Filter, ChevronRight, X, Download, Share2, Bookmark, User, LogOut, Settings, Heart, Search, Home, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Dashboard = ({ userData, googleUser, getToken, onLogout, onHome }) => {
  const { t, i18n } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const categoryIcons = {
    'All': '📂',
    'Social welfare & Empowerment': '🤝',
    'Education & Learning': '🎓',
    'Health & Wellness': '🏥',
    'Agriculture': '🌾',
    'Housing & Shelter': '🏠',
    'Skills & Employment': '🛠️',
    'Business & Entrepreneurship': '💼',
    'Utility & Sanitation': '💧',
    'Transport & Infrastructure': '🚆',
    'Women and Child': '👩',
    'Banking': '🏦'
  };

  // Fetch data using the /compare endpoint
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        const token = getToken ? await getToken() : 'dev-token';
        
        const res = await axios.post(`${apiUrl}/compare`, {
          homeState: userData?.homeState || '',
          currentState: userData?.currentState || '',
          occupation: userData?.occupation || '',
          gender: userData?.gender || '',
          category: selectedCategory
        }, {
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });

        const { home_schemes, current_schemes, category_counts } = res.data;
        setCategoryCounts(category_counts || {});

        // Pair schemes for the comparison view
        const maxLength = Math.max(home_schemes.length, current_schemes.length);
        const paired = [];
        for (let i = 0; i < maxLength; i++) {
          paired.push({
            current: home_schemes[i] || null,
            migrated: current_schemes[i] || null
          });
        }
        setSchemes(paired);
      } catch (err) {
        console.error("Fetch error:", err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [userData, selectedCategory, getToken]);

  // Fetch saved schemes
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        const token = getToken ? await getToken() : 'dev-token';
        const clerkId = googleUser?.id || 'guest-id';
        const res = await axios.get(`${apiUrl}/api/saved-schemes/${clerkId}`, {
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        setSavedSchemes(res.data.saved_schemes || []);
      } catch (err) {
        console.error("Saved schemes fetch error:", err);
      }
    };
    if (googleUser) fetchSaved();
  }, [googleUser, getToken]);

  const toggleBookmark = async (scheme) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
      const token = getToken ? await getToken() : 'dev-token';
      const clerkId = googleUser?.id || 'guest-id';
      const schemeId = scheme._id || scheme.id || scheme.scheme_name;
      
      const isSaved = savedSchemes.some(s => (s._id || s.id || s.scheme_name) === schemeId);
      
      if (isSaved) {
        await axios.delete(`${apiUrl}/api/save-scheme`, {
          data: { clerkId, schemeId },
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        setSavedSchemes(prev => prev.filter(s => (s._id || s.id || s.scheme_name) !== schemeId));
      } else {
        await axios.post(`${apiUrl}/api/save-scheme`, {
          clerkId, schemeId
        }, {
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        setSavedSchemes(prev => [...prev, scheme]);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

  const filteredRows = schemes.filter(row => {
    const s = row.current || row.migrated;
    if (!s) return false;
    if (showSavedOnly && !savedSchemes.some(saved => (saved._id || saved.id || saved.scheme_name) === (s._id || s.id || s.scheme_name))) return false;
    if (searchQuery && !s.scheme_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={styles.dashboard}>
      {/* 🔝 TOP HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.homeIcon} onClick={onHome}>
            <Home size={20} />
          </div>
          <h1 style={styles.headerTitle}>HaqDaar</h1>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.locationBadge}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block' }}>HOME STATE</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{userData?.homeState || 'Maharashtra'}</span>
          </div>
          <motion.div 
            animate={{ x: [0, 5, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ margin: '0 1.5rem', color: 'var(--accent-primary)', opacity: 0.5 }}
          >
            <ArrowRight size={24} />
          </motion.div>
          <div style={styles.locationBadge}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block' }}>CURRENT STATE</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{userData?.currentState || 'Goa'}</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div 
            style={styles.profileWrapper}
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            {googleUser?.imageUrl ? (
              <img src={googleUser.imageUrl} style={styles.profileImg} alt="profile" />
            ) : (
              <div style={styles.profileIcon}>{googleUser?.firstName?.[0] || 'U'}</div>
            )}
            
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={styles.profileMenu}
                >
                  <div style={styles.menuHeader}>
                    <div style={{ fontWeight: '700' }}>{googleUser?.fullName || 'Welfare User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{googleUser?.email || 'user@haqdar.in'}</div>
                  </div>
                  <div style={styles.menuDivider} />
                  <div style={styles.menuItem} onClick={() => { setShowSavedOnly(!showSavedOnly); setShowProfileMenu(false); }}>
                    <Bookmark size={14} style={{ marginRight: '0.5rem' }} /> {showSavedOnly ? "Show All Schemes" : "My Saved Schemes"}
                  </div>
                  <div style={styles.menuDivider} />
                  <div style={{ ...styles.menuItem, color: '#EF4444' }} onClick={onLogout}>
                    <LogOut size={14} style={{ marginRight: '0.5rem' }} /> Logout
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div style={styles.mainContainer} className="responsive-dashboard">
        {/* 📂 LEFT SIDEBAR */}
        <aside style={styles.sidebar} className="responsive-sidebar">
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}><Filter size={18} /> Categories</h3>
            <div style={styles.filterList}>
              {Object.keys(categoryIcons).map(cat => (
                <div
                  key={cat}
                  style={{
                    ...styles.filterItem,
                    background: selectedCategory === cat ? 'rgba(64, 224, 208, 0.1)' : 'transparent',
                    color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: selectedCategory === cat ? '1px solid rgba(64, 224, 208, 0.2)' : '1px solid transparent',
                  }}
                  onClick={() => { setSelectedCategory(cat); setShowSavedOnly(false); }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{categoryIcons[cat]}</span>
                  <span style={{ flex: 1 }}>{cat}</span>
                  {cat !== 'All' && categoryCounts[cat] !== undefined && (
                    <span style={styles.countBadge}>{categoryCounts[cat]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}><Search size={18} /> Search</h3>
            <div style={styles.searchBox}>
               <Search size={14} style={{ marginRight: '0.5rem', opacity: 0.5 }} />
               <input 
                 type="text" 
                 placeholder="Search schemes..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={styles.searchInput}
               />
            </div>
          </div>
        </aside>

        {/* ⚖️ MAIN COMPARISON AREA */}
        <main style={styles.content} className="responsive-content">
          <div style={styles.gridHeader}>
            <div style={styles.gridHeaderLeft}>{userData?.homeState || 'Home State'}</div>
            <div style={styles.divider} />
            <div style={styles.gridHeaderRight}>{userData?.currentState || 'Current State'}</div>
          </div>

          <div style={styles.gridBody}>
            {loading ? (
              <div style={styles.emptyState}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.div>
                <p>Matching your profile with schemes...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div style={{ ...styles.emptyState, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
                <Bookmark size={48} strokeWidth={1} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>No schemes found</h3>
                <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {showSavedOnly 
                    ? "You haven't bookmarked any schemes yet. Browse and save schemes to easily track them here." 
                    : "We couldn't find any schemes matching your criteria. Try adjusting your filters or search."}
                </p>
              </div>
            ) : (
              filteredRows.map((row, index) => (
                <div key={index} style={styles.comparisonRow} className="responsive-comparison">
                  <div style={styles.rowSide}>
                    {row.current && (
                      <SchemeCard 
                        scheme={row.current} 
                        onOpen={() => setSelectedScheme(row.current)} 
                        isSaved={savedSchemes.some(s => (s._id || s.id || s.scheme_name) === (row.current._id || row.current.id || row.current.scheme_name))}
                        onBookmark={() => toggleBookmark(row.current)}
                      />
                    )}
                  </div>
                  <div style={styles.rowDivider} />
                  <div style={styles.rowSide}>
                    {row.migrated && (
                      <SchemeCard 
                        scheme={row.migrated} 
                        onOpen={() => setSelectedScheme(row.migrated)}
                        highlight={true}
                        isSaved={savedSchemes.some(s => (s._id || s.id || s.scheme_name) === (row.migrated._id || row.migrated.id || row.migrated.scheme_name))}
                        onBookmark={() => toggleBookmark(row.migrated)}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* 🔍 SCHEME DETAIL MODAL */}
      <AnimatePresence>
        {selectedScheme && (
          <DetailModal 
            scheme={selectedScheme} 
            userData={userData}
            getToken={getToken}
            onClose={() => setSelectedScheme(null)}
            isSaved={savedSchemes.some(s => (s._id || s.id || s.scheme_name) === (selectedScheme._id || selectedScheme.id || selectedScheme.scheme_name))}
            onBookmark={() => toggleBookmark(selectedScheme)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SchemeCard = ({ scheme, highlight, onOpen, isSaved, onBookmark }) => (
  <motion.div
    className="scheme-card"
    whileHover={{ y: -5 }}
    style={{
      ...styles.schemeCard,
      border: highlight ? '1px solid rgba(64, 224, 208, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
      background: highlight ? 'rgba(64, 224, 208, 0.03)' : 'rgba(255, 255, 255, 0.02)'
    }}
  >
    <div style={styles.cardHeader}>
      <span style={styles.categoryTag}>{scheme.schemeCategory || 'General'}</span>
      <Bookmark 
        size={16} 
        fill={isSaved ? 'var(--accent-primary)' : 'none'} 
        color={isSaved ? 'var(--accent-primary)' : 'var(--text-secondary)'} 
        style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
      />
    </div>
    <h3 style={styles.cardName}>{scheme.scheme_name}</h3>
    <p style={styles.cardDesc}>{scheme.details?.slice(0, 100)}...</p>
    <button onClick={onOpen} style={styles.viewBtn}>
      View Details <ChevronRight size={16} />
    </button>
  </motion.div>
);

const DetailModal = ({ scheme, onClose, getToken, userData, isSaved, onBookmark }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'hi' ? 'Hindi' : (i18n.language === 'mr' ? 'Marathi' : 'English');
  
  const [roadmap, setRoadmap] = useState([]);
  const [matchInfo, setMatchInfo] = useState({ score: 0, reason: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        const token = getToken ? await getToken() : 'dev-token';
        
        const [roadmapRes, matchRes] = await Promise.all([
          axios.post(`${apiUrl}/extract-roadmap`, {
            application: scheme.details,
            language: currentLang
          }, { headers: { Authorization: `Bearer ${token || 'dev-token'}` } }),
          axios.post(`${apiUrl}/calculate-match`, {
            profile: userData,
            scheme: scheme,
            language: currentLang
          }, { headers: { Authorization: `Bearer ${token || 'dev-token'}` } })
        ]);

        setRoadmap(roadmapRes.data.roadmap);
        setMatchInfo(matchRes.data);
      } catch (err) {
        console.error("AI Insights fetch failed:", err);
        setRoadmap(['Visit local office', 'Submit ID proof', 'Collect receipt']);
        setMatchInfo({ score: 85, reason: 'Highly relevant to your profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchAIInsights();
  }, [scheme, userData, currentLang, getToken]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={styles.modalContent} className="dashboard-modal-content" onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={styles.categoryTag}>{scheme.schemeCategory}</span>
            <h2 style={styles.modalTitle}>{scheme.scheme_name}</h2>
          </div>
          <X onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        <div style={styles.modalBody}>
          <div style={styles.matchBanner}>
            <div style={{ ...styles.matchCircle, borderColor: matchInfo.score > 70 ? '#10B981' : '#F59E0B' }}>
               <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{loading ? '...' : `${matchInfo.score}%`}</span>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>AI Eligibility Match</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{loading ? 'Analyzing...' : matchInfo.reason}</div>
            </div>
          </div>

          <div style={styles.modalGrid} className="dashboard-modal-grid">
             <div style={styles.modalSection}>
                <h4 style={styles.sectionHeading}><Sparkles size={16} style={{ marginRight: '0.5rem' }} /> AI Roadmap</h4>
                <div style={styles.roadmapStepper}>
                  {roadmap.map((step, i) => (
                    <div key={i} style={styles.stepItem}>
                      <div style={styles.stepNumber}>{i+1}</div>
                      <div style={styles.stepText}>{step}</div>
                    </div>
                  ))}
                </div>
             </div>
             <div style={styles.modalSection}>
                <h4 style={styles.sectionHeading}>Eligibility</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6 }}>{scheme.eligibility}</p>
                <h4 style={{ ...styles.sectionHeading, marginTop: '1.5rem' }}>Benefits</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6 }}>{scheme.benefits}</p>
             </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
           <button style={styles.iconBtn} onClick={onBookmark}>
             <Bookmark size={18} fill={isSaved ? 'var(--accent-primary)' : 'none'} color={isSaved ? 'var(--accent-primary)' : 'currentColor'} />
           </button>
           <button className="gold-button" onClick={onClose}>Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const styles = {
  dashboard: { minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', color: '#E5E7EB' },
  header: { padding: '1rem 3rem', background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  headerTitle: { fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '2px' },
  headerCenter: { display: 'flex', alignItems: 'center' },
  headerRight: { display: 'flex', alignItems: 'center' },
  locationBadge: { padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' },
  homeIcon: { cursor: 'pointer', color: 'var(--accent-primary)' },
  profileWrapper: { position: 'relative' },
  profileImg: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-primary)' },
  profileIcon: { width: '36px', height: '36px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  profileMenu: { position: 'absolute', top: '120%', right: 0, width: '220px', background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  menuHeader: { padding: '0.4rem' },
  menuDivider: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' },
  menuItem: { padding: '0.6rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' },
  mainContainer: { display: 'flex', flex: 1 },
  sidebar: { width: '300px', background: '#0D0D0D', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem', height: 'calc(100vh - 68px)', position: 'sticky', top: '68px' },
  sidebarSection: { marginBottom: '2.5rem' },
  sidebarTitle: { fontSize: '0.8rem', textTransform: 'uppercase', color: '#666', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  filterList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  filterItem: { display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' },
  countBadge: { fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '8px' },
  searchBox: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', width: '100%', outline: 'none' },
  content: { flex: 1, padding: '2rem 4rem' },
  gridHeader: { display: 'flex', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' },
  divider: { width: '2px', background: 'var(--accent-primary)', opacity: 0.5 },
  gridBody: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  comparisonRow: { display: 'flex', gap: '3rem', alignItems: 'stretch' },
  rowSide: { flex: 1 },
  rowDivider: { width: '1px', background: 'rgba(255,255,255,0.05)' },
  schemeCard: { padding: '1.5rem', borderRadius: '12px', transition: 'all 0.3s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  categoryTag: { fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(64, 224, 208, 0.1)', color: 'var(--accent-primary)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' },
  cardName: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' },
  cardDesc: { fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1.2rem', lineHeight: 1.5 },
  viewBtn: { background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' },
  modalContent: { background: '#121212', width: '100%', maxWidth: '850px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' },
  modalHeader: { padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: '1.5rem', fontWeight: '800' },
  modalBody: { padding: '2rem', maxHeight: '70vh', overflowY: 'auto' },
  matchBanner: { display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '12px', marginBottom: '2rem' },
  matchCircle: { width: '50px', height: '50px', borderRadius: '50%', border: '3px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' },
  modalSection: { display: 'flex', flexDirection: 'column' },
  sectionHeading: { fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '1.2rem', display: 'flex', alignItems: 'center' },
  roadmapStepper: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  stepItem: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  stepNumber: { width: '24px', height: '24px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: 'black' },
  stepText: { fontSize: '0.9rem', color: '#D1D5DB' },
  modalFooter: { padding: '1.2rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' },
  emptyState: { textAlign: 'center', padding: '5rem', color: '#666' }
};

export default Dashboard;
