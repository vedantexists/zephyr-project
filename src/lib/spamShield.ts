import { cosineSimilarity } from './similarity';
import { embedNgram } from '../ai/ngramEmbedder';
import type { Meal, Submission } from '../types';

export interface SpamValidationResult {
  allowed: boolean;
  status: 'valid' | 'blocked_duplicate' | 'blocked_burst' | 'blocked_similar';
  reason?: string;
}

const HISTORY_KEY = 'mess_digest_shield_records';
const BLOCKED_COUNT_KEY = 'mess_digest_blocked_count';

interface ShieldRecord {
  studentHash: string;
  meal: Meal;
  dateStr: string;
  timestamp: number;
  commentVector?: number[]; // For near-duplicate cosine checking
}

/**
 * Generates SHA-256 hash of student roll number so raw IDs are never stored.
 */
export async function hashStudentRoll(roll: string): Promise<string> {
  const clean = roll.trim().toUpperCase();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
  }
  // Fallback simple hash for non-crypto contexts
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export class SpamShield {
  /**
   * Validates submission against:
   * 1. One per meal per day
   * 2. Burst limit (>3 in 60s)
   * 3. Near-duplicate cosine > 0.92
   */
  static validate(
    studentHash: string,
    meal: Meal,
    comment?: string
  ): SpamValidationResult {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getRecords();

    // 1. One submission per meal on the same day
    const duplicate = records.find(
      r => r.studentHash === studentHash && r.meal === meal && r.dateStr === today
    );
    if (duplicate) {
      this.incrementBlockedCount();
      return {
        allowed: false,
        status: 'blocked_duplicate',
        reason: `Duplicate blocked: Student ${studentHash} already submitted for today's ${meal}. Max 1 rating per meal window.`
      };
    }

    // 2. Burst check: >3 submissions in 60s across any meal from same hash
    const now = Date.now();
    const recentBurst = records.filter(
      r => r.studentHash === studentHash && now - r.timestamp < 60000
    );
    if (recentBurst.length >= 3) {
      this.incrementBlockedCount();
      return {
        allowed: false,
        status: 'blocked_burst',
        reason: `Burst rate limit: Multiple submissions detected within 60s for student ${studentHash}. Cooling down.`
      };
    }

    // 3. Near-duplicate check: Cosine similarity > 0.92 against recent comments from same hash
    if (comment && comment.trim().length > 10) {
      const candidateVec = embedNgram(comment);
      const studentComments = records.filter(
        r => r.studentHash === studentHash && r.commentVector
      );

      for (const rec of studentComments) {
        if (rec.commentVector) {
          const recVec = new Float32Array(rec.commentVector);
          const sim = cosineSimilarity(candidateVec, recVec);
          if (sim > 0.92) {
            this.incrementBlockedCount();
            return {
              allowed: false,
              status: 'blocked_similar',
              reason: `Near-duplicate comment detected (Similarity ${(sim * 100).toFixed(1)}%). Submission blocked to prevent sentiment brigade.`
            };
          }
        }
      }
    }

    return { allowed: true, status: 'valid' };
  }

  static record(submission: Submission): void {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getRecords();
    const commentVec = submission.comment ? Array.from(embedNgram(submission.comment)) : undefined;

    records.push({
      studentHash: submission.studentHash,
      meal: submission.meal,
      dateStr: today,
      timestamp: Date.now(),
      commentVector: commentVec
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(-200)));
  }

  static getBlockedCount(): number {
    if (typeof localStorage === 'undefined') return 0;
    const raw = localStorage.getItem(BLOCKED_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  }

  static incrementBlockedCount(): number {
    if (typeof localStorage === 'undefined') return 1;
    const current = this.getBlockedCount() + 1;
    localStorage.setItem(BLOCKED_COUNT_KEY, current.toString());
    return current;
  }

  static reset(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
    localStorage.setItem(BLOCKED_COUNT_KEY, '0');
  }

  private static getRecords(): ShieldRecord[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
