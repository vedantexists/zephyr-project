import { describe, it, expect } from 'vitest';
import { generateSeedSubmissions } from '../../data/seed';

describe('Seed Data Generator', () => {
  const { currentWeek, priorWeek } = generateSeedSubmissions();

  it('generates 900 current week submissions', () => {
    expect(currentWeek.length).toBe(900);
  });

  it('generates prior week submissions', () => {
    expect(priorWeek.length).toBeGreaterThan(500);
  });

  it('calibrates current week mean to ~3.4/5.0', () => {
    const sum = currentWeek.reduce((acc, s) => acc + s.rating, 0);
    const avg = sum / currentWeek.length;
    expect(avg).toBeGreaterThanOrEqual(3.38);
    expect(avg).toBeLessThanOrEqual(3.42);
  });

  it('calibrates prior week mean to ~3.1/5.0 with +0.3 WoW delta', () => {
    const curAvg = currentWeek.reduce((acc, s) => acc + s.rating, 0) / currentWeek.length;
    const priorAvg = priorWeek.reduce((acc, s) => acc + s.rating, 0) / priorWeek.length;
    const delta = curAvg - priorAvg;
    expect(delta).toBeGreaterThanOrEqual(0.28);
    expect(delta).toBeLessThanOrEqual(0.32);
  });

  it('contains ~24 Tuesday Dinner reports for dal dilution and cold chapati', () => {
    const tueDinnerReports = currentWeek.filter(
      s => s.day === 'Tue' && s.meal === 'Dinner' && s.rating <= 2
    );
    expect(tueDinnerReports.length).toBeGreaterThanOrEqual(20);
  });

  it('contains ~42 Wednesday Lunch stockout and salt reports', () => {
    const wedLunchStockouts = currentWeek.filter(
      s => s.day === 'Wed' && s.meal === 'Lunch' && s.rating <= 2
    );
    expect(wedLunchStockouts.length).toBeGreaterThanOrEqual(35);
  });

  it('contains Sunday Special Breakfast with ~4.8 peak rating', () => {
    const sunBreakfast = currentWeek.filter(s => s.day === 'Sun' && s.meal === 'Breakfast');
    const avg = sunBreakfast.reduce((acc, s) => acc + s.rating, 0) / sunBreakfast.length;
    expect(avg).toBeGreaterThanOrEqual(4.7);
  });

  it('verifies msToSubmit satisfies < 10s constraint for all records', () => {
    const over10s = currentWeek.filter(s => s.msToSubmit > 10000);
    expect(over10s.length).toBe(0);
  });
});
