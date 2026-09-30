import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  ChefHat 
} from 'lucide-react';
import type { Digest, Submission } from '../../types';
import { KpiBar } from './KpiBar';
import { ClusterCard } from './ClusterCard';
import { ActionChecklist } from './ActionChecklist';
import { MealDayCharts } from '../charts/MealDayCharts';

interface DigestViewProps {
  digest: Digest;
  submissions: Submission[];
  onRefresh: () => void;
}

export const DigestView: React.FC<DigestViewProps> = ({
  digest,
  submissions,
  onRefresh
}) => {
  const [copied, setCopied] = useState(false);

  const copyWhatsAppDispatch = () => {
    const text = `*CAMPUS MESS SHIFT BRIEFING*
*Date:* ${new Date().toLocaleDateString()} (${digest.generatedAt})
*Rating:* ${digest.overallRating.toFixed(1)}/5.0 (+${digest.wowDelta.toFixed(1)} WoW) | ${digest.totalSubmissions} Meals Logged | ${digest.blockedCount} Spam Filtered

*PRIMARY BOTTLENECK:*
${digest.topClusters[0]?.title || 'None'}
- Diner note: "${digest.topClusters[0]?.representativeQuote || ''}"
- Directive: ${digest.topClusters[0]?.recommendedAction || ''}

*SECONDARY BOTTLENECK:*
${digest.topClusters[1]?.title || 'None'}
- Directive: ${digest.topClusters[1]?.recommendedAction || ''}

*KITCHEN TASKS:*
${digest.actionChecklist.map(a => `[ ] (${a.role}) ${a.directive} [${a.urgency}]`).join('\n')}

*DINER COMMENDATIONS:*
${digest.positives[0] || 'Standard meal shift completed without incident.'}

Generated via ZephyrMess Dining Platform`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Header & Headline Card */}
      <div className="glass-panel" style={{ padding: '1.6rem 1.85rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative gradient strip at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--primary-gradient)',
          opacity: 0.85
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-emerald">
                <Sparkles size={11} /> Weekly shift summary
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Updated at {digest.generatedAt}
              </span>
            </div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--text-main) 40%, var(--primary-light) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Weekly dining digest
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-emerald btn-sm"
              onClick={copyWhatsAppDispatch}
              title="Copy formatted summary for staff WhatsApp group"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied update' : 'Copy WhatsApp update'}</span>
            </button>

            <button 
              className="btn btn-outline btn-sm"
              onClick={() => window.print()}
              title="Print shift handover briefing"
            >
              <Printer size={14} />
              <span>Print handover</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={onRefresh}
              title="Recalculate metrics from latest submissions"
            >
              <Sparkles size={14} />
              <span>Update metrics</span>
            </button>
          </div>
        </div>

        {/* Headline Card */}
        <div style={{ 
          padding: '1.1rem 1.3rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--primary-subtle) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderLeft: '4px solid',
          borderImage: 'var(--primary-gradient) 1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Soft glow behind icon */}
          <div style={{
            position: 'absolute',
            left: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '60px',
            height: '60px',
            background: 'var(--primary-glow)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />
          <ChefHat size={24} color="var(--primary-light)" style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shift briefing summary
            </span>
            <p style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.5 }}>
              {digest.headline}
            </p>
          </div>
        </div>
      </div>

      {/* 2. KPI Bar */}
      <KpiBar digest={digest} />

      {/* 3. Top 3 Clusters & Action Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Top 3 Grievance Clusters */}
        <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Priority kitchen bottlenecks
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Ranked by frequency, student ratings, and keywords
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {digest.topClusters.map(c => (
              <ClusterCard key={c.id} cluster={c} />
            ))}
          </div>
        </div>

        {/* Action Checklist & Anomalies */}
        <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Checklist */}
          <ActionChecklist initialActions={digest.actionChecklist} />

          {/* 4. Anomalies Card */}
          {digest.anomalies.length > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, var(--rose-subtle) 0%, rgba(244, 63, 94, 0.05) 100%)', 
              border: '1px solid rgba(244, 63, 94, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem 1.15rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Rose glow accent */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '80px',
                height: '80px',
                background: 'var(--rose-glow)',
                borderRadius: '50%',
                filter: 'blur(25px)',
                pointerEvents: 'none'
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--rose-light)', marginBottom: '0.5rem', position: 'relative' }}>
                <AlertTriangle size={15} />
                <strong style={{ fontSize: '0.86rem' }}>Low-scoring meal services (ratings &gt;0.6 below weekly average)</strong>
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
                {digest.anomalies.map((anom, idx) => (
                  <li key={idx}>
                    <strong style={{ color: 'var(--text-main)' }}>{anom.day} {anom.meal}</strong> ({anom.avgRating.toFixed(1)}/5.0, {anom.deltaFromMean} below mean): {anom.issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Positives Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--emerald-subtle) 0%, rgba(16, 185, 129, 0.05) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Emerald glow accent */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              width: '80px',
              height: '80px',
              background: 'var(--emerald-glow)',
              borderRadius: '50%',
              filter: 'blur(25px)',
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--emerald-light)', marginBottom: '0.5rem', position: 'relative' }}>
              <CheckCircle2 size={15} />
              <strong style={{ fontSize: '0.86rem' }}>Kitchen commendations</strong>
            </div>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', position: 'relative' }}>
              {digest.positives.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* 8. Compact Chart Panel */}
      <MealDayCharts submissions={submissions} />

    </div>
  );
};
