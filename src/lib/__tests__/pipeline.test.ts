import { describe, it, expect } from 'vitest';
import { extractEntities } from '../entities';
import { scorePillars } from '../pillars';
import { embedNgram } from '../../ai/ngramEmbedder';
import { cosineSimilarity } from '../similarity';

describe('AI Pipeline: Test Cases 1 and 2 Verification', () => {
  it('correctly classifies Test Case 1 (Tuesday Dinner)', () => {
    const text = 'Dal was too watery and chapati was cold and hard after 8:30.';
    const entities = extractEntities(text, ['Watery Dal', 'Cold Food']);
    const pillars = scorePillars(text);

    expect(entities.language).toBe('English');
    expect(entities.tags).toContain('Taste: Poor');
    expect(entities.tags).toContain('Temp: Cold');
    expect(entities.times).toContain('after 8:30');
    expect(entities.dishes).toContain('Dal');
    expect(entities.dishes).toContain('Chapati');
    expect(entities.severity).toBe('high');

    // Pillar should be taste
    expect(pillars[0].pillar).toBe('taste');
  });

  it('correctly classifies Test Case 2 (Wednesday Lunch Hinglish Stockout)', () => {
    const text = 'Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe.';
    const entities = extractEntities(text, ['No Salt', 'Ran Out']);
    const pillars = scorePillars(text);

    // Language detection
    expect(entities.language).toBe('Hinglish');

    // Tags
    expect(entities.tags).toContain('Taste: Under-salted');
    expect(entities.tags.some(t => t.includes('Stockout'))).toBe(true);

    // Time & Dishes
    expect(entities.times).toContain('1:15 pm');
    expect(entities.dishes).toContain('Chole');
    expect(entities.dishes).toContain('Rice');
    expect(entities.severity).toBe('high');

    // Multi-label pillars must include both stockout and taste
    const pillarNames = pillars.map(p => p.pillar);
    expect(pillarNames).toContain('stockout');
    expect(pillarNames).toContain('taste');
  });

  it('verifies cosine similarity distinguishes related comments', () => {
    const v1 = embedNgram('Dal was too watery and chapati was cold');
    const v2 = embedNgram('Watery dal with cold chapatis');
    const v3 = embedNgram('Sunday breakfast masala dosa was awesome');

    const sim12 = cosineSimilarity(v1, v2);
    const sim13 = cosineSimilarity(v1, v3);

    expect(sim12).toBeGreaterThan(0.60);
    expect(sim13).toBeLessThan(0.35);
  });
});
