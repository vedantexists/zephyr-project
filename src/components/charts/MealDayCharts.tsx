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
    <div className="glass-panel" style={{ padding: '1.35rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
        <BarChart2 size={17} color="var(--primary-light)" />
        <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
          Meal service and daily ratings
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Panel 1: Meal Ratings Bar Chart */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.9rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Utensils size={15} />
            <span>Ratings by meal service</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {meals.map(m => {
              const data = stats.mealMeans[m];
              const pct = (data.avg / 5) * 100;
              const isLow = m === 'Lunch';
              const isHigh = m === 'Breakfast';
              return (
                <div key={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>{m}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      <strong>{data.avg.toFixed(2)}</strong> / 5.0 ({data.count} meals)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-card-border)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: isLow ? 'var(--rose)' : isHigh ? 'var(--emerald)' : 'var(--primary-light)',
                        borderRadius: '999px',
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
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.9rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Calendar size={15} />
            <span>7-day average satisfaction</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '0.45rem', paddingTop: '0.5rem' }}>
            {days.map(d => {
              const data = stats.dayMeans[d];
              const heightPct = Math.max(16, (data.avg / 5) * 100);
              const isWed = d === 'Wed';
              const isSun = d === 'Sun';
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isWed ? 'var(--rose-light)' : isSun ? 'var(--emerald-light)' : 'var(--text-muted)' }}>
                    {data.avg.toFixed(1)}
                  </span>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${heightPct}%`, 
                      background: isWed ? 'var(--rose)' : isSun ? 'var(--emerald)' : 'var(--primary-light)',
                      opacity: isWed || isSun ? 1 : 0.8,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }} 
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
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
