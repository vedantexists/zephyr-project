import { describe, it, expect } from 'vitest';
import { extractEntities } from '../entities';

describe('entities.ts extractEntities', () => {
  it('extracts Hindi/Hinglish language markers', () => {
    const res = extractEntities('Chawal khatam ho gaye the');
    expect(res.language).toBe('Hinglish');
  });

  it('extracts English language markers', () => {
    const res = extractEntities('The rice ran out');
    expect(res.language).toBe('English');
  });

  it('extracts times correctly', () => {
    const res = extractEntities('Ran out at 1:15 pm');
    expect(res.times).toContain('1:15 pm');
  });

  it('extracts dishes', () => {
    const res = extractEntities('Chole me namak nahi tha');
    expect(res.dishes).toContain('Chole');
  });

  it('determines severity based on stockout', () => {
    const res = extractEntities('khatam at 1:15 pm');
    expect(res.severity).toBe('high');
  });
});
