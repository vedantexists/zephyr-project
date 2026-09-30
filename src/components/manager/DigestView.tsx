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
    const text = `📢 *CAMPUS MESS FEEDBACK DIGEST*
📅 *Shift Summary:* ${new Date().toLocaleDateString()} (${digest.generatedAt})
📊 *Score:* ${digest.overallRating.toFixed(1)}/5.0 (+${digest.wowDelta.toFixed(1)} WoW) | 👥 ${digest.totalSubmissions} Meals | 🛡️ ${digest.blockedCount} Blocked

🔴 *TOP BOTTLENECK:*
${digest.topClusters[0]?.title || 'None'}
↳ Quote: "${digest.topClusters[0]?.representativeQuote || ''}"
↳ Directive: ${digest.topClusters[0]?.recommendedAction || ''}

⚠️ *SECONDARY ISSUE:*
${digest.topClusters[1]?.title || 'None'}
↳ Directive: ${digest.topClusters[1]?.recommendedAction || ''}

✅ *KITCHEN ACTIONS:*
${digest.actionChecklist.map(a => `◻️ [${a.role}] ${a.directive} (${a.urgency})`).join('\n')}

🌟 *STAFF PRAISE:*
${digest.positives[0] || 'Good shift operation.'}

_Generated via ZephyrMess AI Dining Intelligence_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Header & Headline Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-emerald">
                <Sparkles size={11} /> 2-Minute Executive Digest
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Generated at {digest.generatedAt}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Campus Dining Daily Synthesis
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-emerald btn-sm"
              onClick={copyWhatsAppDispatch}
              title="Copy formatted WhatsApp message for Kitchen Staff group"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied Dispatch!' : 'Copy WhatsApp Dispatch'}</span>
            </button>

            <button 
              className="btn btn-outline btn-sm"
              onClick={() => window.print()}
              title="Print shift handover briefing"
            >
              <Printer size={14} />
              <span>Print Handover</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={onRefresh}
              title="Recalculate digest from updated dataset"
            >
              <Sparkles size={14} />
              <span>Recalculate</span>
            </button>
          </div>
        </div>

        {/* Headline (One sentence, computed facts) */}
        <div style={{ 
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.1)',
          borderLeft: '4px solid var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ChefHat size={22} color="#818cf8" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Executive Bottom Line:
            </span>
            <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.1rem', lineHeight: 1.4 }}>
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
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              Top 3 Recurring Bottlenecks
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Ranked by severity score formula
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {digest.topClusters.map(c => (
              <ClusterCard key={c.id} cluster={c} />
            ))}
          </div>
        </div>

        {/* Action Checklist & Anomalies */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Checklist */}
          <ActionChecklist initialActions={digest.actionChecklist} />

          {/* 4. Anomalies Card */}
          {digest.anomalies.length > 0 && (
            <div style={{ 
              background: 'rgba(244, 63, 94, 0.06)', 
              border: '1px solid rgba(244, 63, 94, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185', marginBottom: '0.4rem' }}>
                <AlertTriangle size={15} />
                <strong style={{ fontSize: '0.85rem' }}>Meal-Day Rating Anomalies (&gt;0.6 below mean)</strong>
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {digest.anomalies.map((anom, idx) => (
                  <li key={idx}>
                    <strong>{anom.day} {anom.meal}</strong> ({anom.avgRating.toFixed(1)}/5.0, {anom.deltaFromMean} delta): {anom.issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Positives Card */}
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem 1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={15} />
              <strong style={{ fontSize: '0.85rem' }}>Kitchen Staff Commendations</strong>
            </div>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
