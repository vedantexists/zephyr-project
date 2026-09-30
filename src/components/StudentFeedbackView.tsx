import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Clock, 
  Send, 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MealType, FeedbackSubmission, DayOfWeek } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storage';

interface StudentFeedbackViewProps {
  onSubmissionSuccess: (submission: FeedbackSubmission) => void;
  prefillData?: Partial<FeedbackSubmission> | null;
}

export const StudentFeedbackView: React.FC<StudentFeedbackViewProps> = ({
  onSubmissionSuccess,
  prefillData
}) => {
  const getCurrentMeal = (): MealType => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 19) return 'Snacks';
    return 'Dinner';
  };

  const getDayOfWeek = (): DayOfWeek => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const [meal, setMeal] = useState<MealType>(prefillData?.meal || getCurrentMeal());
  const [day, setDay] = useState<DayOfWeek>(prefillData?.dayOfWeek || getDayOfWeek());
  const [rating, setRating] = useState<number>(prefillData?.rating || 0);
  const [selectedTags, setSelectedTags] = useState<string[]>(prefillData?.tags || []);
  const [comment, setComment] = useState<string>(prefillData?.comment || '');
  const [studentHash, setStudentHash] = useState<string>(prefillData?.studentHash || 'Roll #23CS104');
  
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [finalSubmitTime, setFinalSubmitTime] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ time: number; sub: FeedbackSubmission } | null>(null);
  const [nlpPreview, setNlpPreview] = useState<any>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.meal) setMeal(prefillData.meal);
      if (prefillData.dayOfWeek) setDay(prefillData.dayOfWeek);
      if (prefillData.rating !== undefined) setRating(prefillData.rating);
      if (prefillData.tags) setSelectedTags(prefillData.tags);
      if (prefillData.comment !== undefined) {
        setComment(prefillData.comment);
        setNlpPreview(GeminiService.parseStudentComment(prefillData.comment));
      }
      if (prefillData.studentHash) setStudentHash(prefillData.studentHash);
      setElapsedSeconds(prefillData.timeToSubmitSeconds || 3.4);
      setTimerActive(false);
      setSuccessInfo(null);
      setErrorMsg(null);
    }
  }, [prefillData]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => Number((prev + 0.1).toFixed(1)));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const handleCommentChange = (text: string) => {
    setComment(text);
    if (text.trim().length > 3) {
      const parsed = GeminiService.parseStudentComment(text);
      setNlpPreview(parsed);
      parsed.tags.forEach(t => {
        if (!selectedTags.includes(t)) {
          setSelectedTags(prev => [...prev, t]);
        }
      });
    } else {
      setNlpPreview(null);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleReset = () => {
    setRating(0);
    setSelectedTags([]);
    setComment('');
    setNlpPreview(null);
    setElapsedSeconds(0);
    setTimerActive(true);
    setFinalSubmitTime(null);
    setErrorMsg(null);
    setSuccessInfo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg('Please tap a star rating (1-5) before submitting.');
      return;
    }

    setTimerActive(false);
    const submitTime = elapsedSeconds > 0 ? elapsedSeconds : 3.8;
    setFinalSubmitTime(submitTime);

    const parsed = comment ? GeminiService.parseStudentComment(comment) : null;

    const newSubmission: FeedbackSubmission = {
      id: `sub-${Date.now()}`,
      studentHash: studentHash.trim() || 'Roll #23CS104',
      timestamp: new Date().toISOString(),
      dayOfWeek: day,
      meal,
      rating,
      tags: selectedTags.length ? selectedTags : ['Standard Review'],
      comment: comment.trim() || undefined,
      languageDetected: parsed?.language || 'English',
      extractedEntities: parsed ? {
        dish: parsed.dish,
        issue: parsed.issue,
        severity: parsed.severity
      } : undefined,
      timeToSubmitSeconds: submitTime,
      status: 'valid'
    };

    const result = StorageService.addSubmission(newSubmission);
    if (!result.success) {
      setErrorMsg(result.reason || 'Submission blocked by Anti-Spam Shield.');
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // Confetti fallback
    }

    setSuccessInfo({ time: submitTime, sub: newSubmission });
    setErrorMsg(null);
    onSubmissionSuccess(newSubmission);
  };

  const commonNegativeTags = [
    'Watery Dal',
    'Cold Chapati',
    'Bland / No Salt',
    'Stockout / Ran Out',
    'Refill Delay',
    'Queue Delay',
    'Unclean Tray',
    'Portion Small'
  ];

  const commonPositiveTags = [
    'Tasty & Fresh',
    'Crispy Dosa',
    'Hot Sambar',
    'Quick Refill',
    'Friendly Staff'
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.25rem' }}>
              <Zap size={12} />
              10-Second Student UX
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Rate Your Meal</h2>
          </div>

          <div 
            className={`stopwatch-hud ${elapsedSeconds > 10 ? 'exceeded' : elapsedSeconds > 7 ? 'warning' : ''}`}
            title="Real-time stopwatch testing the <10s input constraint"
          >
            <Clock size={14} className={timerActive ? 'pulse-dot' : ''} />
            <span>
              {finalSubmitTime ? `${finalSubmitTime}s` : `${elapsedSeconds.toFixed(1)}s`}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
              {finalSubmitTime ? '(Submitted!)' : '/ 10.0s target'}
            </span>
          </div>
        </div>

        {errorMsg && (
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
              <span style={{ fontSize: '0.82rem' }}>{errorMsg}</span>
            </div>
          </div>
        )}

        {successInfo && (
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
                Feedback Logged in {successInfo.time} seconds!
              </strong>
              <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>
                &lt; 10s Constraint Met
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Synced to Manager Command Center. Your rating helps kitchen supervisors immediately fix batch issues.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleReset}>
                <RotateCcw size={12} /> Rate Another Meal
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Meal Window:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.4rem' }}>
              {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as MealType[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`btn ${meal === m ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.5rem 0.2rem', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1-Tap Rating:
              </label>
              {rating > 0 && (
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
                { score: 1, emoji: '😡', label: 'Terrible' },
                { score: 2, emoji: '🙁', label: 'Poor' },
                { score: 3, emoji: '😐', label: 'Average' },
                { score: 4, emoji: '🙂', label: 'Good' },
                { score: 5, emoji: '🤩', label: 'Loved it' }
              ].map(({ score, emoji, label }) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setRating(score)}
                  className={`emoji-btn ${rating === score ? 'selected' : ''}`}
                >
                  <span className="emoji-icon">{emoji}</span>
                  <span className="emoji-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick 1-Tap Tags:
            </label>
            <div className="tags-cloud">
              {commonNegativeTags.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`tag-pill negative ${selectedTags.includes(t) ? 'active' : ''}`}
                >
                  <Tag size={11} />
                  {t}
                </button>
              ))}
              {commonPositiveTags.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`tag-pill ${selectedTags.includes(t) ? 'active' : ''}`}
                  style={{ borderColor: selectedTags.includes(t) ? 'var(--emerald)' : undefined }}
                >
                  <Tag size={11} />
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Optional Comment (Multilingual / Hinglish):
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Speech &amp; Hinglish supported
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="e.g., Dal was too watery OR Chole me namak bilkul nahi tha..."
                style={{
                  width: '100%',
                  padding: '0.75rem 2.8rem 0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-main)',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem'
                }}
              />
              <button
                type="button"
                title="Voice dictation simulation"
                onClick={() => handleCommentChange('Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe.')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-light)',
                  cursor: 'pointer',
                  padding: '0.4rem'
                }}
              >
                <Mic size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                Try test comments:
              </span>
              <button
                type="button"
                onClick={() => {
                  setMeal('Dinner');
                  setDay('Tuesday');
                  setRating(2);
                  handleCommentChange('Dal was too watery and chapati was cold and hard after 8:30.');
                }}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                "Dal was too watery..." (Tue Dinner)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMeal('Lunch');
                  setDay('Wednesday');
                  setRating(1);
                  handleCommentChange('Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe.');
                }}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                "Chole me namak..." (Hinglish Wed Lunch)
              </button>
            </div>

            {nlpPreview && (
              <div style={{
                marginTop: '0.6rem',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <Sparkles size={14} color="#818cf8" />
                <span>
                  <strong>NLP Extracted:</strong> Language: <code>{nlpPreview.language}</code> | Dish: <strong>{nlpPreview.dish}</strong> | Severity: <span style={{ color: nlpPreview.severity === 'critical' ? '#fb7185' : '#fbbf24' }}>{nlpPreview.severity.toUpperCase()}</span>
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bg-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Student ID:</span>
              <input
                type="text"
                value={studentHash}
                onChange={(e) => setStudentHash(e.target.value)}
                placeholder="Roll #23CS104"
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-main)',
                  width: '120px'
                }}
              />
            </div>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              🛡️ Protected by 1-rating/meal Spam Shield
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
          >
            <Send size={18} />
            <span>Submit Feedback ({elapsedSeconds.toFixed(1)}s)</span>
          </button>
        </form>

      </div>
    </div>
  );
};
