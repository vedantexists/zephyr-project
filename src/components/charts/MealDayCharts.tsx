import React from 'react';
import { BarChart2, Calendar, Utensils } from 'lucide-react';
import type { Submission, Meal, Day } from '../../types';
import { calculateStats } from '../../lib/stats';

interface MealDayChartsProps {
  submissions: Submission[];
}

export const MealDayCharts: React.FC<MealDayChartsProps> = ({ submissions }) => {
  const stats = calculateStats(submissions);
  const meals: Meal[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
        <BarChart2 size={16} color="#818cf8" />
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>
          Visual Meal &amp; Day Trend Analytics
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Panel 1: Meal Ratings Bar Chart */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Utensils size={14} />
            <span>Rating by Meal Window</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {meals.map(m => {
              const data = stats.mealMeans[m];
              const pct = (data.avg / 5) * 100;
              const isLow = m === 'Lunch';
              const isHigh = m === 'Breakfast';
              return (
                <div key={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600 }}>{m}</span>
                    <span>
                      <strong>{data.avg.toFixed(2)}</strong> / 5.0 ({data.count})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--bg-card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: isLow ? 'var(--rose)' : isHigh ? 'var(--emerald)' : 'var(--primary-light)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: 7-Day Day-by-Day Satisfaction Trend (SVG Bar Graph) */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>7-Day Satisfaction Trend</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '115px', gap: '0.35rem', paddingTop: '0.5rem' }}>
            {days.map(d => {
              const data = stats.dayMeans[d];
              const heightPct = Math.max(15, (data.avg / 5) * 100);
              const isWed = d === 'Wed';
              const isSun = d === 'Sun';
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isWed ? '#fb7185' : isSun ? '#34d399' : 'var(--text-muted)' }}>
                    {data.avg.toFixed(1)}
                  </span>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${heightPct}%`, 
                      background: isWed ? 'var(--rose)' : isSun ? 'var(--emerald)' : 'rgba(99, 102, 241, 0.65)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s ease'
                    }} 
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {d}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
