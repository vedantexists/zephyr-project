import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Users, Star } from 'lucide-react';
import type { Digest } from '../../types';

interface KpiBarProps {
  digest: Digest;
}

export const KpiBar: React.FC<KpiBarProps> = ({ digest }) => {
  const isPositiveWoW = digest.wowDelta >= 0;

  return (
    <div className="kpi-grid">
      {/* Overall & WoW */}
      <div className="glass-panel kpi-card saffron-accent">
        <div className="kpi-header">
          <span>Average dining rating</span>
          <Star size={16} color="var(--saffron-light)" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{digest.overallRating.toFixed(1)}</span>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>/ 5.0</span>
          <span className={`kpi-trend ${isPositiveWoW ? 'positive' : 'negative'}`} style={{ marginLeft: 'auto' }}>
            {isPositiveWoW ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
            {isPositiveWoW ? `+${digest.wowDelta.toFixed(1)}` : digest.wowDelta.toFixed(1)} WoW
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Prior week average: {digest.priorWeekRating.toFixed(1)} / 5.0
        </span>
      </div>

      {/* Submissions Count */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span>Total verified meals</span>
          <Users size={16} color="var(--primary-light)" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{digest.totalSubmissions}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
            submissions
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Across all 4 daily meal services
        </span>
      </div>

      {/* Red Alerts / Anomalies */}
      <div className="glass-panel kpi-card rose-accent">
        <div className="kpi-header">
          <span>Active alerts</span>
          <AlertTriangle size={16} color="var(--rose-light)" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: 'var(--rose-light)' }}>
            {digest.redAlertsCount}
          </span>
          <span className="badge badge-rose" style={{ alignSelf: 'center', marginLeft: '0.5rem' }}>
            {digest.redAlertsCount === 1 ? '1 issue' : `${digest.redAlertsCount} issues`}
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Tuesday dinner chapati and Wednesday lunch stockout
        </span>
      </div>

      {/* Spam Shield Counter */}
      <div className="glass-panel kpi-card emerald-accent">
        <div className="kpi-header">
          <span>Filtered spam &amp; duplicates</span>
          <ShieldCheck size={16} color="var(--emerald-light)" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: 'var(--emerald-light)' }}>
            {digest.blockedCount}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            blocked
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Protected rating integrity from repeat submissions
        </span>
      </div>
    </div>
  );
};

