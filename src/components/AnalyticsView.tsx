import React, { useState } from 'react';
import { 
  Calendar, 
  Utensils, 
  Star, 
  Search, 
  Clock 
} from 'lucide-react';
import type { FeedbackSubmission, MealType } from '../types';
import { StorageService } from '../services/storage';

interface AnalyticsViewProps {
  submissions: FeedbackSubmission[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ submissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealFilter, setSelectedMealFilter] = useState<'All' | MealType>('All');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'All'>('All');

  const metrics = StorageService.getMetrics(submissions);

  const filtered = submissions.filter(s => {
    if (selectedMealFilter !== 'All' && s.meal !== selectedMealFilter) return false;
    if (selectedRatingFilter !== 'All' && s.rating !== selectedRatingFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchComment = s.comment?.toLowerCase().includes(q);
      const matchTags = s.tags.some(t => t.toLowerCase().includes(q));
      const matchStudent = s.studentHash.toLowerCase().includes(q);
      return matchComment || matchTags || matchStudent;
    }
    return true;
  });

  const meals: MealType[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Analytics Summary */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="badge badge-indigo">Campus Dining Intelligence</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Visual Trend Analytics ({metrics.total} Submissions)
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Rating:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              {metrics.avgRating} / 5.0
            </span>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Chart 1: Meal by Meal Comparison */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Utensils size={15} color="#818cf8" />
              Meal Window Comparison
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {meals.map(m => {
                const data = metrics.byMeal[m];
                const pct = (data.avgRating / 5) * 100;
                const isLowest = m === 'Lunch';
                const isHighest = m === 'Breakfast';
                return (
                  <div key={m}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{m}</span>
                      <span>
                        <strong>{data.avgRating.toFixed(2)}</strong> / 5.0 ({data.count} logs)
                        {isLowest && <span className="badge badge-rose" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>Lowest</span>}
                        {isHighest && <span className="badge badge-emerald" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>Peak</span>}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: isLowest ? 'var(--rose)' : isHighest ? 'var(--emerald)' : 'var(--primary-light)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Day of Week Trend */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} color="#34d399" />
              Day-by-Day Satisfaction
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', gap: '0.35rem', paddingTop: '1rem' }}>
              {days.map(d => {
                const data = metrics.byDay[d];
                const heightPct = Math.max(15, (data.avgRating / 5) * 100);
                const isDip = d === 'Wednesday';
                const isPeak = d === 'Sunday';
                return (
                  <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isDip ? '#fb7185' : isPeak ? '#34d399' : 'var(--text-muted)' }}>
                      {data.avgRating.toFixed(1)}
                    </span>
                    <div 
                      style={{ 
                        width: '100%', 
                        height: `${heightPct}%`, 
                        background: isDip ? 'var(--rose)' : isPeak ? 'var(--emerald)' : 'rgba(99, 102, 241, 0.6)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease'
                      }} 
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                      {d.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Star Rating Breakdown */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={15} color="#f59e0b" />
              Rating Score Spread
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {([5, 4, 3, 2, 1] as const).map(star => {
                const count = metrics.ratingCounts[star];
                const pct = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '45px', fontWeight: 600 }}>{star} Star</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--bg-card-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: star >= 4 ? 'var(--emerald)' : star === 3 ? 'var(--amber)' : 'var(--rose)',
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                    <span style={{ width: '50px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Live Feedback Stream Explorer */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Live Feedback Submissions Explorer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filtered.length} entries matching current filters
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search comments, dishes, roll..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem 0.4rem 2rem',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-main)',
                  width: '210px'
                }}
              />
            </div>

            <select
              value={selectedMealFilter}
              onChange={e => setSelectedMealFilter(e.target.value as any)}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)'
              }}
            >
              <option value="All">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snacks">Snacks</option>
              <option value="Dinner">Dinner</option>
            </select>

            <select
              value={selectedRatingFilter}
              onChange={e => setSelectedRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)'
              }}
            >
              <option value="All">All Ratings</option>
              <option value="1">1 Star Only</option>
              <option value="2">2 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="5">5 Stars Only</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '0.3rem' }}>
          {filtered.slice(0, 50).map(sub => (
            <div 
              key={sub.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--bg-card-border)',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span 
                  className={`badge badge-${sub.rating <= 2 ? 'rose' : sub.rating === 3 ? 'amber' : 'emerald'}`}
                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                >
                  {sub.rating} ★
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{sub.meal}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      • {sub.dayOfWeek}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      ({sub.studentHash})
                    </span>
                  </div>

                  {sub.comment ? (
                    <p style={{ fontSize: '0.82rem', marginTop: '0.2rem', color: 'var(--text-main)' }}>
                      "{sub.comment}"
                    </p>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      (No written comment - Rating &amp; tags only)
                    </span>
                  )}

                  {sub.extractedEntities && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)', display: 'block', marginTop: '0.2rem' }}>
                      ↳ Extracted: {sub.extractedEntities.dish} ({sub.extractedEntities.issue})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {sub.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="tag-pill" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={10} />
                  Logged in {sub.timeToSubmitSeconds}s
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
