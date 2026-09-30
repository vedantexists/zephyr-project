import React, { useState } from 'react';
import { PlayCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { extractEntities } from '../lib/entities';
import { scorePillars } from '../lib/pillars';
import { TEST_CASE_1_SUBMISSION, TEST_CASE_2_SUBMISSION } from '../data/seed';
import type { Analysis } from '../types';

interface DemoPanelProps {
  onLoadTestCase: (caseNum: 1 | 2 | 3) => void;
}

export const DemoPanel: React.FC<DemoPanelProps> = ({ onLoadTestCase }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<{
    caseNum: number;
    title: string;
    comment: string;
    analysis: Analysis;
  } | null>(null);

  const runAnalysis = (caseNum: 1 | 2) => {
    const text = caseNum === 1 
      ? TEST_CASE_1_SUBMISSION.comment! 
      : TEST_CASE_2_SUBMISSION.comment!;

    const entities = extractEntities(text);
    const pillars = scorePillars(text);

    setActiveAnalysis({
      caseNum,
      title: caseNum === 1 ? 'Test Case 1 (Tuesday Dinner)' : 'Test Case 2 (Wednesday Lunch Hinglish)',
      comment: text,
      analysis: {
        engine: 'lightweight',
        language: entities.language,
        pillars,
        tags: entities.tags,
        dishes: entities.dishes,
        times: entities.times,
        severity: entities.severity
      }
    });

    onLoadTestCase(caseNum);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      
      {/* Test Cases Launcher Bar */}
      <div className="test-cases-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <PlayCircle size={13} />
            Day 2 Judge Test Presets
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            One-tap verification of Day 2 problem test cases:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => runAnalysis(1)}
            title="Input 1: Tuesday Dinner watery dal & cold chapati (2/5)"
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}
          >
            <AlertTriangle size={14} color="#f59e0b" />
            <span><strong>Case #1:</strong> Tue Dinner (Dal &amp; Chapati)</span>
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => runAnalysis(2)}
            title="Input 2: Wednesday Lunch Hinglish (Chole namak & 1:15pm stockout) (1/5)"
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)' }}
          >
            <AlertTriangle size={14} color="#f43f5e" />
            <span><strong>Case #2:</strong> Wed Lunch (Hinglish Stockout)</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setActiveAnalysis(null);
              onLoadTestCase(3);
            }}
            title="Input 3: Synthesize Weekly Aggregate of 900+ meals into 2-Min Executive Digest"
          >
            <Sparkles size={14} />
            <span><strong>Case #3:</strong> 900-Meal Weekly Digest (3.4/5)</span>
          </button>
        </div>
      </div>

      {/* Analysis Result Card (shown when Case 1 or 2 is clicked) */}
      {activeAnalysis && (
        <div style={{
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--bg-card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ✓ Real-Time Pipeline Analysis Output: {activeAnalysis.title}
            </span>
            <span className="badge badge-emerald">
              Language: {activeAnalysis.analysis.language}
            </span>
          </div>

          <div className="quote-box" style={{ margin: '0.2rem 0' }}>
            "{activeAnalysis.comment}"
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong>Dishes:</strong> {activeAnalysis.analysis.dishes.join(', ') || 'General'}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong>Times Detected:</strong> {activeAnalysis.analysis.times.join(', ') || 'None'}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong>Pillars:</strong> {activeAnalysis.analysis.pillars.map(p => `${p.pillar} (${p.score})`).join(', ')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
            {activeAnalysis.analysis.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
