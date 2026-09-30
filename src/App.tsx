import { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Sparkles, 
  Sun, 
  Moon, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { FeedbackForm } from './components/student/FeedbackForm';
import { DigestView } from './components/manager/DigestView';
import { Toast, type ToastMessage } from './components/Toast';
import { store } from './lib/store';
import { TEST_CASE_1_SUBMISSION, TEST_CASE_2_SUBMISSION } from './data/seed';
import type { Submission, Digest } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'manager'>('manager');
  const [submissions, setSubmissions] = useState<Submission[]>(store.getCurrentWeek());
  const [digest, setDigest] = useState<Digest>(store.getDigest());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Student form prefill for test cases
  const [prefill, setPrefill] = useState<{
    meal?: Submission['meal'];
    day?: Submission['day'];
    rating?: Submission['rating'];
    comment?: string;
    quickTags?: string[];
  } | null>(null);

  // Theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const addToast = (t: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 4000);
  };

  const handleSubmissionSuccess = (_newSub: Submission) => {
    setSubmissions(store.getCurrentWeek());
    setDigest(store.refreshDigest());
    addToast({
      type: 'success',
      title: 'Feedback logged',
      message: 'Your notes will be included in the kitchen shift briefing.'
    });
  };

  const handleRefreshDigest = () => {
    const updated = store.refreshDigest();
    setDigest(updated);
    addToast({
      type: 'success',
      title: 'Digest updated',
      message: `Analyzed ${updated.totalSubmissions} meal responses for this week.`
    });
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const executeReset = () => {
    store.resetToDefaultSeed();
    setSubmissions(store.getCurrentWeek());
    setDigest(store.getDigest());
    setPrefill(null);
    setShowResetConfirm(false);
    addToast({
      type: 'warning',
      title: 'Data reset',
      message: 'Restored the default 900 current week and 650 prior week records.'
    });
  };

  const handleLoadTestCase = (caseNum: 1 | 2 | 3) => {
    if (caseNum === 1) {
      setPrefill({
        meal: TEST_CASE_1_SUBMISSION.meal,
        day: TEST_CASE_1_SUBMISSION.day,
        rating: TEST_CASE_1_SUBMISSION.rating,
        comment: TEST_CASE_1_SUBMISSION.comment,
        quickTags: TEST_CASE_1_SUBMISSION.quickTags
      });
      setActiveTab('student');
      addToast({
        type: 'warning',
        title: 'Loaded Test Case 1: Tuesday Dinner',
        message: 'Prefilled with watery dal and cold chapati report (Rating: 2/5).'
      });
    } else if (caseNum === 2) {
      setPrefill({
        meal: TEST_CASE_2_SUBMISSION.meal,
        day: TEST_CASE_2_SUBMISSION.day,
        rating: TEST_CASE_2_SUBMISSION.rating,
        comment: TEST_CASE_2_SUBMISSION.comment,
        quickTags: TEST_CASE_2_SUBMISSION.quickTags
      });
      setActiveTab('student');
      addToast({
        type: 'warning',
        title: 'Loaded Test Case 2: Wednesday Lunch (Hinglish)',
        message: 'Prefilled with Hinglish chole namak and 1:15pm stockout (Rating: 1/5).'
      });
    } else if (caseNum === 3) {
      setActiveTab('manager');
      handleRefreshDigest();
    }
  };

  return (
    <div className="app-container">
      
      {/* Navbar Header */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-icon-box">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <h1 className="brand-title">ZephyrMess</h1>
            <p className="nav-tagline">Dining feedback and kitchen shift digest</p>
          </div>
        </div>

        {/* 2 Main Personas Tabs */}
        <nav className="nav-tabs" aria-label="Main Views">
          <button
            className={`nav-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
            title="Submit dining feedback"
          >
            <Zap size={15} />
            <span>Diner feedback</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => setActiveTab('manager')}
            title="View kitchen shift digest"
          >
            <Sparkles size={15} />
            <span>Shift digest</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleResetData}
            title="Reset data to initial sample submissions"
          >
            <RotateCcw size={14} />
            <span style={{ fontSize: '0.74rem' }}>Reset data</span>
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Live Dining Pulse & Test Case Presets */}
      <div className="pulse-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-light)', fontWeight: 600 }}>
            <span className="pulse-dot" />
            Active Service Window
          </span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>
            <strong>{submissions.length}</strong> verified meal responses logged this week
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Judge presets:
          </span>
          <button 
            className="btn btn-outline btn-sm" 
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
            onClick={() => handleLoadTestCase(1)}
            title="Load Tuesday Dinner Watery Dal case"
          >
            Case 1: Tue Dinner
          </button>
          <button 
            className="btn btn-outline btn-sm" 
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
            onClick={() => handleLoadTestCase(2)}
            title="Load Wednesday Lunch Hinglish Namak/Stockout case"
          >
            Case 2: Wed Lunch
          </button>
          <button 
            className="btn btn-emerald btn-sm" 
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
            onClick={() => handleLoadTestCase(3)}
            title="Switch to Manager Digest and recalculate"
          >
            Recalculate
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <main>
        {activeTab === 'student' && (
          <FeedbackForm
            key={prefill ? JSON.stringify(prefill) : 'student-form'}
            onSubmissionSuccess={handleSubmissionSuccess}
            prefill={prefill}
          />
        )}

        {activeTab === 'manager' && (
          <DigestView
            digest={digest}
            submissions={submissions}
            onRefresh={handleRefreshDigest}
          />
        )}
      </main>

      {/* Toast Messages */}
      <Toast toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-card-border)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem' }}>Reset sample data?</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              This restores the original 900 current week and 650 prior week sample submissions.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowResetConfirm(false)}>Keep current data</button>
              <button className="btn btn-primary" style={{ background: 'var(--rose)', borderColor: 'var(--rose)', color: 'white' }} onClick={executeReset}>Reset records</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
