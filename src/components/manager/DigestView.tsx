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
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-emerald">
                <Sparkles size={11} /> Weekly shift summary
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Updated at {digest.generatedAt}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
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

        {/* Headline (One sentence, computed facts) */}
        <div style={{ 
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-subtle)',
          borderLeft: '4px solid var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <ChefHat size={22} color="var(--primary-light)" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Shift briefing summary:
            </span>
            <p style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem', lineHeight: 1.45 }}>
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
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
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
        <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Checklist */}
          <ActionChecklist initialActions={digest.actionChecklist} />

          {/* 4. Anomalies Card */}
          {digest.anomalies.length > 0 && (
            <div style={{ 
              background: 'var(--rose-subtle)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.95rem 1.1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--rose-light)', marginBottom: '0.45rem' }}>
                <AlertTriangle size={15} />
                <strong style={{ fontSize: '0.86rem' }}>Low-scoring meal services (ratings &gt;0.6 below weekly average)</strong>
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
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
            background: 'var(--emerald-subtle)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.95rem 1.1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--emerald-light)', marginBottom: '0.45rem' }}>
              <CheckCircle2 size={15} />
              <strong style={{ fontSize: '0.86rem' }}>Kitchen commendations</strong>
            </div>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
