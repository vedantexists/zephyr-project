import type { Submission, Meal, Day } from '../types';
import { COMMENT_TEMPLATES } from './commentTemplates';
import { extractEntities } from '../lib/entities';
import { scorePillars } from '../lib/pillars';

/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Ensures 100% deterministic dataset generation across all runs and platforms.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TEST_CASE_1_SUBMISSION: Submission = {
  id: 'sub-tue-dinner-target',
  studentHash: '7a9f02c1b84e',
  ts: '2026-09-29T21:15:00.000Z',
  day: 'Tue',
  meal: 'Dinner',
  rating: 2,
  quickTags: ['Watery Dal', 'Cold Food'],
  comment: 'Dal was too watery and chapati was cold and hard after 8:30.',
  msToSubmit: 5200,
  status: 'valid',
  week: 'current',
  templateId: 't-tue-1',
  analysis: {
    engine: 'lightweight',
    language: 'English',
    pillars: [
      { pillar: 'taste', score: 0.89 }
    ],
    tags: ['Taste: Poor', 'Temp: Cold', 'Consistency: Watery'],
    dishes: ['Dal', 'Chapati'],
    times: ['after 8:30'],
    severity: 'high'
  }
};

export const TEST_CASE_2_SUBMISSION: Submission = {
  id: 'sub-wed-lunch-target',
  studentHash: '3c8d19e4a05f',
  ts: '2026-09-30T13:20:00.000Z',
  day: 'Wed',
  meal: 'Lunch',
  rating: 1,
  quickTags: ['No Salt', 'Ran Out', 'Refill Delay'],
  comment: 'Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe.',
  msToSubmit: 6800,
  status: 'valid',
  week: 'current',
  templateId: 't-wed-1',
  analysis: {
    engine: 'lightweight',
    language: 'Hinglish',
    pillars: [
      { pillar: 'stockout', score: 0.92 },
      { pillar: 'taste', score: 0.86 }
    ],
    tags: ['Taste: Under-salted', 'Quantity: Stockout at 1:15 pm', 'Stockout', 'Refill Delay'],
    dishes: ['Chole', 'Rice'],
    times: ['1:15 pm'],
    severity: 'high'
  }
};

