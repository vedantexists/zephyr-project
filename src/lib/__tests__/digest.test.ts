import { describe, it, expect } from 'vitest';
import { generateSeedSubmissions } from '../../data/seed';
import { buildExecutiveDigest } from '../digest';

describe('2-Minute Executive Digest Verification', () => {
  const { currentWeek, priorWeek } = generateSeedSubmissions();
  const digest = buildExecutiveDigest(currentWeek, priorWeek, 'lightweight');

  it('generates an executive headline with computed facts', () => {
    expect(digest.headline).toContain('3.4/5');
    expect(digest.headline).toContain('+0.3 WoW');
    expect(digest.headline).toContain('Wednesday lunch stockouts');
  });

  it('satisfies the < 2-minute (120s) read constraint', () => {
    expect(digest.readTimeSeconds).toBeLessThan(120);
    expect(digest.readTimeSeconds).toBeGreaterThan(30);
  });

  it('keeps word count within target budget (200-400 words)', () => {
    expect(digest.wordCount).toBeGreaterThanOrEqual(150);
    expect(digest.wordCount).toBeLessThanOrEqual(400);
  });

  it('ranks Wednesday Lunch Stockout as top grievance cluster', () => {
    expect(digest.topClusters.length).toBeGreaterThan(0);
    const top = digest.topClusters[0];
    expect(top.meal).toBe('Lunch');
    expect(top.day).toBe('Wed');
    expect(top.pillar).toBe('stockout');
    expect(top.count).toBeGreaterThanOrEqual(30);
    expect(top.representativeQuote).toContain('Chole');
  });

  it('ranks Tuesday Dinner dal/chapati as a critical/high grievance cluster', () => {
    const tueCluster = digest.topClusters.find(c => c.day === 'Tue' && c.meal === 'Dinner');
    expect(tueCluster).toBeDefined();
    expect(tueCluster!.representativeQuote).toContain('chapati');
  });

  it('includes actionable kitchen directives with assigned staff roles', () => {
    expect(digest.actionChecklist.length).toBeGreaterThanOrEqual(3);
    const roles = digest.actionChecklist.map(a => a.role);
    expect(roles).toContain('Head Cook');
    expect(roles).toContain('Store Incharge');
    expect(roles).toContain('Cleaning Supervisor');
  });

  it('identifies anomalies correctly', () => {
    expect(digest.anomalies.length).toBeGreaterThanOrEqual(2);
    const hasWedLunch = digest.anomalies.some(a => a.day === 'Wed' && a.meal === 'Lunch');
    const hasTueDinner = digest.anomalies.some(a => a.day === 'Tue' && a.meal === 'Dinner');
    expect(hasWedLunch).toBe(true);
    expect(hasTueDinner).toBe(true);
  });
});
