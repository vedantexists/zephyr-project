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
      borderLeft: `4px solid ${isCritical ? 'var(--rose)' : isHigh ? 'var(--amber)' : 'var(--primary-light)'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span className={`badge badge-${isCritical ? 'rose' : isHigh ? 'amber' : 'indigo'}`}>
              {cluster.severity.toUpperCase()} ({cluster.count} reports)
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Score: {cluster.severityScore}
            </span>
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {cluster.title}
          </h4>
        </div>

        {cluster.medianTime && (
          <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} />
            Median: {cluster.medianTime}
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
        gap: '0.45rem', 
        fontSize: '0.8rem', 
        background: 'rgba(0, 0, 0, 0.2)', 
        padding: '0.5rem 0.75rem', 
        borderRadius: 'var(--radius-sm)' 
      }}>
        <CheckCircle size={14} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong style={{ color: '#34d399' }}>Action: </strong>
          {cluster.recommendedAction}
        </span>
      </div>
    </div>
  );
};
