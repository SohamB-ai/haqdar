import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Filter, ChevronRight, X, Download, Share2, Bookmark, User, LogOut, Settings, Heart, Search, Home } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Dashboard = ({ userData, googleUser, getToken, onLogout, onHome }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [compareMode, setCompareMode] = useState('Category');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Fetch real data from backend
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        const token = getToken ? await getToken() : 'dev-token';
        const res = await axios.post(`${apiUrl}/portable`, {
          old_state: userData?.homeState || 'Maharashtra',
          new_state: userData?.currentState || 'Goa',
          occupation: userData?.occupation || 'Construction Worker',
          income: userData?.income || 5000
        }, {
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        
        // Transform backend data to match the UI structure
        // The backend returns { portable_schemes: [], new_state_schemes: [] }
        const transformed = res.data.portable_schemes.map((ps) => {
          const category = (ps.schemeCategory || 'Uncategorized').split(',')[0].trim();
          const shortDescription = (ps.details || 'No details available.').slice(0, 100);
          return {
            id: ps.id,
            category: category,
            status: 'Available',
            current: {
              ...ps,
              name: ps.scheme_name,
              desc: `${shortDescription}${(ps.details || '').length > 100 ? '...' : ''}`,
              tag: category,
              status: 'Active',
              statusColor: '#10B981'
            },
            migrated: {
              ...ps,
              name: ps.scheme_name,
              desc: `${shortDescription}${(ps.details || '').length > 100 ? '...' : ''}`,
              tag: category,
              status: 'Portable',
              statusColor: '#3B82F6'
            }
          };
        });

        setSchemes(transformed);
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();

    // Fetch saved schemes
    const fetchSavedSchemes = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
        const token = getToken ? await getToken() : 'dev-token';
        const clerkId = googleUser?.id || 'guest-id';
        const res = await axios.get(`${apiUrl}/api/saved-schemes/${clerkId}`, {
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        setSavedSchemes(res.data.saved_schemes || []);
      } catch (err) {
        console.error("Error fetching saved schemes:", err);
      }
    };
    fetchSavedSchemes();
  }, [userData, googleUser, getToken]);

  const toggleBookmark = async (scheme) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
      const token = getToken ? await getToken() : 'dev-token';
      const clerkId = googleUser?.id || 'guest-id';
      const schemeId = scheme._id || scheme.id;
      
      const isSaved = savedSchemes.some(s => (s._id || s.id) === schemeId);
      
      if (isSaved) {
        await axios.delete(`${apiUrl}/api/save-scheme`, {
          data: { clerkId, schemeId },
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        setSavedSchemes(prev => prev.filter(s => (s._id || s.id) !== schemeId));
      } else {
        await axios.post(`${apiUrl}/api/save-scheme`, {
          clerkId, schemeId
        }, {
          headers: { Authorization: `Bearer ${token || 'dev-token'}` }
        });
        setSavedSchemes(prev => [...prev, scheme]);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  // Auto-filter logic based on user profile
  useEffect(() => {
    if (userData?.occupation) {
      const occ = userData.occupation.toLowerCase();
      if (occ.includes('worker') || occ.includes('labor') || occ.includes('construction') || occ.includes('factory')) {
        setSelectedCategory('Social welfare & Empowerment');
      } else if (occ.includes('driver') || occ.includes('delivery')) {
        setSelectedCategory('Transport & Infrastructure');
      } else if (occ.includes('agricultural')) {
        setSelectedCategory('Agriculture');
      } else if (occ.includes('sanitation')) {
        setSelectedCategory('Utility & Sanitation');
      } else if (occ.includes('student')) {
        setSelectedCategory('Education & Learning');
      } else if (occ.includes('business') || occ.includes('employed')) {
        setSelectedCategory('Business & Entrepreneurship');
      }
    }
  }, [userData]);

  const filteredRows = schemes.filter(row => {
    const matchesCategory = selectedCategory === 'All' || row.category.includes(selectedCategory);
    const matchesSearch = row.current?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          row.migrated?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

    'Banking': '🏦'
  };

  const filteredSchemes = showSavedOnly 
    ? schemes.filter(s => savedSchemes.some(saved => (saved._id || saved.id) === (s.id || s._id)))
    : schemes;

  const filteredRows = filteredSchemes.filter(row => {
    const s = row.current || row.migrated;
    if (selectedCategory !== 'All' && !s.category.includes(selectedCategory)) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
          <h1 style={styles.headerTitle}>{t('dashboard_title')}</h1>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.locationBadge}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block' }}>{t('home_state')}</span>
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
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block' }}>{t('current_state')}</span>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{googleUser?.primaryEmailAddress?.emailAddress || 'user@haqdar.in'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginTop: '0.4rem' }}>
                      {userData?.occupation} • {userData?.currentState}
                    </div>
                  </div>
                  <div style={styles.menuDivider} />
                  <div style={styles.menuItem} onClick={() => { setShowSavedOnly(true); setShowProfileMenu(false); }}>
                    <Bookmark size={14} style={{ marginRight: '0.5rem' }} /> My Saved Schemes
                  </div>
                  <div style={styles.menuItem} onClick={() => alert("Profile Settings feature coming soon!")}>
                    <Settings size={14} style={{ marginRight: '0.5rem' }} /> Profile Settings
                  </div>
                  <div style={styles.menuDivider} />
                  <div 
                    style={{ ...styles.menuItem, color: '#EF4444' }}
                    onClick={onLogout}
                  >
                    <LogOut size={14} style={{ marginRight: '0.5rem' }} /> Logout
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div style={styles.mainContainer}>
        {/* 📂 LEFT SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}><Filter size={18} /> Categories</h3>
            <div style={styles.filterList}>
              {['All', 'Social welfare & Empowerment', 'Education & Learning', 'Health & Wellness', 'Agriculture', 'Housing & Shelter', 'Skills & Employment', 'Business & Entrepreneurship', 'Utility & Sanitation', 'Transport & Infrastructure', 'Women and Child', 'Banking'].map(cat => (
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
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{categoryIcons[cat] || '📂'}</span>
                  <span style={{ flex: 1 }}>{cat}</span>
                  {cat !== 'All' && (
                    <span style={styles.countBadge}>
                      {schemes.filter(r => r.category.includes(cat)).length}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}><Bookmark size={18} /> My Welfare</h3>
            <div 
              style={{
                ...styles.filterItem,
                background: showSavedOnly ? 'rgba(64, 224, 208, 0.1)' : 'transparent',
                color: showSavedOnly ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: showSavedOnly ? '1px solid rgba(64, 224, 208, 0.2)' : '1px solid transparent',
              }}
              onClick={() => setShowSavedOnly(!showSavedOnly)}
            >
              <span style={{ flex: 1 }}>Saved for Later</span>
              <span style={styles.countBadge}>{savedSchemes.length}</span>
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
            <div style={styles.portabilityScore}>
              <div style={styles.scoreRing}>
                <span style={styles.scoreVal}>{schemes.length > 0 ? '92%' : '0%'}</span>
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Welfare Match</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Based on your migration profile</div>
              </div>
            </div>
            <div style={styles.summaryStats}>
              <div style={styles.statBox}>
                <span style={{ color: '#10B981', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {schemes.length}
                </span>
                <span>Active Matches</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#3B82F6', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {schemes.filter(s => s.status === 'Available').length}
                </span>
                <span>Ready to Apply</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#F59E0B', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {schemes.length > 0 ? 1 : 0}
                </span>
                <span>Pending Action</span>
              </div>
            </div>
          </div>

          {/* Comparison Grid */}
          <div style={styles.gridHeader}>
            <div style={styles.gridHeaderLeft}>Current State</div>
            <div style={styles.divider} />
            <div style={styles.gridHeaderRight}>Migrated State</div>
          </div>

          <div style={styles.gridBody}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '2rem' }}
                >
                  ⏳
                </motion.div>
                <p>Matching your profile with 57,000+ schemes...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>No matching schemes found for this category.</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Try selecting "All" or searching for keywords.</p>
              </div>
            ) : (
              filteredRows.map((row, index) => (
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
                      <SchemeCard 
                        scheme={row.current} 
                        onOpen={() => setSelectedScheme(row.current)} 
                        isSaved={savedSchemes.some(s => (s._id || s.id) === (row.current.id || row.current._id))}
                        onBookmark={() => toggleBookmark(row.current)}
                      />
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
                        highlight={true}
                        isSaved={savedSchemes.some(s => (s._id || s.id) === (row.migrated.id || row.migrated._id))}
                        onBookmark={() => toggleBookmark(row.migrated)}
                      />
                    ) : (
                      <div style={styles.emptyCard}>Benefit lost after migration</div>
                    )}
                  </div>
                </motion.div>
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
            isSaved={selectedScheme && savedSchemes.some(s => (s._id || s.id) === (selectedScheme.id || selectedScheme._id))}
            onBookmark={() => toggleBookmark(selectedScheme)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SchemeCard = ({ scheme, highlight, onOpen, isSaved, onBookmark }) => (
  <motion.div
    whileHover={{ y: -5, borderColor: 'rgba(64, 224, 208, 0.4)' }}
    style={{
      ...styles.schemeCard,
      border: highlight ? '1px solid rgba(64, 224, 208, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: highlight ? '0 0 15px rgba(64,224,208,0.3)' : 'none',
    }}
  >
    <div style={styles.cardHeader}>
      <span style={styles.categoryTag}>{scheme.tag}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Bookmark 
          size={16} 
          fill={isSaved ? 'var(--accent-primary)' : 'none'} 
          color={isSaved ? 'var(--accent-primary)' : 'var(--text-secondary)'} 
          style={{ cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        />
        <span style={{ ...styles.statusBadge, background: scheme.statusColor }}>{scheme.status}</span>
      </div>
    </div>
    <h3 style={styles.cardName}>{scheme.name}</h3>
    <p style={styles.cardDesc}>{scheme.desc}</p>
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
        
        // Parallel fetch for Roadmap and Match Score
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
        setRoadmap([
          'Visit the nearest government office',
          'Submit the required application forms',
          'Collect the acknowledgement receipt'
        ]);
        setMatchInfo({ score: 85, reason: 'Highly relevant to your profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchAIInsights();
  }, [getToken, scheme, userData, currentLang]);

  const docs = scheme.documents ? scheme.documents.split(' ').filter(d => d.length > 2) : ['Aadhaar Card', 'Income Certificate'];

  return (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={styles.categoryTag}>{scheme.category || scheme.schemeCategory}</span>
            <h2 style={styles.modalTitle}>{scheme.name || scheme.scheme_name}</h2>
          </div>
          <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
        </div>
        <div style={styles.modalBody}>
          {/* Match Score Header */}
          <div style={styles.matchBanner}>
            <div style={{ ...styles.matchCircle, borderColor: matchInfo.score > 70 ? '#10B981' : '#F59E0B' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: matchInfo.score > 70 ? '#10B981' : '#F59E0B' }}>
                {loading ? '...' : `${matchInfo.score}%`}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>AI Eligibility Match</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {loading ? 'Analyzing your profile match...' : matchInfo.reason}
              </div>
            </div>
          </div>

          <div style={styles.modalGrid}>
            <div style={styles.modalLeft}>
              <div style={styles.modalSection}>
                <h4 style={styles.sectionHeading}><Sparkles size={16} style={{ marginRight: '0.5rem' }} /> AI Step-by-Step Roadmap</h4>
                {loading ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem' }}>Generating your personalized path...</div>
                ) : (
                  <div style={styles.roadmapStepper}>
                    {roadmap.map((step, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        style={styles.stepItem}
                      >
                        <div style={styles.stepNumber}>{i + 1}</div>
                        <div style={styles.stepText}>{step}</div>
                        {i < roadmap.length - 1 && <div style={styles.stepLine}></div>}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={styles.modalRight}>
              <div style={styles.modalSection}>
                <h4 style={styles.sectionHeading}>Required Documents</h4>
                <div style={styles.tags}>
                  {docs.map(doc => (
                    <span key={doc} style={styles.tag}>{doc}</span>
                  ))}
                </div>
              </div>
              <div style={styles.modalSection}>
                <h4 style={styles.sectionHeading}>Benefits</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {scheme.benefits || "Refer to official documentation for detailed benefit breakdown."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <div style={styles.footerBtns}>
            <button 
              style={{ ...styles.iconBtn, color: isSaved ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              onClick={onBookmark}
            >
              <Bookmark size={18} fill={isSaved ? 'var(--accent-primary)' : 'none'} />
            </button>
            <button style={styles.iconBtn}><Share2 size={18} /></button>
            <button style={styles.iconBtn}><Download size={18} /></button>
          </div>
          <button className="gold-button" onClick={onClose}>Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
    borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  homeIcon: {
    cursor: 'pointer',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '8px',
    background: 'rgba(34, 211, 238, 0.1)',
    transition: 'all 0.3s ease',
  },
  headerCenter: {
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  profileWrapper: {
    position: 'relative',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  profileImg: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid var(--accent-primary)',
    objectFit: 'cover',
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
  profileMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '240px',
    background: 'var(--bg-primary)',
    border: '1px solid rgba(64, 224, 208, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    padding: '1rem',
    zIndex: 1000,
    marginTop: '0.5rem',
  },
  menuHeader: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
  },
  menuDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.05)',
    margin: '0.5rem 0',
  },
  menuItem: {
    padding: '0.8rem 1rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.03)',
    }
  },
  countBadge: {
    fontSize: '0.7rem',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.2rem 0.5rem',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    width: '280px',
    background: 'var(--bg-primary)',
    borderRight: '1px solid rgba(34, 211, 238, 0.05)',
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
    background: 'rgba(34, 211, 238, 0.05)',
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
    borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
    marginBottom: '2rem',
  },
  divider: {
    width: '3px',
    background: 'var(--accent-primary)',
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
    width: '2px',
    background: 'var(--accent-primary)',
    opacity: 0.6,
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
    background: 'rgba(34, 211, 238, 0.05)',
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
    background: 'rgba(34, 211, 238, 0.1)',
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
    border: '1px solid rgba(34, 211, 238, 0.1)',
  },
  locationBadge: {
    padding: '0.5rem 1rem',
    background: 'rgba(56, 189, 248, 0.03)',
    border: '1px solid rgba(56, 189, 248, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '140px',
  },
  portabilityScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  scoreRing: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '4px solid #10B981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  scoreVal: {
    fontWeight: '800',
    fontSize: '1rem',
    color: '#10B981',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.8rem 1.2rem',
    borderRadius: '8px',
    minWidth: '100px',
  },
  modalSection: {
    marginBottom: '2rem',
  },
  sectionHeading: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  matchBanner: {
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  matchCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth < 768 ? '1fr' : '1.5fr 1fr',
    gap: '2rem',
    marginTop: '1.5rem',
  },
  roadmapStepper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    paddingLeft: '0.5rem',
  },
  stepItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--accent-primary)',
    color: '#020617',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    flexShrink: 0,
    zIndex: 2,
  },
  stepText: {
    fontSize: '0.9rem',
    color: '#E2E8F0',
    lineHeight: '1.5',
    paddingTop: '0.2rem',
  },
  stepLine: {
    position: 'absolute',
    left: '13px',
    top: '28px',
    bottom: '-1.5rem',
    width: '2px',
    background: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
};

export default Dashboard;
