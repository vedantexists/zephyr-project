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

  const getBarGradient = (meal: Meal) => {
    if (meal === 'Lunch') return 'linear-gradient(90deg, #f43f5e, #fb7185)';
    if (meal === 'Breakfast') return 'linear-gradient(90deg, #10b981, #34d399)';
    if (meal === 'Dinner') return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #6366f1, #818cf8)';
  };

  const getDayBarGradient = (day: Day) => {
    if (day === 'Wed') return 'linear-gradient(180deg, #f43f5e, #fb7185)';
    if (day === 'Sun') return 'linear-gradient(180deg, #10b981, #34d399)';
    return 'linear-gradient(180deg, #6366f1, #a78bfa)';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.4rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.15rem' }}>
        <BarChart2 size={17} color="var(--primary-light)" />
        <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
          Meal service and daily ratings
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Panel 1: Meal Ratings Bar Chart */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          padding: '1.15rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--bg-card-border)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Utensils size={15} />
            <span>Ratings by meal service</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {meals.map(m => {
              const data = stats.mealMeans[m];
              const pct = (data.avg / 5) * 100;
              return (
                <div key={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{m}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                      <strong>{data.avg.toFixed(2)}</strong> / 5.0 ({data.count} meals)
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: 'rgba(255,255,255,0.04)', 
                    borderRadius: '999px', 
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
                  }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: getBarGradient(m),
                        borderRadius: '999px',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: `0 0 10px -2px ${m === 'Lunch' ? 'var(--rose-glow)' : m === 'Breakfast' ? 'var(--emerald-glow)' : 'var(--primary-glow)'}`
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: 7-Day Day-by-Day Satisfaction Trend */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          padding: '1.15rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--bg-card-border)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Calendar size={15} />
            <span>7-day average satisfaction</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '130px', gap: '0.5rem', paddingTop: '0.5rem' }}>
            {days.map(d => {
              const data = stats.dayMeans[d];
              const heightPct = Math.max(16, (data.avg / 5) * 100);
              const isWed = d === 'Wed';
              const isSun = d === 'Sun';
              return (
                <div 
                  key={d} 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    transition: 'transform 0.2s ease',
                    cursor: 'default'
                  }}
                >
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    fontFamily: 'var(--font-mono)', 
                    color: isWed ? 'var(--rose-light)' : isSun ? 'var(--emerald-light)' : 'var(--text-muted)',
                    textShadow: isWed ? '0 0 8px var(--rose-glow)' : isSun ? '0 0 8px var(--emerald-glow)' : 'none'
                  }}>
                    {data.avg.toFixed(1)}
                  </span>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: `${heightPct}%`, 
                      background: getDayBarGradient(d),
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isWed 
                        ? '0 0 14px -3px var(--rose-glow)' 
                        : isSun 
                          ? '0 0 14px -3px var(--emerald-glow)' 
                          : '0 0 10px -3px var(--primary-glow)',
                      position: 'relative',
                      overflow: 'hidden'
                    }} 
                  >
                    {/* Shimmer overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                      borderRadius: 'inherit'
                    }} />
                  </div>
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
