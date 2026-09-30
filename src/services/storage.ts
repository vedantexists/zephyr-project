import type { FeedbackSubmission, MealType, DayOfWeek } from '../types';
import { generateWeeklySeedData, TEST_CASE_1, TEST_CASE_2 } from './seedData';
import { SpamShieldService } from './spamShield';

const SUBMISSIONS_KEY = 'mess_digest_all_submissions';

export class StorageService {
  /**
   * Loads all feedback submissions. If empty, initializes with 900+ seed records.
   */
  static getSubmissions(): FeedbackSubmission[] {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      const seed = generateWeeklySeedData();
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(raw);
    } catch {
      const seed = generateWeeklySeedData();
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seed));
      return seed;
    }
  }

  /**
   * Adds a new feedback submission after validating against spam shield
   */
  static addSubmission(submission: FeedbackSubmission): { success: boolean; reason?: string } {
    const validation = SpamShieldService.validateSubmission(
      submission.studentHash,
      submission.meal,
      submission.comment
    );

    if (!validation.allowed) {
      return { success: false, reason: validation.reason };
    }

    const current = this.getSubmissions();
    current.unshift(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(current));
    SpamShieldService.recordSubmission(submission);

    return { success: true };
  }

  /**
   * Resets data to initial state containing the 900+ seed dataset
   */
  static resetToSeed(): FeedbackSubmission[] {
    const seed = generateWeeklySeedData();
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(seed));
    SpamShieldService.resetHistory();
    return seed;
  }

  /**
   * Injects Test Case 1 explicitly
   */
  static injectTestCase1(): FeedbackSubmission {
    const current = this.getSubmissions();
    const updated = [TEST_CASE_1, ...current.filter(s => s.id !== TEST_CASE_1.id)];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    return TEST_CASE_1;
  }

  /**
   * Injects Test Case 2 explicitly
   */
  static injectTestCase2(): FeedbackSubmission {
    const current = this.getSubmissions();
    const updated = [TEST_CASE_2, ...current.filter(s => s.id !== TEST_CASE_2.id)];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    return TEST_CASE_2;
  }

  /**
   * Calculates quick aggregation metrics for charts and dashboards
   */
  static getMetrics(submissions: FeedbackSubmission[]) {
    const total = submissions.length;
    const avgRating = total > 0 
      ? Number((submissions.reduce((acc, s) => acc + s.rating, 0) / total).toFixed(2)) 
      : 0;

    const byMeal: Record<MealType, { count: number; avgRating: number; sum: number }> = {
      Breakfast: { count: 0, avgRating: 0, sum: 0 },
      Lunch: { count: 0, avgRating: 0, sum: 0 },
      Snacks: { count: 0, avgRating: 0, sum: 0 },
      Dinner: { count: 0, avgRating: 0, sum: 0 }
    };

    const byDay: Record<DayOfWeek, { count: number; avgRating: number; sum: number }> = {
      Monday: { count: 0, avgRating: 0, sum: 0 },
      Tuesday: { count: 0, avgRating: 0, sum: 0 },
      Wednesday: { count: 0, avgRating: 0, sum: 0 },
      Thursday: { count: 0, avgRating: 0, sum: 0 },
      Friday: { count: 0, avgRating: 0, sum: 0 },
      Saturday: { count: 0, avgRating: 0, sum: 0 },
      Sunday: { count: 0, avgRating: 0, sum: 0 }
    };

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    submissions.forEach(s => {
      const r = Math.min(5, Math.max(1, Math.round(s.rating))) as 1|2|3|4|5;
      ratingCounts[r]++;

      if (byMeal[s.meal]) {
        byMeal[s.meal].count++;
        byMeal[s.meal].sum += s.rating;
      }

      if (byDay[s.dayOfWeek]) {
        byDay[s.dayOfWeek].count++;
        byDay[s.dayOfWeek].sum += s.rating;
      }
    });

    Object.keys(byMeal).forEach(m => {
      const key = m as MealType;
      byMeal[key].avgRating = byMeal[key].count > 0 
        ? Number((byMeal[key].sum / byMeal[key].count).toFixed(2)) 
        : 0;
    });

    Object.keys(byDay).forEach(d => {
      const key = d as DayOfWeek;
      byDay[key].avgRating = byDay[key].count > 0 
        ? Number((byDay[key].sum / byDay[key].count).toFixed(2)) 
        : 0;
    });

    return {
      total,
      avgRating,
      byMeal,
      byDay,
      ratingCounts
    };
  }
}
