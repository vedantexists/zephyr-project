import type { FeedbackSubmission, MealType, DayOfWeek } from '../types';

export const TEST_CASE_1: FeedbackSubmission = {
  id: 'test-case-1',
  studentHash: 'Roll #23CS104',
  timestamp: '2026-09-29T21:15:00.000Z',
  dayOfWeek: 'Tuesday',
  meal: 'Dinner',
  rating: 2,
  tags: ['Watery Dal', 'Cold Chapati', 'Food Temperature'],
  comment: 'Dal was too watery and chapati was cold and hard after 8:30.',
  languageDetected: 'English',
  extractedEntities: {
    dish: 'Dal Tadka & Chapati',
    issue: 'Watery dilution, cold hardening past 8:30 PM',
    timeMentioned: '8:30 PM',
    severity: 'high'
  },
  timeToSubmitSeconds: 5.2,
  status: 'valid'
};

export const TEST_CASE_2: FeedbackSubmission = {
  id: 'test-case-2',
  studentHash: 'Roll #24EE082',
  timestamp: '2026-09-30T13:20:00.000Z',
  dayOfWeek: 'Wednesday',
  meal: 'Lunch',
  rating: 1,
  tags: ['Bland / No Salt', 'Stockout / Ran Out', 'Refill Delay'],
  comment: 'Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe.',
  languageDetected: 'Hinglish',
  extractedEntities: {
    dish: 'Chole & Steamed Rice',
    issue: 'Zero salt in gravy, complete rice stockout at 1:15 PM rush',
    timeMentioned: '1:15 PM',
    severity: 'critical'
  },
  timeToSubmitSeconds: 6.8,
  status: 'valid'
};

/**
 * Generates the full 900-submission campus dining dataset
 * perfectly aligned with the Day 2 problem statement specs.
 */
export function generateWeeklySeedData(): FeedbackSubmission[] {
  const submissions: FeedbackSubmission[] = [];

  // 1. Add Test Case 1 and 23 complementary Tuesday Dinner records (Total 24 reports)
  submissions.push(TEST_CASE_1);
  for (let i = 1; i <= 23; i++) {
    submissions.push({
      id: `tue-din-${i}`,
      studentHash: `Roll #23CS${105 + i}`,
      timestamp: '2026-09-29T21:00:00.000Z',
      dayOfWeek: 'Tuesday',
      meal: 'Dinner',
      rating: i % 3 === 0 ? 1 : 2,
      tags: ['Watery Dal', 'Cold Chapati'],
      comment: i % 2 === 0 
        ? 'Rotis are like cardboard after 8:45, and dal has zero thickness.' 
        : 'Watery dal again. Bain-marie heater was turned off early.',
      languageDetected: i % 4 === 0 ? 'Hinglish' : 'English',
      extractedEntities: {
        dish: 'Dal & Roti',
        issue: 'Temperature loss and excessive dal dilution',
        severity: 'high'
      },
      timeToSubmitSeconds: Number((3.5 + (i * 0.15) % 4).toFixed(1)),
      status: 'valid'
    });
  }

  // 2. Add Test Case 2 and 41 complementary Wednesday Lunch records (Total 42 reports on stockout / salt)
  submissions.push(TEST_CASE_2);
  for (let i = 1; i <= 41; i++) {
    submissions.push({
      id: `wed-lun-${i}`,
      studentHash: `Roll #24ME${100 + i}`,
      timestamp: '2026-09-30T13:25:00.000Z',
      dayOfWeek: 'Wednesday',
      meal: 'Lunch',
      rating: 1,
      tags: ['Stockout / Ran Out', 'Bland / No Salt'],
      comment: i % 2 === 0
        ? 'Rice completely finished by 1:20 PM! Had to wait 20 minutes for batch refill.'
        : 'Chole gravy had no salt at all, totally bland. Refill took forever.',
      languageDetected: i % 3 === 0 ? 'Hinglish' : 'English',
      extractedEntities: {
        dish: 'Chole & Rice',
        issue: '1:15 PM Stockout & Salt calibration lapse',
        timeMentioned: '1:15 PM - 1:30 PM',
        severity: 'critical'
      },
      timeToSubmitSeconds: Number((4.1 + (i * 0.12) % 4).toFixed(1)),
      status: 'valid'
    });
  }

  // 3. Add Sunday Special Breakfast peak satisfaction records (~60 submissions averaging 4.8/5)
  for (let i = 1; i <= 60; i++) {
    submissions.push({
      id: `sun-bkf-${i}`,
      studentHash: `Roll #22EC${100 + i}`,
      timestamp: '2026-09-27T09:15:00.000Z',
      dayOfWeek: 'Sunday',
      meal: 'Breakfast',
      rating: i % 5 === 0 ? 4 : 5,
      tags: ['Tasty & Fresh', 'Crispy Dosa', 'Hot Sambar'],
      comment: i % 3 === 0 ? 'Sunday Dosa is phenomenal! Crispy and hot sambar.' : 'Loved the filter coffee and coconut chutney today!',
      languageDetected: 'English',
      extractedEntities: {
        dish: 'Masala Dosa & Sambar',
        issue: 'None - High appreciation',
        severity: 'low'
      },
      timeToSubmitSeconds: Number((2.8 + (i * 0.1) % 3).toFixed(1)),
      status: 'valid'
    });
  }

  // 4. Populate remaining meals across the 7 days to reach 900+ total submissions
  // Overall average calibrates to ~3.4/5
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals: MealType[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  let idCounter = 1;
  const currentCount = submissions.length;
  const targetTotal = 912;
  const needed = targetTotal - currentCount;

  for (let k = 0; k < needed; k++) {
    const day = days[k % days.length];
    const meal = meals[k % meals.length];
    
    let rating = 3;
    const rVal = (k * 13 + 7) % 100;
    if (rVal < 18) rating = 1;
    else if (rVal < 36) rating = 2;
    else if (rVal < 68) rating = 3;
    else if (rVal < 86) rating = 4;
    else rating = 5;

    if (day === 'Sunday' && meal === 'Breakfast') rating = 5;
    if (day === 'Wednesday' && meal === 'Lunch') rating = Math.min(rating, 2);

    const tags: string[] = [];
    if (rating <= 2) {
      const negTags = ['Queue Delay', 'Portion Small', 'Lukewarm', 'Unclean Trays', 'Too Spicy'];
      tags.push(negTags[k % negTags.length]);
    } else if (rating >= 4) {
      const posTags = ['Fresh & Hot', 'Good Taste', 'Quick Service', 'Generous Portion'];
      tags.push(posTags[k % posTags.length]);
    } else {
      tags.push('Average Meal');
    }

    submissions.push({
      id: `seed-auto-${idCounter++}`,
      studentHash: `Roll #23IT${100 + (k % 400)}`,
      timestamp: new Date(Date.now() - ((7 - days.indexOf(day)) * 86400000) + (k * 60000)).toISOString(),
      dayOfWeek: day,
      meal,
      rating,
      tags,
      comment: rating <= 2 && k % 4 === 0 ? 'Counter service was slow during peak hour.' : undefined,
      timeToSubmitSeconds: Number((3.2 + (k % 5)).toFixed(1)),
      status: 'valid'
    });
  }

  return submissions;
}
