import type { Submission, Digest } from '../types';
import { generateSeedSubmissions } from '../data/seed';
import { SpamShield } from './spamShield';
import { buildExecutiveDigest } from './digest';
import { extractEntities } from './entities';
import { scorePillars } from './pillars';
import { getActiveEngine } from '../ai/embedder';

const CURRENT_WEEK_KEY = 'mess_digest_v3_current_week';
const PRIOR_WEEK_KEY = 'mess_digest_v3_prior_week';

class Store {
  private currentWeek: Submission[] = [];
  private priorWeek: Submission[] = [];
  private cachedDigest: Digest | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const rawCurrent = localStorage.getItem(CURRENT_WEEK_KEY);
    const rawPrior = localStorage.getItem(PRIOR_WEEK_KEY);

    if (rawCurrent && rawPrior) {
      try {
        this.currentWeek = JSON.parse(rawCurrent);
        this.priorWeek = JSON.parse(rawPrior);
      } catch {
        this.resetToDefaultSeed();
      }
    } else {
      this.resetToDefaultSeed();
    }
  }

  public getCurrentWeek(): Submission[] {
    return this.currentWeek;
  }

  public getPriorWeek(): Submission[] {
    return this.priorWeek;
  }

  /**
   * Fast synchronous submit (<50ms) with anti-spam check.
   * Then runs NLP analysis asynchronously.
   */
  public submitFeedback(payload: {
    studentHash: string;
    meal: Submission['meal'];
    day: Submission['day'];
    rating: Submission['rating'];
    quickTags: string[];
    comment?: string;
    msToSubmit: number;
  }): { allowed: boolean; submission?: Submission; reason?: string } {
    // 1. Spam Shield Validation
    const validation = SpamShield.validate(
      payload.studentHash,
      payload.meal,
      payload.comment
    );

    if (!validation.allowed) {
      return {
        allowed: false,
        reason: validation.reason
      };
    }

    // 2. Synchronous NLP extraction (<5ms)
    let analysis: Submission['analysis'] = undefined;
    if (payload.comment || payload.quickTags.length > 0) {
      const entities = extractEntities(payload.comment, payload.quickTags);
      const pillars = scorePillars(payload.comment || '', payload.quickTags);
      analysis = {
        engine: getActiveEngine(),
        language: entities.language,
        pillars,
        tags: entities.tags,
        dishes: entities.dishes,
        times: entities.times,
        severity: entities.severity
      };
    }

    const newSub: Submission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentHash: payload.studentHash,
      ts: new Date().toISOString(),
      day: payload.day,
      meal: payload.meal,
      rating: payload.rating,
      quickTags: payload.quickTags,
      comment: payload.comment,
      msToSubmit: payload.msToSubmit,
      status: 'valid',
      week: 'current',
      analysis
    };

    // 3. Record in store & Spam Shield
    this.currentWeek.unshift(newSub);
    this.persist();
    SpamShield.record(newSub);

    // Invalidate cached digest
    this.cachedDigest = null;

    return {
      allowed: true,
      submission: newSub
    };
  }

  public getDigest(): Digest {
    if (!this.cachedDigest) {
      this.cachedDigest = buildExecutiveDigest(
        this.currentWeek,
        this.priorWeek,
        getActiveEngine()
      );
    }
    return this.cachedDigest;
  }

  public refreshDigest(): Digest {
    this.cachedDigest = buildExecutiveDigest(
      this.currentWeek,
      this.priorWeek,
      getActiveEngine()
    );
    return this.cachedDigest;
  }

  public resetToDefaultSeed(): void {
    const { currentWeek, priorWeek } = generateSeedSubmissions();
    this.currentWeek = currentWeek;
    this.priorWeek = priorWeek;
    this.persist();
    SpamShield.reset();
    this.cachedDigest = null;
  }

  private persist() {
    localStorage.setItem(CURRENT_WEEK_KEY, JSON.stringify(this.currentWeek));
    localStorage.setItem(PRIOR_WEEK_KEY, JSON.stringify(this.priorWeek));
  }
}

export const store = new Store();
