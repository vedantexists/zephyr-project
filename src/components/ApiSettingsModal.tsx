import React, { useState } from 'react';
import { Settings, Sparkles, X, Key, CheckCircle2, Cpu } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(GeminiService.getApiKey());
  const [aiMode, setAiMode] = useState<'live' | 'edge'>(GeminiService.getAiMode());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    GeminiService.setApiKey(apiKey);
    GeminiService.setAiMode(aiMode);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSave();
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AI Engine &amp; API Configuration</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Dual-Engine: Gemini 2.5 Flash + Deterministic Edge Fallback
              </span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Engine Selection Toggle */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
            Select Active AI Engine:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setAiMode('live')}
              className={`btn ${aiMode === 'live' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} />
                <strong>Gemini 2.5 Flash</strong>
              </div>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Live Cloud Synthesis</span>
            </button>

            <button
              type="button"
              onClick={() => setAiMode('edge')}
              className={`btn ${aiMode === 'edge' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} />
                <strong>Edge NLP Engine</strong>
              </div>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Instant / Offline / Zero Quota</span>
            </button>
          </div>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span>Gemini API Key:</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Optional for offline testing
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy... (leave blank to use Edge NLP Engine)"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem'
              }}
            />
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
            Can also be configured via <code>.env</code> as <code>VITE_GEMINI_API_KEY</code>.
          </p>
        </div>

        {/* Resiliency Assurance Notice */}
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.08)', 
          border: '1px solid rgba(16, 185, 129, 0.25)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.75rem 1rem', 
          marginBottom: '1.25rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <strong style={{ color: '#34d399', display: 'block', marginBottom: '0.2rem' }}>
            🛡️ High-Reliability Hackathon Architecture
          </strong>
          If an API key is omitted, invalid, or reaches rate limits, the system automatically falls back to the deterministic local NLP engine. The executive digest and test cases will never crash or hang!
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            {savedSuccess ? (
              <>
                <CheckCircle2 size={14} /> Saved!
              </>
            ) : (
              'Save & Apply'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
