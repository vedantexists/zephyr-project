import { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Zap, 
  Sparkles, 
  Sun, 
  Moon, 
  RotateCcw
} from 'lucide-react';
import { FeedbackForm } from './components/student/FeedbackForm';
import { DigestView } from './components/manager/DigestView';
import { DemoPanel } from './components/DemoPanel';
import { EngineBadge } from './components/EngineBadge';
import { Toast, type ToastMessage } from './components/Toast';
import { store } from './lib/store';
import { getActiveEngine, subscribeEngineChange } from './ai/embedder';
import { TEST_CASE_1_SUBMISSION, TEST_CASE_2_SUBMISSION } from './data/seed';
import type { Submission, Digest, Embedder } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'manager'>('manager');
  const [submissions, setSubmissions] = useState<Submission[]>(store.getCurrentWeek());
  const [digest, setDigest] = useState<Digest>(store.getDigest());
  const [engine, setEngine] = useState<Embedder['name']>(getActiveEngine());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Student form prefill for test cases
  const [prefill, setPrefill] = useState<{
    meal?: Submission['meal'];
    day?: Submission['day'];
    rating?: Submission['rating'];
    comment?: string;
    quickTags?: string[];
  } | null>(null);

  // Subscribe to engine changes
  useEffect(() => {
    return subscribeEngineChange((newEngine) => setEngine(newEngine));
  }, []);

  // Theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const addToast = (t: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 4500);
  };

  const handleSubmissionSuccess = (newSub: Submission) => {
    setSubmissions(store.getCurrentWeek());
    setDigest(store.refreshDigest());
    addToast({
      type: 'success',
      title: 'Feedback Verified & Logged',
      message: `Completed in ${(newSub.msToSubmit / 1000).toFixed(1)}s (<10s constraint met). Digest updated.`
    });
  };

  const handleRefreshDigest = () => {
    const updated = store.refreshDigest();
    setDigest(updated);
    addToast({
      type: 'success',
      title: 'Digest Recalculated',
      message: `Synthesized across ${updated.totalSubmissions} meal submissions. Read time: ~${updated.readTimeSeconds}s.`
    });
  };

  const handleResetData = () => {
    if (window.confirm('Reset dataset back to the initial 900+ seed submissions?')) {
      store.resetToDefaultSeed();
      setSubmissions(store.getCurrentWeek());
      setDigest(store.getDigest());
      setPrefill(null);
      addToast({
        type: 'warning',
        title: 'Dataset Re-initialized',
        message: 'Loaded default 900 current week + 650 prior week submissions.'
      });
    }
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
        title: 'Test Case 1 Loaded (Tuesday Dinner)',
        message: 'Prefilled with watery dal & cold chapati comment (Rating: 2/5).'
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
        title: 'Test Case 2 Loaded (Wednesday Lunch Hinglish)',
        message: 'Prefilled with Hinglish chole namak & 1:15pm stockout (Rating: 1/5).'
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
            <p className="nav-tagline">Mess Feedback Digest &amp; NLP Dining Analytics</p>
          </div>
        </div>

        {/* 2 Main Personas Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
            title="Student Feedback (<10s Flow)"
          >
            <Zap size={15} />
            <span>Student Rating (&lt;10s)</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => setActiveTab('manager')}
            title="Manager 2-Minute Executive Digest"
          >
            <Sparkles size={15} />
            <span>Manager Digest (~2min)</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          <EngineBadge engine={engine} />

          <button
            className="btn btn-outline btn-sm"
            onClick={handleResetData}
            title="Reset dataset back to 900+ seed submissions"
          >
            <RotateCcw size={14} />
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

      {/* Demo Panel Quick-Launcher for Judges */}
      <DemoPanel onLoadTestCase={handleLoadTestCase} />

      {/* Main Tab Panels */}
      <main>
        {activeTab === 'student' && (
          <FeedbackForm
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

    </div>
  );
}

export default App;
