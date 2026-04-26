import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/react';
import { useTranslation } from 'react-i18next';

const DocumentScanner = ({ onDataExtracted, onClose }) => {
  const { getToken } = useAuth();
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');
      const token = await getToken();

      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${apiUrl}/process-document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setResult(res.data.extracted_data);
      } else {
        setError(res.data.error || 'Failed to process document');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process document. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const applyExtractedData = () => {
    if (result && onDataExtracted) {
      onDataExtracted(result);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={styles.overlay}
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--accent-primary)" />
            <h3 style={styles.title}>Document Scanner</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        {!preview && !processing && !result && (
          <div
            style={{
              ...styles.dropZone,
              borderColor: dragOver ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              background: dragOver ? 'rgba(34, 211, 238, 0.05)' : 'rgba(255,255,255,0.02)'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} color="var(--text-secondary)" />
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 0.5rem' }}>
              Drop your Aadhar, PAN, or Ration Card here
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              or click to browse • JPG, PNG supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        )}

        {preview && !result && (
          <div style={styles.previewArea}>
            <img src={preview} alt="Document preview" style={styles.previewImg} />
            {processing && (
              <div style={styles.processingOverlay}>
                <Loader2 size={32} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#fff', marginTop: '0.5rem' }}>Scanning document with AI...</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} color="#EF4444" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div style={styles.resultArea}>
            <div style={styles.resultHeader}>
              <CheckCircle size={20} color="#22C55E" />
              <span style={{ color: '#22C55E', fontWeight: '600' }}>Data Extracted Successfully</span>
            </div>
            <div style={styles.resultGrid}>
              {Object.entries(result).map(([key, value]) => (
                value && (
                  <div key={key} style={styles.resultItem}>
                    <span style={styles.resultLabel}>{key.replace(/_/g, ' ').toUpperCase()}</span>
                    <span style={styles.resultValue}>{value}</span>
                  </div>
                )
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="gold-button" onClick={applyExtractedData} style={{ flex: 1 }}>
                Apply to Profile
              </button>
              <button onClick={() => { setResult(null); setPreview(null); }} style={styles.retryBtn}>
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: 'var(--glass-bg, rgba(15,15,35,0.95))',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '2rem',
    width: '90%', maxWidth: '500px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: { color: '#fff', fontSize: '1.1rem', margin: 0 },
  closeBtn: {
    background: 'none', border: 'none', color: 'var(--text-secondary)',
    cursor: 'pointer', padding: '4px',
  },
  dropZone: {
    border: '2px dashed', borderRadius: '12px',
    padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  previewArea: { position: 'relative', borderRadius: '12px', overflow: 'hidden' },
  previewImg: { width: '100%', borderRadius: '12px', maxHeight: '300px', objectFit: 'cover' },
  processingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#EF4444', fontSize: '0.85rem',
    marginTop: '1rem',
  },
  resultArea: { marginTop: '0.5rem' },
  resultHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  resultItem: {
    background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  resultLabel: { display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' },
  resultValue: { color: '#fff', fontSize: '0.9rem', fontWeight: '500' },
  retryBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.5rem 1rem',
    cursor: 'pointer', fontSize: '0.85rem',
  },
};

export default DocumentScanner;
