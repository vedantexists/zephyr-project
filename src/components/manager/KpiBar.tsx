import React from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck, Users, Star } from 'lucide-react';
import type { Digest } from '../../types';

interface KpiBarProps {
  digest: Digest;
}

export const KpiBar: React.FC<KpiBarProps> = ({ digest }) => {
  return (
    <div className="kpi-grid">
      {/* Overall & WoW */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Overall Campus Rating</span>
          <Star size={15} color="#fbbf24" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{digest.overallRating.toFixed(1)}</span>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>/ 5.0</span>
          <span className="kpi-trend positive" style={{ marginLeft: 'auto' }}>
            <TrendingUp size={14} /> +{digest.wowDelta.toFixed(1)} WoW
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Prior week baseline: {digest.priorWeekRating.toFixed(1)} / 5.0
        </span>
      </div>

      {/* Submissions Count */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Verified Meal Responses</span>
          <Users size={15} color="#818cf8" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{digest.totalSubmissions}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
            meal logs
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Full 7-day campus aggregation
        </span>
      </div>

      {/* Red Alerts / Anomalies */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Operational Red Flags</span>
          <AlertTriangle size={15} color="#fb7185" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: '#fb7185' }}>
            {digest.redAlertsCount}
          </span>
          <span className="badge badge-rose" style={{ alignSelf: 'center', marginLeft: '0.5rem' }}>
            Attention
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Wed Lunch stockout &amp; Tue Dinner cold chapati
        </span>
      </div>

      {/* Spam Shield Counter */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Spam &amp; Duplicate Shield</span>
          <ShieldCheck size={15} color="#34d399" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: '#34d399' }}>
            {digest.blockedCount}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            blocked
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Protected rating integrity from vote skewing
        </span>
      </div>
    </div>
  );
};
