import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import type { Embedder } from '../types';

interface EngineBadgeProps {
  engine: Embedder['name'];
  onToggle?: () => void;
  canToggle?: boolean;
}

export const EngineBadge: React.FC<EngineBadgeProps> = ({
  engine,
  onToggle,
  canToggle = false
}) => {
  return (
    <div 
      className="engine-badge-box"
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.45rem',
        padding: '0.3rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        background: engine === 'semantic' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
        border: `1px solid ${engine === 'semantic' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(99, 102, 241, 0.35)'}`,
        fontSize: '0.78rem',
        fontWeight: 700,
        color: engine === 'semantic' ? '#34d399' : '#a5b4fc',
        cursor: canToggle ? 'pointer' : 'default'
      }}
      onClick={canToggle ? onToggle : undefined}
      title={engine === 'semantic' ? 'Semantic Engine: MiniLM embeddings via transformers.js' : 'Lightweight Engine: Hinglish lexicon + hashed n-gram vectors (Zero downloads/WASM)'}
    >
      <span className="pulse-dot" style={{ background: engine === 'semantic' ? '#34d399' : '#818cf8' }} />
      {engine === 'semantic' ? (
        <>
          <Cpu size={14} />
          <span>Semantic Engine (MiniLM)</span>
        </>
      ) : (
        <>
          <Zap size={14} />
          <span>Lightweight Engine (n-gram + Hinglish)</span>
        </>
      )}
    </div>
  );
};
