import { describe, it, expect } from 'vitest';
import { calculateStats } from '../stats';
import type { Submission } from '../../types';

describe('stats.ts calculateStats', () => {
  it('calculates stats correctly', () => {
    const mockCurrent: Submission[] = [
      {
        id: '1', studentHash: 'hash1', ts: new Date().toISOString(),
        day: 'Mon', meal: 'Breakfast', rating: 5, quickTags: [],
        status: 'valid', week: 'current', msToSubmit: 3200
      },
      {
        id: '2', studentHash: 'hash2', ts: new Date().toISOString(),
        day: 'Mon', meal: 'Breakfast', rating: 1, quickTags: [],
        status: 'valid', week: 'current', msToSubmit: 4100,
        analysis: {
          engine: 'lightweight', language: 'English', pillars: [{ pillar: 'stockout', score: 1 }], tags: [], dishes: [], times: ['9:30 AM'], severity: 'high'
        }
      }
    ];

    const mockPrior: Submission[] = [
      {
        id: '3', studentHash: 'hash3', ts: new Date().toISOString(),
        day: 'Mon', meal: 'Breakfast', rating: 3, quickTags: [],
        status: 'valid', week: 'prior', msToSubmit: 2800
      }
    ];

    const stats = calculateStats(mockCurrent, mockPrior);
    
    expect(stats.currentWeekTotal).toBe(2);
    expect(stats.currentWeekAvg).toBe(3); // (5+1)/2
    expect(stats.priorWeekAvg).toBe(3); // 3/1
    expect(stats.wowDelta).toBe(0);
    expect(stats.mealMeans.Breakfast.avg).toBe(3);
    
    expect(stats.medianStockoutTime).toBe('9:30 AM');
    expect(stats.matrix.length).toBe(7 * 4); // 7 days * 4 meals
    expect(stats.anomalies.length).toBe(0);
  });
});
