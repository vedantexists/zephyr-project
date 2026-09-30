import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, ShieldAlert, RotateCcw, Tag, Hash, UtensilsCrossed } from 'lucide-react';
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

// Dishes served per meal window (today's sample menu).
// In a production build this would come from an API / mess committee CMS.
const MEAL_MENU: Record<Meal, string[]> = {
  Breakfast: ['Poha', 'Upma', 'Idli', 'Masala Dosa', 'Sambar', 'Bread & Butter', 'Filter Coffee', 'Boiled Egg'],
  Lunch:     ['Dal Tadka', 'Steamed Rice', 'Chapati', 'Chole', 'Aloo Gobi', 'Paneer Butter Masala', 'Jeera Rice', 'Salad', 'Curd'],
  Snacks:    ['Samosa', 'Bread Pakoda', 'Vada Pav', 'Poha', 'Tea', 'Coffee', 'Biscuits'],
  Dinner:    ['Dal Fry', 'Chapati', 'Jeera Rice', 'Mixed Veg', 'Paneer Curry', 'Curd', 'Salad', 'Sweet (Kheer)'],
};

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

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmissionSuccess,
  prefill
}) => {

  const [rawRoll, setRawRoll] = useState<string>('23CS104');
  const [studentHash, setStudentHash] = useState<string>('7a9f02c1b84e');
  const [meal, setMeal] = useState<Meal>(prefill?.meal || getAutoMeal());
  const [day] = useState<Day>(prefill?.day || getAutoDay());
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(prefill?.rating || null);
  const [quickTags, setQuickTags] = useState<string[]>(prefill?.quickTags || []);
  const [comment, setComment] = useState<string>(prefill?.comment || '');
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

  // Live stopwatch (<10s constraint)
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [finalSubmitMs, setFinalSubmitMs] = useState<number | null>(null);

  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const [successSub, setSuccessSub] = useState<Submission | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hash student roll number
  useEffect(() => {
    hashStudentRoll(rawRoll).then(h => setStudentHash(h));
  }, [rawRoll]);

  // Prefill is now handled via a key reset on the component mount in App.tsx

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

  const handleChangeMeal = (m: Meal) => {
    startStopwatchIfNeeded();
    setMeal(m);
    setSelectedDishes([]); // clear dish selection when meal window changes
  };

  const toggleDish = (dish: string) => {
    startStopwatchIfNeeded();
    setSelectedDishes(prev =>
      prev.includes(dish) ? prev.filter(d => d !== dish) : [...prev, dish]
    );
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
      msToSubmit: duration,
      selectedDishes
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
    setSelectedDishes([]);
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Rate your meal</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Takes under 15 seconds. Feedback updates tomorrow's kitchen preparation.
          </p>
        </div>

        {/* Spam Shield Block Alert */}
        {blockedAlert && (
          <div style={{ 
            background: 'var(--rose-subtle)', 
            border: '1px solid rgba(244, 63, 94, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem 1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            color: 'var(--rose-light)'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--rose-light)' }}>
                Submission limit reached
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{blockedAlert}</span>
            </div>
          </div>
        )}

        {/* Submission Success Confirmation */}
        {successSub && (
          <div style={{ 
            background: 'var(--emerald-subtle)', 
            border: '1px solid rgba(16, 185, 129, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-light)' }}>
              <CheckCircle2 size={18} />
              <strong style={{ fontSize: '0.96rem' }}>Feedback logged</strong>
              <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>Saved</span>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              Saved. Your notes are included in the shift handover report.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleReset}>
                <RotateCcw size={12} /> Rate another meal
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          
          {/* Meal Service Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Meal service:
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                {day} &bull; Auto-detected
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
              {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as Meal[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => handleChangeMeal(m)}
                  className={`btn ${meal === m ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.5rem 0.2rem', fontSize: '0.82rem', justifyContent: 'center' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Dish Picker — today's menu for the selected meal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Menu for {meal}:
              </label>
              {selectedDishes.length > 0 && (
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  {selectedDishes.length} selected
                </span>
              )}
            </div>
            <div className="tags-cloud">
              {MEAL_MENU[meal].map((dish) => {
                const isSelected = selectedDishes.includes(dish);
                return (
                  <button
                    type="button"
                    key={dish}
                    onClick={() => toggleDish(dish)}
                    className={`tag-pill ${isSelected ? 'active' : ''}`}
                    style={{
                      borderColor: isSelected ? 'var(--emerald)' : undefined,
                      background: isSelected ? 'var(--emerald-subtle)' : undefined,
                      color: isSelected ? 'var(--emerald-light)' : undefined
                    }}
                  >
                    <UtensilsCrossed size={11} />
                    {dish}
                  </button>
                );
              })}
            </div>
            {selectedDishes.length > 0 && (
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                Selected dishes: <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedDishes.join(', ')}</strong>
              </p>
            )}
          </div>

          {/* 5-Tap Rating Target Scale */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tap to rate:
              </label>
              {rating && (
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: rating <= 2 ? 'var(--rose-light)' : rating === 3 ? 'var(--saffron-light)' : 'var(--emerald-light)' }}>
                  {rating === 1 && '1/5: Terrible'}
                  {rating === 2 && '2/5: Poor'}
                  {rating === 3 && '3/5: Average'}
                  {rating === 4 && '4/5: Good'}
                  {rating === 5 && '5/5: Great'}
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
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
              Common issues (optional):
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
                      borderColor: isSelected ? (isPositive ? 'var(--emerald)' : 'var(--primary-light)') : undefined,
                      color: isSelected ? (isPositive ? 'var(--emerald-light)' : '#c7d2fe') : undefined
                    }}
                  >
                    <Tag size={11} />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multilingual / Hinglish Comment */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
              Add details (English, Hindi, or Hinglish):
            </label>
            <input
              type="text"
              value={comment}
              onFocus={startStopwatchIfNeeded}
              onChange={e => {
                startStopwatchIfNeeded();
                setComment(e.target.value);
              }}
              placeholder="e.g., Dal was too watery today, or chole me namak kam tha..."
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Student Roll Number — anonymous, no hash shown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderTop: '1px solid var(--bg-card-border)', paddingTop: '0.75rem' }}>
            <Hash size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>Roll number:</label>
            <input
              type="text"
              value={rawRoll}
              onChange={e => setRawRoll(e.target.value)}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)',
                width: '95px',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Anonymized using one-way cryptographic hashing.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '0.98rem', fontWeight: 700 }}
          >
            <Send size={16} />
            <span>Submit feedback</span>
          </button>
        </form>

      </div>
    </div>
  );
};
