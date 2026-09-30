import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TestCaseSelector } from './components/TestCaseSelector';
import { StudentFeedbackView } from './components/StudentFeedbackView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { SpamShieldModal } from './components/SpamShieldModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import type { FeedbackSubmission, ExecutiveDigest } from './types';
import { StorageService } from './services/storage';
import { GeminiService } from './services/geminiService';
import { SpamShieldService } from './services/spamShield';
import { TEST_CASE_1, TEST_CASE_2 } from './services/seedData';

export function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'manager' | 'analytics' | 'spam'>('manager');
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [digest, setDigest] = useState<ExecutiveDigest | null>(null);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpamModalOpen, setIsSpamModalOpen] = useState(false);
  
  // Student form prefill state (for test cases)
  const [studentPrefill, setStudentPrefill] = useState<Partial<FeedbackSubmission> | null>(null);
  const [aiMode, setAiMode] = useState<'live' | 'edge'>(GeminiService.getAiMode());

  // Load initial data
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadedSubs = StorageService.getSubmissions();
    setSubmissions(loadedSubs);

    // Initial digest generation
    const initialDigest = GeminiService.generateDeterministicDigest(loadedSubs);
    setDigest(initialDigest);
  }, []);

  const handleRefreshDigest = async () => {
    setIsGeneratingDigest(true);
    try {
      const newDigest = await GeminiService.generateExecutiveDigest(submissions, 'Weekly (900 Meals)');
      setDigest(newDigest);
    } catch (err) {
      console.error('Digest synthesis error:', err);
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  const handleSelectTestCase = async (caseNum: 1 | 2 | 3) => {
    if (caseNum === 1) {
      // Test Case 1: Tuesday Dinner (Watery Dal & Cold Chapati)
      setStudentPrefill(TEST_CASE_1);
      setActiveTab('student');
    } else if (caseNum === 2) {
      // Test Case 2: Wednesday Lunch Hinglish (Chole namak & 1:15pm stockout)
      setStudentPrefill(TEST_CASE_2);
      setActiveTab('student');
    } else if (caseNum === 3) {
      // Test Case 3: 900-Meal Weekly Aggregate Digest
      setActiveTab('manager');
      await handleRefreshDigest();
    }
  };

  const handleSubmissionSuccess = (newSub: FeedbackSubmission) => {
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    setDigest(GeminiService.generateDeterministicDigest(updated));
  };

  const handleResetData = () => {
    if (window.confirm('Reset dining hall records back to the default 900+ seed submissions?')) {
      const resetSubs = StorageService.resetToSeed();
      setSubmissions(resetSubs);
      setDigest(GeminiService.generateDeterministicDigest(resetSubs));
      setStudentPrefill(null);
    }
  };

  const spamLogs = SpamShieldService.getLogs();

  return (
    <div className="app-container">
      {/* Pinned Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'spam') {
            setIsSpamModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        aiMode={aiMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
        theme={theme}
        setTheme={setTheme}
        spamBlockedCount={spamLogs.length}
      />

      {/* Day 2 Judge Test Presets Quick-Launcher */}
      <TestCaseSelector onSelectTestCase={handleSelectTestCase} />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'student' && (
          <StudentFeedbackView
            onSubmissionSuccess={handleSubmissionSuccess}
            prefillData={studentPrefill}
          />
        )}

        {activeTab === 'manager' && digest && (
          <ManagerDashboard
            digest={digest}
            submissions={submissions}
            onRefreshDigest={handleRefreshDigest}
            isGenerating={isGeneratingDigest}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView submissions={submissions} />
        )}
      </main>

      {/* Modals */}
      <SpamShieldModal
        isOpen={isSpamModalOpen}
        onClose={() => setIsSpamModalOpen(false)}
        onRefresh={() => {}}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => setAiMode(GeminiService.getAiMode())}
      />
    </div>
  );
}

export default App;
