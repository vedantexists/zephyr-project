import type { FeedbackSubmission, MealType, SpamShieldLog } from '../types';

const SPAM_LOG_KEY = 'mess_digest_spam_shield_logs';
const SUBMISSION_RECORD_KEY = 'mess_digest_student_history';

interface SubmissionRecord {
  studentHash: string;
  meal: MealType;
  dateStr: string; // YYYY-MM-DD
  timestamp: number;
}

export class SpamShieldService {
  /**
   * Checks if a student can submit feedback for a specific meal.
   * Prevents duplicate ratings for the same meal on the same day.
   */
  static validateSubmission(
    studentHash: string, 
    meal: MealType, 
    _rawComment?: string
  ): { allowed: boolean; reason?: string } {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getRecords();

    // 1. Check duplicate meal submission on same day
    const existing = records.find(
      (r) => r.studentHash.toLowerCase() === studentHash.toLowerCase() && 
             r.meal === meal && 
             r.dateStr === today
    );

    if (existing) {
      const minutesAgo = Math.floor((Date.now() - existing.timestamp) / 60000);
      const reason = `Duplicate blocked: Student ${studentHash} already submitted a rating for today's ${meal} (${minutesAgo < 1 ? 'just now' : `${minutesAgo}m ago`}). To prevent rating skew, only 1 verified submission per meal is counted.`;
      
      this.logSpamEvent({
        studentHash,
        meal,
        reason: 'Duplicate submission for same meal window',
        actionTaken: 'Blocked Duplicate'
      });

      return { allowed: false, reason };
    }

    // 2. Cooldown check: No submission within 30 seconds across any meal to prevent bot spam
    const lastStudentSub = records
      .filter((r) => r.studentHash.toLowerCase() === studentHash.toLowerCase())
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (lastStudentSub && Date.now() - lastStudentSub.timestamp < 30000) {
      const waitSec = Math.ceil((30000 - (Date.now() - lastStudentSub.timestamp)) / 1000);
      const reason = `Rate limit alert: Fast submission burst detected for ${studentHash}. Please wait ${waitSec}s before submitting again.`;
      
      this.logSpamEvent({
        studentHash,
        meal,
        reason: 'Rapid burst submission (<30s interval)',
        actionTaken: 'Rate Limited'
      });

      return { allowed: false, reason };
    }

    return { allowed: true };
  }

  /**
   * Records a valid submission to the shield ledger
   */
  static recordSubmission(submission: FeedbackSubmission): void {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getRecords();
    records.push({
      studentHash: submission.studentHash,
      meal: submission.meal,
      dateStr: today,
      timestamp: Date.now()
    });
    localStorage.setItem(SUBMISSION_RECORD_KEY, JSON.stringify(records));
  }

  /**
   * Retrieves all logged spam events
   */
  static getLogs(): SpamShieldLog[] {
    const stored = localStorage.getItem(SPAM_LOG_KEY);
    if (!stored) {
      // Return realistic mock seed logs for demonstration
      return [
        {
          id: 'spam-101',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          studentHash: 'Roll #23CS089',
          meal: 'Lunch',
          attemptCount: 3,
          reason: 'Duplicate rating submitted 4 minutes after first entry for Wednesday Lunch',
          actionTaken: 'Blocked Duplicate'
        },
        {
          id: 'spam-102',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          studentHash: 'Roll #22ME045',
          meal: 'Breakfast',
          attemptCount: 2,
          reason: 'Identical 1-star comment flood detected within 12 seconds',
          actionTaken: 'Rate Limited'
        },
        {
          id: 'spam-103',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          studentHash: 'Roll #24EE112',
          meal: 'Dinner',
          attemptCount: 4,
          reason: 'Automated repeat submission pattern blocked',
          actionTaken: 'Sentiment Brigade Flagged'
        }
      ];
    }
    return JSON.parse(stored);
  }

  private static logSpamEvent(event: Omit<SpamShieldLog, 'id' | 'timestamp' | 'attemptCount'>): void {
    const logs = this.getLogs();
    const newLog: SpamShieldLog = {
      id: `spam-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      studentHash: event.studentHash,
      meal: event.meal,
      attemptCount: 1,
      reason: event.reason,
      actionTaken: event.actionTaken
    };
    logs.unshift(newLog);
    localStorage.setItem(SPAM_LOG_KEY, JSON.stringify(logs.slice(0, 50)));
  }

  private static getRecords(): SubmissionRecord[] {
    const stored = localStorage.getItem(SUBMISSION_RECORD_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static resetHistory(): void {
    localStorage.removeItem(SUBMISSION_RECORD_KEY);
    localStorage.removeItem(SPAM_LOG_KEY);
  }
}
