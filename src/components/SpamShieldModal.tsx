import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, X, RotateCcw } from 'lucide-react';
import { SpamShieldService } from '../services/spamShield';
import type { SpamShieldLog } from '../types';

interface SpamShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const SpamShieldModal: React.FC<SpamShieldModalProps> = ({
  isOpen,
  onClose,
  onRefresh
}) => {
  if (!isOpen) return null;

  const [logs, setLogs] = useState<SpamShieldLog[]>(SpamShieldService.getLogs());

  const handleClearHistory = () => {
    SpamShieldService.resetHistory();
    setLogs(SpamShieldService.getLogs());
    onRefresh();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Anti-Spam &amp; Duplicate Shield</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Guarding Dining Integrity Without Friction
              </span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Protection Mechanics Summary */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--bg-card-border)',
          marginBottom: '1.25rem'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-light)' }}>
            Active Integrity Guardrails:
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>
              <strong>1-Rating Per Meal Constraint:</strong> Students can only rate each meal (Breakfast, Lunch, Snacks, Dinner) once per calendar day.
            </li>
            <li>
              <strong>30s Rapid-Burst Cooldown:</strong> Blocks automated bot scripts and rapid multi-tap submissions.
            </li>
            <li>
              <strong>Anonymized Student Hashing:</strong> Identifiers are hashed into tokens (e.g., <code>Roll #23CS104</code>) guaranteeing privacy while upholding accountability.
            </li>
          </ul>
        </div>

        {/* Blocked Events Audit Trail */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              Recent Blocked Attacks / Anomalies ({logs.length})
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleClearHistory} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
              <RotateCcw size={11} /> Reset Audit Log
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {logs.map((log) => (
              <div 
                key={log.id}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={13} color="#fb7185" />
                    <strong>{log.actionTaken}</strong>
                    <span style={{ color: 'var(--text-dim)' }}>• {log.meal}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {log.timestamp}
                  </span>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.76rem' }}>
                  {log.reason}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.15rem', display: 'block' }}>
                  Origin Token: <code>{log.studentHash}</code>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
