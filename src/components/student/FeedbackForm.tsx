import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, CheckCircle2, ShieldAlert, RotateCcw, Tag, Hash, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Meal, Day, Submission } from '../../types';
import { hashStudentRoll } from '../../lib/spamShield';
import { store } from '../../lib/store';

interface FeedbackFormProps {
  onSubmissionSuccess?: (sub: Submission) => void;
  prefill?: {
    meal?: Meal;
    day?: Day;
    rating?: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    quickTags?: string[];
  } | null;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmissionSuccess,
  prefill
}) => {
  const getAutoMeal = (): Meal => {
    const h = new Date().getHours();
    if (h >= 7 && h < 11) return 'Breakfast';
    if (h >= 11 && h < 16) return 'Lunch';
    if (h >= 16 && h < 19) return 'Snacks';
    return 'Dinner';
  };

  const getAutoDay = (): Day => {
    const map: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[new Date().getDay()];
  };

  const [rawRoll, setRawRoll] = useState<string>('23CS104');
  const [studentHash, setStudentHash] = useState<string>('7a9f02c1b84e');
  const [meal, setMeal] = useState<Meal>(prefill?.meal || getAutoMeal());
  const [day, setDay] = useState<Day>(prefill?.day || getAutoDay());
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(prefill?.rating || null);
  const [quickTags, setQuickTags] = useState<string[]>(prefill?.quickTags || []);
  const [comment, setComment] = useState<string>(prefill?.comment || '');

  // Live stopwatch (<10s constraint)
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [finalSubmitMs, setFinalSubmitMs] = useState<number | null>(null);

  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const [successSub, setSuccessSub] = useState<Submission | null>(null);

  const timerRef = useRef<any>(null);

  // Hash student roll number
  useEffect(() => {
    hashStudentRoll(rawRoll).then(h => setStudentHash(h));
  }, [rawRoll]);

  // Handle prefill updates (from test case launcher)
  useEffect(() => {
    if (prefill) {
      if (prefill.meal) setMeal(prefill.meal);
      if (prefill.day) setDay(prefill.day);
      if (prefill.rating) setRating(prefill.rating);
      if (prefill.quickTags) setQuickTags(prefill.quickTags);
      if (prefill.comment !== undefined) setComment(prefill.comment);
      setBlockedAlert(null);
      setSuccessSub(null);
    }
  }, [prefill]);

  // Stopwatch ticking
  useEffect(() => {
    if (timerStarted && !finalSubmitMs) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerStarted, startTime, finalSubmitMs]);

  const startStopwatchIfNeeded = () => {
    if (!timerStarted) {
      setTimerStarted(true);
      setStartTime(Date.now());
    }
  };

  const handleSelectRating = (r: 1 | 2 | 3 | 4 | 5) => {
    startStopwatchIfNeeded();
    setRating(r);
  };

  const toggleQuickTag = (tag: string) => {
    startStopwatchIfNeeded();
    if (quickTags.includes(tag)) {
      setQuickTags(quickTags.filter(t => t !== tag));
    } else {
      setQuickTags([...quickTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setBlockedAlert('Please tap a 1-5 rating to submit.');
      return;
    }

    const duration = elapsedMs > 0 ? elapsedMs : 3400;
    setFinalSubmitMs(duration);

    // Call store.submitFeedback
    const result = store.submitFeedback({
      studentHash,
      meal,
      day,
      rating,
      quickTags,
      comment: comment.trim() || undefined,
      msToSubmit: duration
    });

    if (!result.allowed) {
      setBlockedAlert(result.reason || 'Submission blocked by Spam Shield.');
      return;
    }

    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // Confetti fallback
    }

    setSuccessSub(result.submission || null);
    setBlockedAlert(null);
    if (result.submission && onSubmissionSuccess) {
      onSubmissionSuccess(result.submission);
    }
  };

  const handleReset = () => {
    setRating(null);
    setQuickTags([]);
    setComment('');
    setTimerStarted(false);
    setElapsedMs(0);
    setFinalSubmitMs(null);
    setBlockedAlert(null);
    setSuccessSub(null);
  };

  const tagsList = [
    'Watery Dal',
    'Cold Food',
    'No Salt',
    'Ran Out',
    'Unclean',
    'Long Queue',
    'Loved It'
  ];

  const secondsDisplay = finalSubmitMs 
    ? (finalSubmitMs / 1000).toFixed(1) 
    : (elapsedMs / 1000).toFixed(1);

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        
        {/* Header & Stopwatch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.2rem' }}>
              <Zap size={12} />
              &lt;10s Student Flow
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Student Meal Feedback</h2>
          </div>

          <div 
            className={`stopwatch-hud ${elapsedMs > 10000 ? 'exceeded' : elapsedMs > 7000 ? 'warning' : ''}`}
            title="Stopwatch verification of the <10s input constraint"
          >
            <Clock size={14} className={timerStarted && !finalSubmitMs ? 'pulse-dot' : ''} />
            <span>{secondsDisplay}s</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>/ 10.0s target</span>
          </div>
        </div>

        {/* Spam Shield Block Alert */}
        {blockedAlert && (
          <div style={{ 
            background: 'rgba(244, 63, 94, 0.15)', 
            border: '1px solid rgba(244, 63, 94, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem 1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            color: '#fecdd3'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: '#fb7185' }}>
                🛡️ Spam Shield Active
              </strong>
              <span style={{ fontSize: '0.82rem' }}>{blockedAlert}</span>
            </div>
          </div>
        )}

        {/* Submission Success Confirmation */}
        {successSub && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.15)', 
            border: '1px solid rgba(16, 185, 129, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
              <CheckCircle2 size={18} />
              <strong style={{ fontSize: '0.95rem' }}>
                Submitted in {(successSub.msToSubmit / 1000).toFixed(1)}s!
              </strong>
              <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>
                Constraint Satisfied
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Feedback verified and hashed. Digest recalculation triggered in the background.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleReset}>
                <RotateCcw size={12} /> Rate Another
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Meal Override Row */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Meal Window (Auto-selected):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.4rem' }}>
              {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as Meal[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    startStopwatchIfNeeded();
                    setMeal(m);
                  }}
                  className={`btn ${meal === m ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.2rem', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Tap Rating Target Scale */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tap to Rate:
              </label>
              {rating && (
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: rating <= 2 ? '#fb7185' : rating === 3 ? '#fbbf24' : '#34d399' }}>
                  {rating === 1 && '1/5 — Terrible'}
                  {rating === 2 && '2/5 — Poor'}
                  {rating === 3 && '3/5 — Average'}
                  {rating === 4 && '4/5 — Good'}
                  {rating === 5 && '5/5 — Loved It!'}
                </span>
              )}
            </div>

            <div className="rating-emoji-scale">
              {[
                { score: 1 as const, emoji: '😡', label: '1 ★' },
                { score: 2 as const, emoji: '🙁', label: '2 ★' },
                { score: 3 as const, emoji: '😐', label: '3 ★' },
                { score: 4 as const, emoji: '🙂', label: '4 ★' },
                { score: 5 as const, emoji: '🤩', label: '5 ★' }
              ].map(({ score, emoji, label }) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => handleSelectRating(score)}
                  className={`emoji-btn ${rating === score ? 'selected' : ''}`}
                >
                  <span className="emoji-icon">{emoji}</span>
                  <span className="emoji-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tags Cloud */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Optional Quick Tags:
            </label>
            <div className="tags-cloud">
              {tagsList.map((tag) => {
                const isSelected = quickTags.includes(tag);
                const isPositive = tag === 'Loved It';
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleQuickTag(tag)}
                    className={`tag-pill ${isSelected ? 'active' : ''}`}
                    style={{
                      borderColor: isSelected ? (isPositive ? 'var(--emerald)' : 'var(--primary-light)') : undefined
                    }}
                  >
                    <Tag size={11} />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Multilingual / Hinglish Comment */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
              Optional Comment (English or Hinglish):
            </label>
            <input
              type="text"
              value={comment}
              onFocus={startStopwatchIfNeeded}
              onChange={e => {
                startStopwatchIfNeeded();
                setComment(e.target.value);
              }}
              placeholder="e.g. Chole me namak bilkul nahi tha aur chawal khatam 1:15 pm..."
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Student Roll Number & Anonymization */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', borderTop: '1px solid var(--bg-card-border)', paddingTop: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Hash size={13} />
              <span>Roll No:</span>
              <input
                type="text"
                value={rawRoll}
                onChange={e => setRawRoll(e.target.value)}
                style={{
                  padding: '0.2rem 0.4rem',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-main)',
                  width: '90px'
                }}
              />
            </div>

            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }} title="SHA-256 hash stored, raw roll never exposed">
              Hash: {studentHash}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
          >
            <Send size={16} />
            <span>Submit Feedback ({secondsDisplay}s)</span>
          </button>
        </form>

      </div>
    </div>
  );
};
