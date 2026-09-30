import React from 'react';
import { PlayCircle, Sparkles, AlertTriangle } from 'lucide-react';
import type { MealType } from '../types';

interface TestCaseSelectorProps {
  onSelectTestCase: (caseNum: 1 | 2 | 3) => void;
  activeMeal?: MealType;
}

export const TestCaseSelector: React.FC<TestCaseSelectorProps> = ({
  onSelectTestCase
}) => {
  return (
    <div className="test-cases-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <PlayCircle size={13} />
          Day 2 Judge Test Presets
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Quickly test the 3 Day 2 problem test cases:
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onSelectTestCase(1)}
          title="Input 1: Tuesday Dinner watery dal & cold chapati (2/5)"
          style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}
        >
          <AlertTriangle size={14} color="#f59e0b" />
          <span><strong>Case #1:</strong> Tue Dinner (Cold Chapati / Watery Dal)</span>
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => onSelectTestCase(2)}
          title="Input 2: Wednesday Lunch Hinglish (Chole namak & 1:15pm stockout) (1/5)"
          style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)' }}
        >
          <AlertTriangle size={14} color="#f43f5e" />
          <span><strong>Case #2:</strong> Wed Lunch (Hinglish Stockout Alert)</span>
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => onSelectTestCase(3)}
          title="Input 3: Synthesize Weekly Aggregate of 900+ meals into 2-Min Executive Digest"
        >
          <Sparkles size={14} />
          <span><strong>Case #3:</strong> 900-Meal Weekly Digest (3.4/5)</span>
        </button>
      </div>
    </div>
  );
};
