import React from 'react';
import { 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  RotateCcw,
  Zap,
  Clock
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'student' | 'manager' | 'analytics' | 'spam';
  setActiveTab: (tab: 'student' | 'manager' | 'analytics' | 'spam') => void;
  aiMode: 'live' | 'edge';
  onOpenSettings: () => void;
  onResetData: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  spamBlockedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  aiMode,
  onOpenSettings,
  onResetData,
  theme,
  setTheme,
  spamBlockedCount
}) => {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-box">
          <UtensilsCrossed size={22} />
        </div>
        <div>
          <h1 className="brand-title">ZephyrMess</h1>
          <p className="nav-tagline">Campus Mess Feedback Digest & AI Kitchen Analytics</p>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
          title="Student Quick Rating (<10s Flow)"
        >
          <Zap size={16} />
          <span>Student Rating (<Clock size={12} style={{ display: 'inline' }} /> &lt;10s)</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
          onClick={() => setActiveTab('manager')}
          title="Manager 2-Minute Executive Digest"
        >
          <Sparkles size={16} />
          <span>Manager Digest (~2min)</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="Visual Trend Analytics"
        >
          <BarChart3 size={16} />
          <span>Analytics</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'spam' ? 'active' : ''}`}
          onClick={() => setActiveTab('spam')}
          title="Anti-Spam & Duplicate Shield"
        >
          <ShieldCheck size={16} />
          <span>Spam Shield ({spamBlockedCount})</span>
        </button>
      </nav>

      <div className="nav-actions">
        <button 
          className="badge badge-indigo"
          onClick={onOpenSettings}
          style={{ cursor: 'pointer', border: '1px solid rgba(99, 102, 241, 0.4)' }}
          title="Click to configure AI Engine / API Key"
        >
          <span className="pulse-dot" style={{ background: aiMode === 'live' ? '#34d399' : '#a5b4fc' }}></span>
          {aiMode === 'live' ? 'Gemini 2.5 Flash' : 'Edge NLP Engine'}
        </button>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={onOpenSettings} 
          title="AI Settings & API Key"
        >
          <Settings size={15} />
        </button>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={onResetData} 
          title="Reset to 900+ Seed Submissions"
        >
          <RotateCcw size={15} />
        </button>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
