export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type PillarCategory = 
  | 'taste_temperature' 
  | 'portion_stockout' 
  | 'hygiene_cleanliness' 
  | 'queue_speed' 
  | 'positive_compliment';

export interface FeedbackSubmission {
  id: string;
  studentHash: string; // e.g. "Roll #23CS104" or hashed identifier
  timestamp: string; // ISO date string
  dayOfWeek: DayOfWeek;
  meal: MealType;
  rating: number; // 1 to 5
  tags: string[]; // e.g. ["Watery Dal", "Cold Chapati"]
  comment?: string;
  languageDetected?: 'English' | 'Hinglish' | 'Hindi';
  extractedEntities?: {
    dish?: string;
    issue?: string;
    timeMentioned?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  timeToSubmitSeconds: number; // Verification of <10s constraint
  status: 'valid' | 'flagged_duplicate' | 'spam_shielded';
}

export interface GrievanceCluster {
  id: string;
  title: string;
  meal: MealType;
  day?: DayOfWeek | string;
  category: PillarCategory;
  reportCount: number;
  severity: 'critical' | 'high' | 'medium';
  sampleQuotes: string[];
  actionItem: string;
  sentimentScore: number;
}

export interface KitchenActionItem {
  id: string;
  role: 'Head Cook' | 'Store Incharge' | 'Cleaning Supervisor' | 'Mess Warden';
  action: string;
  urgency: 'Immediate' | 'Today' | 'Weekly Review';
  completed: boolean;
}

export interface ExecutiveDigest {
  generatedAt: string;
  period: 'Daily' | 'Weekly (900 Meals)';
  executiveHeadline: string;
  overallRating: number; // e.g. 3.4
  ratingDeltaWoW: number; // e.g. +0.3
  totalFeedbackCount: number;
  spamShieldedCount: number;
  pillars: {
    taste_temperature: {
      score: number;
      status: 'healthy' | 'warning' | 'critical';
      summary: string;
    };
    portion_stockout: {
      score: number;
      status: 'healthy' | 'warning' | 'critical';
      summary: string;
    };
    hygiene_cleanliness: {
      score: number;
      status: 'healthy' | 'warning' | 'critical';
      summary: string;
    };
    queue_speed: {
      score: number;
      status: 'healthy' | 'warning' | 'critical';
      summary: string;
    };
  };
  topGrievanceClusters: GrievanceCluster[];
  kitchenActionChecklist: KitchenActionItem[];
  positiveHighlights: string[];
  estimatedReadTimeSeconds: number; // strictly enforces <120s (2 minutes)
  aiEngineUsed: string; // e.g. "Gemini 2.5 Flash" or "Deterministic Edge NLP Engine"
}

export interface SpamShieldLog {
  id: string;
  timestamp: string;
  studentHash: string;
  meal: MealType;
  attemptCount: number;
  reason: string;
  actionTaken: 'Blocked Duplicate' | 'Rate Limited' | 'Sentiment Brigade Flagged';
}

export interface MealScheduleInfo {
  type: MealType;
  startTime: string;
  endTime: string;
  menu: string[];
}
