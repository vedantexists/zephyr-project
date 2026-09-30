import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'shield';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      maxWidth: '380px',
      width: '100%'
    }}>
      {toasts.map((t) => {
        let border = 'rgba(99, 102, 241, 0.4)';
        let bg = 'rgba(22, 29, 46, 0.95)';
        let icon = <CheckCircle2 size={18} color="#34d399" />;

        if (t.type === 'shield' || t.type === 'error') {
          border = 'rgba(244, 63, 94, 0.4)';
          bg = 'rgba(35, 18, 26, 0.95)';
          icon = <ShieldAlert size={18} color="#fb7185" />;
        } else if (t.type === 'warning') {
          border = 'rgba(245, 158, 11, 0.4)';
          icon = <AlertCircle size={18} color="#fbbf24" />;
        }

        return (
          <div
            key={t.id}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: bg,
              border: `1px solid ${border}`,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                {t.title}
              </strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {t.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
