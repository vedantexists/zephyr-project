import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import type { Cluster } from '../../types';

interface ClusterCardProps {
  cluster: Cluster;
}

export const ClusterCard: React.FC<ClusterCardProps> = ({ cluster }) => {
  const isCritical = cluster.severity === 'critical';
  const isHigh = cluster.severity === 'high';

  return (
    <div className="cluster-card" style={{
      borderLeft: `4px solid ${isCritical ? 'var(--rose)' : isHigh ? 'var(--saffron)' : 'var(--primary-light)'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span className={`badge badge-${isCritical ? 'rose' : isHigh ? 'amber' : 'indigo'}`} style={{ textTransform: 'capitalize' }}>
              {cluster.severity} priority &bull; {cluster.count} reports
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Severity score: {cluster.severityScore}
            </span>
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
            {cluster.title}
          </h4>
        </div>

        {cluster.medianTime && (
          <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} />
            Median time: {cluster.medianTime}
          </span>
        )}
      </div>

      {/* Representative Centroid Quote */}
      <div className="quote-box">
        "{cluster.representativeQuote}"
      </div>

      {/* Recommended Kitchen Action */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '0.5rem', 
        fontSize: '0.82rem', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--bg-card-border)',
        padding: '0.6rem 0.85rem', 
        borderRadius: 'var(--radius-sm)' 
      }}>
        <CheckCircle size={15} color="var(--emerald-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong style={{ color: 'var(--emerald-light)', fontWeight: 700 }}>Action directive: </strong>
          {cluster.recommendedAction}
        </span>
      </div>
    </div>
  );
};
