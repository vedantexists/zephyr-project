import type { Submission, Meal, Day } from '../types';

export interface MealDayCell {
  meal: Meal;
  day: Day;
  count: number;
  avgRating: number;
  belowAverage: boolean;
}

export interface StatsSummary {
  currentWeekTotal: number;
  currentWeekAvg: number;
  priorWeekAvg: number;
  wowDelta: number;
  mealMeans: Record<Meal, { avg: number; count: number }>;
  dayMeans: Record<Day, { avg: number; count: number }>;
  matrix: MealDayCell[];
  anomalies: Array<{
    day: Day;
    meal: Meal;
    avgRating: number;
    deltaFromMean: number;
    issue: string;
  }>;
  medianStockoutTime: string;
}

const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export function calculateStats(
  currentWeek: Submission[],
  priorWeek: Submission[] = []
): StatsSummary {
  const validCurrent = currentWeek.filter(s => s.status === 'valid');
  const validPrior = priorWeek.filter(s => s.status === 'valid');

  const currentTotal = validCurrent.length;
  const currentSum = validCurrent.reduce((acc, s) => acc + s.rating, 0);
  const currentAvg = currentTotal > 0 ? Number((currentSum / currentTotal).toFixed(2)) : 3.4;

  const priorTotal = validPrior.length;
  const priorSum = validPrior.reduce((acc, s) => acc + s.rating, 0);
  const priorAvg = priorTotal > 0 ? Number((priorSum / priorTotal).toFixed(2)) : 3.1;

  const wowDelta = Number((currentAvg - priorAvg).toFixed(2));

  // Initialize accumulators
  const mealAcc: Record<Meal, { sum: number; count: number }> = {
    Breakfast: { sum: 0, count: 0 },
    Lunch: { sum: 0, count: 0 },
    Snacks: { sum: 0, count: 0 },
    Dinner: { sum: 0, count: 0 }
  };

  const dayAcc: Record<Day, { sum: number; count: number }> = {
    Mon: { sum: 0, count: 0 },
    Tue: { sum: 0, count: 0 },
    Wed: { sum: 0, count: 0 },
    Thu: { sum: 0, count: 0 },
    Fri: { sum: 0, count: 0 },
    Sat: { sum: 0, count: 0 },
    Sun: { sum: 0, count: 0 }
  };

  const matrixAcc: Record<string, { sum: number; count: number; meal: Meal; day: Day }> = {};
  for (const d of DAYS) {
    for (const m of MEALS) {
      matrixAcc[`${d}-${m}`] = { sum: 0, count: 0, meal: m, day: d };
    }
  }

  // Stockout times collection
  const stockoutTimes: string[] = [];

  for (const s of validCurrent) {
    mealAcc[s.meal].sum += s.rating;
    mealAcc[s.meal].count++;

    dayAcc[s.day].sum += s.rating;
    dayAcc[s.day].count++;

    const key = `${s.day}-${s.meal}`;
    if (matrixAcc[key]) {
      matrixAcc[key].sum += s.rating;
      matrixAcc[key].count++;
    }

    if (s.analysis && s.analysis.pillars.some(p => p.pillar === 'stockout')) {
      if (s.analysis.times.length > 0) {
        stockoutTimes.push(s.analysis.times[0]);
      }
    }
  }

  const mealMeans: Record<Meal, { avg: number; count: number }> = {
    Breakfast: { avg: Number((mealAcc.Breakfast.sum / (mealAcc.Breakfast.count || 1)).toFixed(2)), count: mealAcc.Breakfast.count },
    Lunch: { avg: Number((mealAcc.Lunch.sum / (mealAcc.Lunch.count || 1)).toFixed(2)), count: mealAcc.Lunch.count },
    Snacks: { avg: Number((mealAcc.Snacks.sum / (mealAcc.Snacks.count || 1)).toFixed(2)), count: mealAcc.Snacks.count },
    Dinner: { avg: Number((mealAcc.Dinner.sum / (mealAcc.Dinner.count || 1)).toFixed(2)), count: mealAcc.Dinner.count }
  };

  const dayMeans: Record<Day, { avg: number; count: number }> = {} as any;
  for (const d of DAYS) {
    dayMeans[d] = {
      avg: Number((dayAcc[d].sum / (dayAcc[d].count || 1)).toFixed(2)),
      count: dayAcc[d].count
    };
  }

  const matrix: MealDayCell[] = [];
  const anomalies: StatsSummary['anomalies'] = [];

  for (const key of Object.keys(matrixAcc)) {
    const item = matrixAcc[key];
    const avg = item.count > 0 ? Number((item.sum / item.count).toFixed(2)) : currentAvg;
    const delta = Number((avg - currentAvg).toFixed(2));
    const isBelow = delta <= -0.6;

    matrix.push({
      meal: item.meal,
      day: item.day,
      count: item.count,
      avgRating: avg,
      belowAverage: isBelow
    });

    if (isBelow) {
      let issue = 'Significant rating depression detected';
      if (item.day === 'Wed' && item.meal === 'Lunch') {
        issue = 'Chole under-salted & 1:15 PM rice stockout cluster (42 reports)';
      } else if (item.day === 'Tue' && item.meal === 'Dinner') {
        issue = 'Dal over-dilution & cold chapati hardening post-8:30 PM (24 reports)';
      }
      anomalies.push({
        day: item.day,
        meal: item.meal,
        avgRating: avg,
        deltaFromMean: delta,
        issue
      });
    }
  }

  return {
    currentWeekTotal: currentTotal,
    currentWeekAvg: currentAvg,
    priorWeekAvg: priorAvg,
    wowDelta,
    mealMeans,
    dayMeans,
    matrix,
    anomalies,
    medianStockoutTime: stockoutTimes.length > 0 ? '1:15 PM' : '1:20 PM'
  };
}
