import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Truck, Hammer, User, Briefcase, Plus, Check, MapPin, Home } from 'lucide-react';
import axios from 'axios';

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const steps = [
  { id: 1, title: 'Location', question: 'Where are you currently located?' },
  { id: 2, title: 'Personal Info', question: 'Tell us a bit about yourself.' },
  { id: 3, title: 'Work Profile', question: 'What is your primary occupation?' },
  { id: 4, title: 'Income', question: 'What is your monthly income range?' },
  { id: 5, title: 'Social Category', question: 'Select your social category.' },
  { id: 6, title: 'Family Details', question: 'Tell us about your family.' },
  { id: 7, title: 'Documents', question: 'Which documents do you currently have?' },
  { id: 8, title: 'Summary', question: 'Verify your details before searching.' },
];

const InputPanel = ({ onComplete, onHome }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    homeState: '',
    currentState: '',
    gender: '',
    age: '',
    occupation: '',
    income: '',
    category: '',
    familySize: 1,
    earningMembers: 1,
    docs: []
  });
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const detectLocation = async () => {
      setIsDetecting(true);
      try {
        const res = await axios.get('https://ipapi.co/json/');
        const detectedState = res.data.region;
        // Check if detected state is in our list (matching names can be tricky)
        const matchedState = states.find(s => s.toLowerCase().includes(detectedState.toLowerCase()));
        if (matchedState && !formData.currentState) {
          setFormData(prev => ({ ...prev, currentState: matchedState }));
        }
      } catch (err) {
        console.error("Location detection failed:", err);
      } finally {
        setIsDetecting(false);
      }
    };

    if (currentStep === 1) {
      detectLocation();
    }
  }, []);

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
    else onComplete(formData);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.optionGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Home State</label>
              <select 
                style={styles.select}
                value={formData.homeState}
                onChange={(e) => setFormData({ ...formData, homeState: e.target.value })}
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Current State</label>
                {isDetecting && <span style={styles.detecting}><MapPin size={10} className="animate-pulse" /> Detecting...</span>}
              </div>
              <select 
                style={styles.select}
                value={formData.currentState}
                onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        );
      case 2: {
        const genders = [
          { name: 'Male', icon: '👨' },
          { name: 'Female', icon: '👩' },
          { name: 'Others', icon: '👤' }
        ];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Gender</label>
              <div style={styles.genderGrid}>
                {genders.map(g => (
                  <motion.div
                    key={g.name}
                    whileHover={{ y: -5 }}
                    onClick={() => setFormData({ ...formData, gender: g.name })}
                    style={{
                      ...styles.genderCard,
                      background: formData.gender === g.name ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: formData.gender === g.name ? '#22C55E' : 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{g.icon}</span>
                    <span style={{ fontWeight: '500' }}>{g.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>How old are you?</label>
              <input 
                type="range" 
                min="18" max="100" 
                value={formData.age || 25}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                style={styles.rangeInput}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: '#22C55E', fontWeight: 'bold' }}>{formData.age || 25} Years</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Slide to select</span>
              </div>
            </div>
          </div>
        );
      }
      case 3: {
        const occupations = [
          { name: 'Construction Worker', icon: <Hammer /> },
          { name: 'Agricultural Labor', icon: <Plus /> }, 
          { name: 'Driver', icon: <Truck /> },
          { name: 'Domestic Worker', icon: <User /> },
          { name: 'Security Guard', icon: <User /> },
          { name: 'Delivery Partner', icon: <Truck /> },
          { name: 'Factory Worker', icon: <Briefcase /> },
          { name: 'Street Vendor', icon: <Plus /> },
          { name: 'Sanitation Worker', icon: <Plus /> },
          { name: 'Tailor/Craftsperson', icon: <Hammer /> },
          { name: 'Plumber/Electrician', icon: <Hammer /> },
          { name: 'Self-Employed', icon: <Briefcase /> },
          { name: 'Others', icon: <Plus /> },
        ];
        return (
          <div style={styles.iconGrid}>
            {occupations.map((occ) => (
              <motion.div
                key={occ.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newValue = formData.occupation === occ.name ? '' : occ.name;
                  setFormData({ ...formData, occupation: newValue });
                }}
                style={{
                  ...styles.iconCard,
                  borderColor: formData.occupation === occ.name ? '#22C55E' : 'rgba(56, 189, 248, 0.1)',
                  background: formData.occupation === occ.name ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-primary)',
                }}
              >
                <div style={styles.iconBox}>{occ.icon}</div>
                <span style={{ fontSize: '0.9rem', textAlign: 'center' }}>{occ.name}</span>
              </motion.div>
            ))}
          </div>
        );
      }
      case 4: {
        const ranges = ['Below ₹5,000', '₹5,000 - ₹15,000', '₹15,000 - ₹30,000', 'Above ₹30,000'];
        return (
          <div style={styles.buttonGrid}>
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => {
                  const newValue = formData.income === r ? '' : r;
                  setFormData({ ...formData, income: newValue });
                }}
                style={{
                  ...styles.optionBtn,
                   background: formData.income === r ? '#22D3EE' : 'rgba(34, 211, 238, 0.05)',
                   color: formData.income === r ? '#FFFFFF' : 'var(--text-primary)',
                   border: formData.income === r ? '1px solid #22C55E' : '1px solid rgba(56, 189, 248, 0.1)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        );
      }
      case 5: {
        const categories = [
          { name: 'General', icon: '🏛️' },
          { name: 'OBC', icon: '🛠️' },
          { name: 'SC', icon: '⚖️' },
          { name: 'ST', icon: '🏹' },
          { name: 'EWS', icon: '💼' }
        ];
        return (
          <div style={styles.categoryGrid}>
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, category: cat.name })}
                style={{
                  ...styles.categoryCardNew,
                  background: formData.category === cat.name ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: formData.category === cat.name ? '#22C55E' : 'rgba(56, 189, 248, 0.1)',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                <span style={{ fontWeight: '600' }}>{cat.name}</span>
              </motion.div>
            ))}
          </div>
        );
      }
      case 6: {
        const Counter = ({ label, value, field, icon }) => (
          <div style={styles.counterRowNew}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              <span style={styles.label}>{label}</span>
            </div>
            <div style={styles.counterControl}>
              <button 
                onClick={() => setFormData({ ...formData, [field]: Math.max(1, (formData[field] || 1) - 1) })}
                style={styles.countBtn}
              >-</button>
              <span style={styles.countVal}>{value || 1}</span>
              <button 
                onClick={() => setFormData({ ...formData, [field]: (formData[field] || 1) + 1 })}
                style={styles.countBtn}
              >+</button>
            </div>
          </div>
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Counter label="Total Family Members" value={formData.familySize} field="familySize" icon="👨‍👩‍👧‍👦" />
            <Counter label="Total Earning Members" value={formData.earningMembers} field="earningMembers" icon="💰" />
            <div style={styles.familyVisual}>
              {Array.from({ length: Math.min(10, formData.familySize) }).map((_, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ fontSize: '1.5rem' }}
                >
                  👤
                </motion.span>
              ))}
              {formData.familySize > 10 && <span>+ {formData.familySize - 10} more</span>}
            </div>
          </div>
        );
      }
      case 7: {
        const documents = [
          { name: 'Aadhaar', icon: '🆔' },
          { name: 'Ration Card', icon: '🌾' },
          { name: 'Income Certificate', icon: '📄' },
          { name: 'Bank Account', icon: '🏦' },
          { name: 'MNREGA Job Card', icon: '👷' }
        ];
        return (
          <div style={styles.docGrid}>
            {documents.map((doc) => (
              <motion.div
                key={doc.name}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const currentDocs = formData.docs || [];
                  const newDocs = currentDocs.includes(doc.name)
                    ? currentDocs.filter(d => d !== doc.name)
                    : [...currentDocs, doc.name];
                  setFormData({ ...formData, docs: newDocs });
                }}
                style={{
                  ...styles.docCard,
                  background: formData.docs?.includes(doc.name) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: formData.docs?.includes(doc.name) ? '#22C55E' : 'rgba(56, 189, 248, 0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <span style={{ fontSize: '1.5rem' }}>{doc.icon}</span>
                   <span style={{ fontWeight: '500' }}>{doc.name}</span>
                </div>
                <div style={{
                  ...styles.checkboxNew,
                  background: formData.docs?.includes(doc.name) ? '#22C55E' : 'transparent',
                  borderColor: formData.docs?.includes(doc.name) ? '#22C55E' : 'rgba(255, 255, 255, 0.2)'
                }}>
                  {formData.docs?.includes(doc.name) && <Check size={12} color="#fff" />}
                </div>
              </motion.div>
            ))}
          </div>
        );
      }
      case 8: {
        return (
          <div style={styles.summaryGrid}>
            {[
              { label: 'Location', value: `${formData.homeState} → ${formData.currentState}`, icon: '📍' },
              { label: 'Profile', value: `${formData.gender}, ${formData.age} yrs`, icon: '👤' },
              { label: 'Work', value: formData.occupation, icon: '🛠️' },
              { label: 'Family', value: `${formData.familySize} members`, icon: '👨‍👩‍👧‍👦' },
            ].map(item => (
              <div key={item.label} style={styles.summaryItem}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</div>
                  <div style={{ fontWeight: '600' }}>{item.value || 'Not set'}</div>
                </div>
              </div>
            ))}
            <div style={{ ...styles.summaryItem, gridColumn: 'span 2' }}>
              <span>📄</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Documents</div>
                <div style={{ fontWeight: '600' }}>{formData.docs?.join(', ') || 'None selected'}</div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Form content for {steps[currentStep - 1].title} will be here.</p>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.stepperContainer}>
        {steps.map((s, idx) => (
          <div key={s.id} style={styles.stepDotWrapper}>
            <div style={{
              ...styles.stepDot,
              background: currentStep >= s.id ? '#22C55E' : 'rgba(255, 255, 255, 0.1)',
              boxShadow: currentStep === s.id ? '0 0 15px #22C55E' : 'none',
            }}>
              {currentStep > s.id ? <Check size={12} color="#fff" /> : s.id}
            </div>
            {idx < steps.length - 1 && <div style={{
              ...styles.stepLine,
              background: currentStep > s.id ? '#22C55E' : 'rgba(255, 255, 255, 0.1)',
            }} />}
          </div>
        ))}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="card"
        style={styles.panelCard}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="gold-text" style={styles.stepIndicator}>{steps[currentStep - 1].title}</span>
            <div style={styles.homeBtn} onClick={onHome}>
              <Home size={18} /> Home
            </div>
          </div>
          <h2 style={styles.question}>{steps[currentStep - 1].question}</h2>
        </div>

        <div style={styles.content}>
          {renderStepContent()}
        </div>

        <div style={styles.footer}>
          <button
            onClick={prevStep}
            style={{ ...styles.navBtn, visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft /> Back
          </button>
          <button onClick={nextStep} className="gold-button" style={styles.nextBtn}>
            {currentStep === 8 ? 'Find My Schemes' : 'Next'} <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--gradient-bg)',
    padding: '2rem',
    flexDirection: 'column',
    gap: '3rem',
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '600px',
  },
  stepDotWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#fff',
    transition: 'all 0.4s ease',
    zIndex: 2,
  },
  stepLine: {
    height: '2px',
    flex: 1,
    transition: 'all 0.4s ease',
  },
  panelCard: {
    width: '100%',
    maxWidth: '800px',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: '3rem',
  },
  stepIndicator: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    display: 'block',
  },
  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  question: {
    fontSize: '2rem',
  },
  content: {
    flex: 1,
    marginBottom: '2rem',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
  },
  nextBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 2.5rem',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  select: {
    color: 'var(--text-primary)',
    borderRadius: '4px',
    outline: 'none',
  },
  input: {
    background: 'var(--bg-primary)',
    border: '1px solid rgba(34, 211, 238, 0.2)',
    padding: '1rem',
    color: 'var(--text-primary)',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
  },
  detecting: {
    fontSize: '0.7rem',
    color: '#22C55E',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  genderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  genderCard: {
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  rangeInput: {
    width: '100%',
    height: '6px',
    background: 'rgba(56, 189, 248, 0.1)',
    borderRadius: '10px',
    appearance: 'none',
    outline: 'none',
    cursor: 'pointer',
    accentColor: '#22C55E',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1.2rem',
  },
  categoryCardNew: {
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  categoryCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  counterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'rgba(56, 189, 248, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(56, 189, 248, 0.05)',
  },
  counterControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  countBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    background: 'transparent',
    color: '#22C55E',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countVal: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    minWidth: '30px',
    textAlign: 'center',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
  },
  iconCard: {
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '120px',
  },
  iconBox: {
    color: '#22D3EE',
  },
  buttonGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  optionBtn: {
    padding: '1.2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  checkGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(34, 211, 238, 0.05)',
    padding: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid rgba(34, 211, 238, 0.1)',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    border: '2px solid',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRowNew: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.2rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(56, 189, 248, 0.05)',
  },
  familyVisual: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(34, 197, 94, 0.05)',
    borderRadius: '12px',
    minHeight: '60px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.8rem',
  },
  docCard: {
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkboxNew: {
    width: '18px',
    height: '18px',
    border: '1.5px solid',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  summaryItem: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
};

export default InputPanel;