export function generateSeedSubmissions(): { currentWeek: Submission[]; priorWeek: Submission[] } {
  const rand = mulberry32(42);
  const currentWeek: Submission[] = [];
  const priorWeek: Submission[] = [];

  const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const meals: Meal[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  // 1. Add Test Case 1 and 23 sibling reports for Tuesday Dinner (~24 total)
  currentWeek.push(TEST_CASE_1_SUBMISSION);
  for (let i = 1; i <= 23; i++) {
    const tmpl = COMMENT_TEMPLATES.find(t => t.id === `t-tue-${(i % 8) + 1}`) || COMMENT_TEMPLATES[0];
    const entities = extractEntities(tmpl.text, ['Watery Dal', 'Cold Food']);
    const pillars = scorePillars(tmpl.text, ['Watery Dal', 'Cold Food']);

    currentWeek.push({
      id: `tue-din-${i}`,
      studentHash: `hash_tue_${i}`,
      ts: `2026-09-29T21:${(15 + (i % 30)).toString().padStart(2, '0')}:00.000Z`,
      day: 'Tue',
      meal: 'Dinner',
      rating: (i % 3 === 0 ? 1 : 2) as 1 | 2,
      quickTags: ['Watery Dal', 'Cold Food'],
      comment: tmpl.text,
      msToSubmit: Math.round(3200 + rand() * 3000),
      status: 'valid',
      week: 'current',
      templateId: tmpl.id,
      analysis: {
        engine: 'lightweight',
        language: entities.language,
        pillars,
        tags: entities.tags,
        dishes: entities.dishes,
        times: entities.times,
        severity: entities.severity
      }
    });
  }

  // 2. Add Test Case 2 and 41 sibling reports for Wednesday Lunch (~42 total stockout & salt)
  currentWeek.push(TEST_CASE_2_SUBMISSION);
  for (let i = 1; i <= 41; i++) {
    const tmpl = COMMENT_TEMPLATES.find(t => t.id === `t-wed-${(i % 8) + 1}`) || COMMENT_TEMPLATES[8];
    const entities = extractEntities(tmpl.text, ['No Salt', 'Ran Out']);
    const pillars = scorePillars(tmpl.text, ['No Salt', 'Ran Out']);

    currentWeek.push({
      id: `wed-lun-${i}`,
      studentHash: `hash_wed_${i}`,
      ts: `2026-09-30T13:${(15 + (i % 30)).toString().padStart(2, '0')}:00.000Z`,
      day: 'Wed',
      meal: 'Lunch',
      rating: 1,
      quickTags: ['No Salt', 'Ran Out'],
      comment: tmpl.text,
      msToSubmit: Math.round(3500 + rand() * 2500),
      status: 'valid',
      week: 'current',
      templateId: tmpl.id,
      analysis: {
        engine: 'lightweight',
        language: entities.language,
        pillars,
        tags: entities.tags,
        dishes: entities.dishes,
        times: entities.times,
        severity: entities.severity
      }
    });
  }

  // 3. Add Sunday Special Breakfast (60 submissions, mean ~4.8)
  for (let i = 1; i <= 60; i++) {
    const tmpl = COMMENT_TEMPLATES.find(t => t.id === `t-sun-${(i % 5) + 1}`) || COMMENT_TEMPLATES[16];
    const entities = extractEntities(tmpl.text, ['Loved It']);
    const pillars = scorePillars(tmpl.text, ['Loved It']);

    currentWeek.push({
      id: `sun-bkf-${i}`,
      studentHash: `hash_sun_${i}`,
      ts: `2026-09-27T09:${(15 + (i % 40)).toString().padStart(2, '0')}:00.000Z`,
      day: 'Sun',
      meal: 'Breakfast',
      rating: (rand() < 0.8 ? 5 : 4) as 4 | 5,
      quickTags: ['Loved It'],
      comment: tmpl.text,
      msToSubmit: Math.round(2800 + rand() * 2000),
      status: 'valid',
      week: 'current',
      templateId: tmpl.id,
      analysis: {
        engine: 'lightweight',
        language: entities.language,
        pillars,
        tags: entities.tags,
        dishes: entities.dishes,
        times: entities.times,
        severity: 'low'
      }
    });
  }

  // 4. Fill remaining current week records up to 900 total submissions
  // Calibrate overall average to 3.4
  const targetCurrentTotal = 900;
  const currentCountSoFar = currentWeek.length; // 24 + 42 + 60 = 126
  const needed = targetCurrentTotal - currentCountSoFar;

  for (let k = 0; k < needed; k++) {
    const day = days[k % days.length];
    const meal = meals[k % meals.length];

    // Controlled distribution around 3.4
    const r = rand();
    let rating: 1 | 2 | 3 | 4 | 5 = 3;
    if (r < 0.12) rating = 1;
    else if (r < 0.28) rating = 2;
    else if (r < 0.58) rating = 3;
    else if (r < 0.85) rating = 4;
    else rating = 5;

    // Day/Meal adjustments
    if (day === 'Wed' && meal === 'Lunch') rating = Math.min(rating, 2) as 1 | 2;
    if (day === 'Sun' && meal === 'Breakfast') rating = 5;

    const hasComment = rand() < 0.35;
    let comment: string | undefined;
    let templateId: string | undefined;
    let entities: any;
    let pillars: any;

    const quickTags: string[] = [];
    if (rating <= 2) {
      const q = ['Long Queue', 'Unclean', 'Cold Food', 'Watery Dal'];
      quickTags.push(q[k % q.length]);
      if (hasComment) {
        const pool = COMMENT_TEMPLATES.filter(t => t.rating <= 2);
        const chosen = pool[k % pool.length];
        comment = chosen.text;
        templateId = chosen.id;
      }
    } else if (rating >= 4) {
      quickTags.push('Loved It');
      if (hasComment) {
        const pool = COMMENT_TEMPLATES.filter(t => t.rating >= 4);
        const chosen = pool[k % pool.length];
        comment = chosen.text;
        templateId = chosen.id;
      }
    }

    if (comment) {
      entities = extractEntities(comment, quickTags);
      pillars = scorePillars(comment, quickTags);
    }

    currentWeek.push({
      id: `seed-curr-${k}`,
      studentHash: `hash_std_${k % 350}`,
      ts: `2026-09-${24 + (days.indexOf(day))}T12:00:00.000Z`,
      day,
      meal,
      rating,
      quickTags,
      comment,
      msToSubmit: Math.round(3100 + rand() * 3500),
      status: 'valid',
      week: 'current',
      templateId,
      analysis: comment ? {
        engine: 'lightweight',
        language: entities.language,
        pillars,
        tags: entities.tags,
        dishes: entities.dishes,
        times: entities.times,
        severity: entities.severity
      } : undefined
    });
  }

  // 5. Generate Prior Week (~650 submissions, calibrated mean ~3.1)
  for (let p = 0; p < 650; p++) {
    const day = days[p % days.length];
    const meal = meals[p % meals.length];
    const r = rand();
    let rating: 1 | 2 | 3 | 4 | 5 = 3;
    if (r < 0.20) rating = 1;
    else if (r < 0.42) rating = 2;
    else if (r < 0.75) rating = 3;
    else if (r < 0.90) rating = 4;
    else rating = 5;

    priorWeek.push({
      id: `seed-prior-${p}`,
      studentHash: `hash_prior_${p % 300}`,
      ts: `2026-09-${17 + (days.indexOf(day))}T12:00:00.000Z`,
      day,
      meal,
      rating,
      quickTags: rating <= 2 ? ['Cold Food'] : ['Loved It'],
      msToSubmit: Math.round(3200 + rand() * 3000),
      status: 'valid',
      week: 'prior'
    });
  }

  // Calibration check: Adjust slightly to guarantee weekly mean is ~3.4 (e.g. 3.39-3.41)
  const currentSum = currentWeek.reduce((acc, s) => acc + s.rating, 0);
  const targetCurrentSum = Math.round(currentWeek.length * 3.40);
  const diff = targetCurrentSum - currentSum;
  if (diff !== 0) {
    const step = diff > 0 ? 1 : -1;
    let countToAdjust = Math.abs(diff);
    for (let i = 0; i < currentWeek.length && countToAdjust > 0; i++) {
      // Don't modify Test Case 1, Test Case 2, or Sunday breakfast
      if (currentWeek[i].id.startsWith('seed-curr-')) {
        const curR = currentWeek[i].rating;
        const newR = curR + step;
        if (newR >= 1 && newR <= 5) {
          currentWeek[i].rating = newR as 1 | 2 | 3 | 4 | 5;
          countToAdjust--;
        }
      }
    }
  }

  // Prior week calibration: guarantee prior week mean is ~3.10
  const priorSum = priorWeek.reduce((acc, s) => acc + s.rating, 0);
  const targetPriorSum = Math.round(priorWeek.length * 3.10);
  const priorDiff = targetPriorSum - priorSum;
  if (priorDiff !== 0) {
    const step = priorDiff > 0 ? 1 : -1;
    let countToAdjust = Math.abs(priorDiff);
    for (let i = 0; i < priorWeek.length && countToAdjust > 0; i++) {
      const curR = priorWeek[i].rating;
      const newR = curR + step;
      if (newR >= 1 && newR <= 5) {
        priorWeek[i].rating = newR as 1 | 2 | 3 | 4 | 5;
        countToAdjust--;
      }
    }
  }

  return { currentWeek, priorWeek };
}
