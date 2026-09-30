export type Meal = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type Pillar = 'taste' | 'portion' | 'hygiene' | 'delay' | 'stockout' | 'positive';

export interface Analysis {
  engine: 'lightweight' | 'semantic';
  language: 'English' | 'Hinglish' | 'Hindi';
  pillars: { pillar: Pillar; score: number }[];
  tags: string[]; // e.g. "Taste: Under-salted", "Temp: Cold", "Stockout"
  dishes: string[];
  times: string[];
  severity: 'low' | 'medium' | 'high';
  clusterId?: string;
}

export interface Submission {
  id: string;
  studentHash: string; // SHA-256 of roll number; raw roll never stored
  ts: string;
  day: Day;
  meal: Meal;
  rating: 1 | 2 | 3 | 4 | 5;
  quickTags: string[];
  comment?: string;
  msToSubmit: number;
  status: 'valid' | 'blocked_duplicate' | 'blocked_burst' | 'blocked_similar';
  week: 'current' | 'prior';
  templateId?: string;
  analysis?: Analysis;
}

export interface Cluster {
  id: string;
  day: Day;
  meal: Meal;
  pillar: Pillar;
  title: string;
  count: number;
  avgRating: number;
  severityScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  medianTime?: string;
  representativeQuote: string;
  recommendedAction: string;
  submissionIds: string[];
}

export interface ActionItem {
  id: string;
  role: 'Head Cook' | 'Store Incharge' | 'Cleaning Supervisor' | 'Mess Warden';
  directive: string;
  urgency: 'Immediate' | 'Today' | 'Weekly Review';
  completed: boolean;
}

export interface Digest {
  generatedAt: string;
  headline: string;
  overallRating: number; // e.g. 3.4
  priorWeekRating: number; // e.g. 3.1
  wowDelta: number; // e.g. +0.3
  totalSubmissions: number;
  redAlertsCount: number;
  blockedCount: number;
  readTimeSeconds: number; // words / 200 * 60 (strictly < 120s)
  wordCount: number;
  topClusters: Cluster[];
  anomalies: Array<{
    day: Day;
    meal: Meal;
    avgRating: number;
    deltaFromMean: number;
    issue: string;
  }>;
  actionChecklist: ActionItem[];
  positives: string[];
  engineUsed: 'lightweight' | 'semantic';
}

export interface Embedder {
  name: 'lightweight' | 'semantic';
  embed(texts: string[]): Promise<Float32Array[]>; // L2-normalized
}
