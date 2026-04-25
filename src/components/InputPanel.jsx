import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Truck, Hammer, User, Briefcase, Plus, Check } from 'lucide-react';

const steps = [
  { id: 1, title: 'Location', question: 'Where are you currently located?' },
  { id: 2, title: 'Personal Info', question: 'Tell us a bit about yourself.' },
  { id: 3, title: 'Work Profile', question: 'What is your primary occupation?' },
  { id: 4, title: 'Income', question: 'What is your monthly income range?' },
  { id: 5, title: 'Social Category', question: 'Select your social category.' },
  { id: 6, title: 'Family Details', question: 'Tell us about your family.' },
  { id: 7, title: 'Documents', question: 'Which documents do you currently have?' },
];

const InputPanel = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
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
              <select style={styles.select}><option>Uttar Pradesh</option><option>Bihar</option><option>West Bengal</option></select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current State</label>
              <select style={styles.select}><option>Maharashtra</option><option>Delhi</option><option>Karnataka</option></select>
            </div>
          </div>
        );
      case 3:
        const occupations = [
          { name: 'Labor', icon: <Hammer /> },
          { name: 'Driver', icon: <Truck /> },
          { name: 'Domestic Worker', icon: <User /> },
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
                onClick={() => setFormData({ ...formData, occupation: occ.name })}
                style={{
                  ...styles.iconCard,
                  borderColor: formData.occupation === occ.name ? '#40E0D0' : 'rgba(255,255,255,0.1)',
                  background: formData.occupation === occ.name ? 'rgba(64, 224, 208, 0.1)' : '#1a1a1a',
                }}
              >
                <div style={styles.iconBox}>{occ.icon}</div>
                <span>{occ.name}</span>
              </motion.div>
            ))}
          </div>
        );
      case 4:
        const ranges = ['Below ₹5,000', '₹5,000 - ₹15,000', '₹15,000 - ₹30,000', 'Above ₹30,000'];
        return (
          <div style={styles.buttonGrid}>
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setFormData({ ...formData, income: r })}
                style={{
                  ...styles.optionBtn,
                  background: formData.income === r ? '#40E0D0' : '#1a1a1a',
                  color: formData.income === r ? '#000' : '#fff',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        );
      case 7:
        const docs = ['Aadhaar', 'Ration Card', 'Income Certificate', 'Bank Account', 'MNREGA Job Card'];
        return (
          <div style={styles.checkGrid}>
            {docs.map((doc) => (
              <div
                key={doc}
                onClick={() => {
                  const currentDocs = formData.docs || [];
                  const newDocs = currentDocs.includes(doc)
                    ? currentDocs.filter(d => d !== doc)
                    : [...currentDocs, doc];
                  setFormData({ ...formData, docs: newDocs });
                }}
                style={styles.checkItem}
              >
                <div style={{
                  ...styles.checkbox,
                  background: formData.docs?.includes(doc) ? '#40E0D0' : 'transparent',
                  borderColor: '#40E0D0'
                }}>
                  {formData.docs?.includes(doc) && <Check size={14} color="#000" />}
                </div>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        );
      default:
        return <p style={{ textAlign: 'center', color: '#A1A1AA' }}>Form content for {steps[currentStep - 1].title} will be here.</p>;
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="card"
        style={styles.panelCard}
      >
        <div style={styles.header}>
          <span className="gold-text" style={styles.stepIndicator}>Step {currentStep} of 7</span>
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
            {currentStep === 7 ? 'Find My Schemes' : 'Next'} <ChevronRight size={20} />
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
    background: '#0B0B0B',
    padding: '2rem',
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
    marginBottom: '1rem',
    display: 'block',
  },
  question: {
    fontSize: '2rem',
  },
  content: {
    flex: 1,
    marginBottom: '3rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    background: 'transparent',
    color: '#A1A1AA',
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
    color: '#A1A1AA',
    fontSize: '0.9rem',
  },
  select: {
    background: '#1a1a1a',
    border: '1px solid rgba(64, 224, 208, 0.2)',
    padding: '1rem',
    color: '#fff',
    borderRadius: '4px',
    outline: 'none',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1.5rem',
  },
  iconCard: {
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  iconBox: {
    color: '#40E0D0',
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
    background: '#1a1a1a',
    padding: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid rgba(64, 224, 208, 0.1)',
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
};

export default InputPanel;
