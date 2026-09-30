import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Printer, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ChefHat, 
  MessageSquare, 
  CheckCircle2, 
  Copy
} from 'lucide-react';
import type { ExecutiveDigest, FeedbackSubmission } from '../types';

interface ManagerDashboardProps {
  digest: ExecutiveDigest;
  submissions: FeedbackSubmission[];
  onRefreshDigest: () => void;
  isGenerating: boolean;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  digest,
  onRefreshDigest,
  isGenerating
}) => {
  const [checklist, setChecklist] = useState(digest.kitchenActionChecklist);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  React.useEffect(() => {
    setChecklist(digest.kitchenActionChecklist);
  }, [digest]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const copyWhatsAppFormat = () => {
    const text = `📢 *MESS COMMITTEE DAILY KITCHEN DIRECTIVE*
📅 Date: ${new Date().toLocaleDateString()} | Time: ${digest.generatedAt}
📊 *Dining Rating:* ${digest.overallRating}/5.0 (Delta: +0.3 WoW)
👥 *Total Responses:* ${digest.totalFeedbackCount} | 🛡️ *Spam Blocked:* ${digest.spamShieldedCount}

🔴 *CRITICAL BOTTLENECK:*
${digest.topGrievanceClusters[0]?.title || 'None'}
↳ Quote: "${digest.topGrievanceClusters[0]?.sampleQuotes[0] || ''}"
↳ Directive: ${digest.topGrievanceClusters[0]?.actionItem || ''}

⚠️ *SECONDARY ISSUE:*
${digest.topGrievanceClusters[1]?.title || 'None'}
↳ Directive: ${digest.topGrievanceClusters[1]?.actionItem || ''}

✅ *KITCHEN SHIFT CHECKLIST:*
${checklist.map(c => `${c.completed ? '☑️' : '◻️'} [${c.role}] ${c.action} (${c.urgency})`).join('\n')}

🌟 *STAFF APPRECIATION:*
${digest.positiveHighlights[0] || 'Great service recorded today.'}

_Generated via ZephyrMess AI Kitchen Intelligence_`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Digest Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-emerald">
                <Sparkles size={12} />
                2-Minute Executive Digest
              </span>
              <span className="badge badge-indigo">
                <Clock size={12} />
                Read time: ~{digest.estimatedReadTimeSeconds}s (Under 2-min limit)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Powered by: <strong>{digest.aiEngineUsed}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Daily Mess Committee Synthesis</h2>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-emerald btn-sm"
              onClick={copyWhatsAppFormat}
              title="Copy formatted message for Kitchen Staff WhatsApp group"
            >
              <Copy size={14} />
              <span>{copiedWhatsApp ? 'Copied to Clipboard!' : 'Copy WhatsApp Digest'}</span>
            </button>

            <button 
              className="btn btn-outline btn-sm"
              onClick={triggerPrint}
              title="Print shift handover briefing sheet"
            >
              <Printer size={14} />
              <span>Print Handover</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={onRefreshDigest}
              disabled={isGenerating}
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Synthesizing...' : 'Re-Synthesize'}</span>
            </button>
          </div>
        </div>

        {/* 1-Sentence Executive Bottom Line */}
        <div style={{ 
          marginTop: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.1)',
          borderLeft: '4px solid var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ChefHat size={22} color="#818cf8" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Executive Headline (TL;DR):
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.1rem' }}>
              {digest.executiveHeadline}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Overall Campus Satisfaction</span>
            <TrendingUp size={16} color="#34d399" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{digest.overallRating}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ 5.0</span>
            <span className="kpi-trend positive">
              +{digest.ratingDeltaWoW} WoW
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Aggregated across {digest.totalFeedbackCount} meal logs this week
          </span>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Active Critical Alert</span>
            <AlertTriangle size={16} color="#f43f5e" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#fb7185' }}>1:15 PM</span>
            <span className="badge badge-rose" style={{ alignSelf: 'center' }}>Stockout</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Wednesday Lunch Chole/Rice refill collapsed
          </span>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Peak Satisfaction Meal</span>
            <Sparkles size={16} color="#fbbf24" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#fcd34d' }}>4.8</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ 5.0</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Sunday Special Breakfast (Dosa & Sambar)
          </span>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span>Spam & Duplicate Shield</span>
            <ShieldCheck size={16} color="#34d399" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#34d399' }}>{digest.spamShieldedCount}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Attempts blocked</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Prevented single-student score manipulation
          </span>
        </div>
      </div>

      {/* 5-Pillar Scorecard Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>5 Operational Pillars Health Card</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Threshold: &gt;4.0 Healthy | 3.0-3.9 Warning | &lt;3.0 Critical
          </span>
        </div>

        <div className="pillars-grid">
          <div className={`glass-panel pillar-card ${digest.pillars.taste_temperature.status}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Taste &amp; Temperature</span>
              <span className={`badge badge-${digest.pillars.taste_temperature.status === 'healthy' ? 'emerald' : digest.pillars.taste_temperature.status === 'warning' ? 'amber' : 'rose'}`}>
                {digest.pillars.taste_temperature.score} / 5.0
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {digest.pillars.taste_temperature.summary}
            </p>
          </div>

          <div className={`glass-panel pillar-card ${digest.pillars.portion_stockout.status}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Portion &amp; Stockouts</span>
              <span className={`badge badge-${digest.pillars.portion_stockout.status === 'healthy' ? 'emerald' : digest.pillars.portion_stockout.status === 'warning' ? 'amber' : 'rose'}`}>
                {digest.pillars.portion_stockout.score} / 5.0
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {digest.pillars.portion_stockout.summary}
            </p>
          </div>

          <div className={`glass-panel pillar-card ${digest.pillars.hygiene_cleanliness.status}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Hygiene &amp; Cleanliness</span>
              <span className={`badge badge-${digest.pillars.hygiene_cleanliness.status === 'healthy' ? 'emerald' : digest.pillars.hygiene_cleanliness.status === 'warning' ? 'amber' : 'rose'}`}>
                {digest.pillars.hygiene_cleanliness.score} / 5.0
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {digest.pillars.hygiene_cleanliness.summary}
            </p>
          </div>

          <div className={`glass-panel pillar-card ${digest.pillars.queue_speed.status}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Queue &amp; Service Speed</span>
              <span className={`badge badge-${digest.pillars.queue_speed.status === 'healthy' ? 'emerald' : digest.pillars.queue_speed.status === 'warning' ? 'amber' : 'rose'}`}>
                {digest.pillars.queue_speed.score} / 5.0
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {digest.pillars.queue_speed.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Clustered Grievances & Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#818cf8" />
              AI Clustered Grievances (Top Bottlenecks)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Grouped across 900+ submissions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {digest.topGrievanceClusters.map((cluster) => (
              <div key={cluster.id} className="cluster-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <span className={`badge badge-${cluster.severity === 'critical' ? 'rose' : cluster.severity === 'high' ? 'amber' : 'indigo'}`} style={{ marginBottom: '0.3rem' }}>
                      {cluster.severity.toUpperCase()} PRIORITY ({cluster.reportCount} reports)
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cluster.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Window: {cluster.day || ''} {cluster.meal}
                    </span>
                  </div>
                </div>

                <div className="quote-box">
                  "{cluster.sampleQuotes[0]}"
                </div>

                <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: 'var(--emerald)' }}>Fix:</strong>
                  <span>{cluster.actionItem}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChefHat size={18} color="#34d399" />
              Head Cook Operational Checklist
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Interactive shift briefing
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checklist.map((item) => (
              <div 
                key={item.id} 
                className={`action-item ${item.completed ? 'done' : ''}`}
                onClick={() => toggleChecklistItem(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ marginTop: '2px', color: item.completed ? '#34d399' : 'var(--text-dim)' }}>
                  {item.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                      {item.role}
                    </span>
                    <span className={`badge badge-${item.urgency === 'Immediate' ? 'rose' : item.urgency === 'Today' ? 'amber' : 'emerald'}`} style={{ fontSize: '0.65rem' }}>
                      {item.urgency}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: item.completed ? 'var(--text-dim)' : 'var(--text-main)' }}>
                    {item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#34d399' }}>
              <CheckCircle2 size={16} />
              <strong style={{ fontSize: '0.85rem' }}>Kitchen Staff Praise &amp; Wins</strong>
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {digest.positiveHighlights.map((win, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>{win}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
