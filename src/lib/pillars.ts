import { PILLAR_PROTOTYPES } from './lexicon';
import { embedNgram } from '../ai/ngramEmbedder';
import { cosineSimilarity } from './similarity';
import type { Pillar } from '../types';

// Pre-compute prototype vectors for lightning fast evaluation
const PROTOTYPE_VECTORS: Record<Pillar, Float32Array[]> = {
  taste: PILLAR_PROTOTYPES.taste.map(p => embedNgram(p)),
  portion: PILLAR_PROTOTYPES.portion.map(p => embedNgram(p)),
  hygiene: PILLAR_PROTOTYPES.hygiene.map(p => embedNgram(p)),
  delay: PILLAR_PROTOTYPES.delay.map(p => embedNgram(p)),
  stockout: PILLAR_PROTOTYPES.stockout.map(p => embedNgram(p)),
  positive: PILLAR_PROTOTYPES.positive.map(p => embedNgram(p))
};

export interface PillarScore {
  pillar: Pillar;
  score: number;
}

/**
 * Evaluates multi-label pillar scores for a text against prototypes.
 */
export function scorePillars(text: string, quickTags: string[] = []): PillarScore[] {
  // If text is empty or very short, derive from quickTags
  if (!text || text.trim().length < 3) {
    const scores: PillarScore[] = [];
    quickTags.forEach(tag => {
      const lower = tag.toLowerCase();
      if (lower.includes('watery') || lower.includes('cold') || lower.includes('salt') || lower.includes('taste')) {
        scores.push({ pillar: 'taste', score: 0.85 });
      }
      if (lower.includes('portion')) scores.push({ pillar: 'portion', score: 0.85 });
      if (lower.includes('unclean') || lower.includes('hygiene')) scores.push({ pillar: 'hygiene', score: 0.85 });
      if (lower.includes('queue') || lower.includes('delay')) scores.push({ pillar: 'delay', score: 0.85 });
      if (lower.includes('stockout') || lower.includes('ran out') || lower.includes('refill')) scores.push({ pillar: 'stockout', score: 0.9 });
      if (lower.includes('loved') || lower.includes('fresh') || lower.includes('tasty')) scores.push({ pillar: 'positive', score: 0.85 });
    });
    return scores.length > 0 ? scores : [{ pillar: 'taste', score: 0.4 }];
  }

  const vec = embedNgram(text);
  const results: PillarScore[] = [];

  const pillars = Object.keys(PROTOTYPE_VECTORS) as Pillar[];

  for (const pillar of pillars) {
    const protos = PROTOTYPE_VECTORS[pillar];
    let maxSim = 0;

    for (const pVec of protos) {
      const sim = cosineSimilarity(vec, pVec);
      if (sim > maxSim) {
        maxSim = sim;
      }
    }

    results.push({
      pillar,
      score: Number(maxSim.toFixed(3))
    });
  }

  // Multi-label threshold: include pillars with score >= 0.32 or top-ranking pillar
  results.sort((a, b) => b.score - a.score);

  // Always keep the top pillar, plus secondary pillars if above threshold or explicit mentions
  const lower = text.toLowerCase();
  const selected: PillarScore[] = [];

  for (const item of results) {
    if (selected.length === 0) {
      selected.push(item);
    } else if (item.score >= 0.34) {
      selected.push(item);
    } else {
      // Check explicit keyword boost
      if (item.pillar === 'stockout' && (lower.includes('khatam') || lower.includes('ran out') || lower.includes('refill delay'))) {
        selected.push({ ...item, score: 0.88 });
      }
      if (item.pillar === 'taste' && (lower.includes('namak') || lower.includes('watery') || lower.includes('cold'))) {
        selected.push({ ...item, score: 0.85 });
      }
    }
  }

  // Deduplicate and re-sort
  const uniqueMap = new Map<Pillar, number>();
  selected.forEach(s => {
    uniqueMap.set(s.pillar, Math.max(uniqueMap.get(s.pillar) || 0, s.score));
  });

  return Array.from(uniqueMap.entries())
    .map(([pillar, score]) => ({ pillar, score }))
    .sort((a, b) => b.score - a.score);
}
