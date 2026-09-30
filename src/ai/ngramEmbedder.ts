import { HINGLISH_GLOSSARY } from '../lib/lexicon';
import type { Embedder } from '../types';

const VECTOR_DIM = 512;

/**
 * 32-bit FNV-1a hash function
 */
function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Normalizes text: lowercase, remove punctuation, append English gloss
 * for any Hinglish vocabulary found without destroying original terms.
 */
export function normalizeTextWithGloss(text: string): string {
  const clean = text.toLowerCase().replace(/[^\w\s:]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  const glosses: string[] = [];

  for (const word of words) {
    if (HINGLISH_GLOSSARY[word]) {
      glosses.push(HINGLISH_GLOSSARY[word]);
    }
  }

  if (glosses.length > 0) {
    return `${clean} ${glosses.join(' ')}`;
  }
  return clean;
}

/**
 * Embeds a single text into a 512-dim L2-normalized Float32Array vector
 * using char 3-5 grams + word unigrams with sublinear TF weighting.
 */
export function embedNgram(text: string): Float32Array {
  const augmented = normalizeTextWithGloss(text);
  const counts = new Map<number, number>();

  const words = augmented.split(' ').filter(w => w.length > 0);

  // 1. Word unigrams
  for (const word of words) {
    const bucket = fnv1a(`w:${word}`) % VECTOR_DIM;
    counts.set(bucket, (counts.get(bucket) || 0) + 1);
  }

  // 2. Character 3, 4, 5-grams
  for (let n = 3; n <= 5; n++) {
    for (let i = 0; i <= augmented.length - n; i++) {
      const gram = augmented.substring(i, i + n);
      const bucket = fnv1a(`c${n}:${gram}`) % VECTOR_DIM;
      counts.set(bucket, (counts.get(bucket) || 0) + 1);
    }
  }

  // 3. Sublinear TF weighting + L2 normalization
  const vec = new Float32Array(VECTOR_DIM);
  let sumSq = 0;

  for (const [bucket, tf] of counts.entries()) {
    // sublinear tf: 1 + ln(tf)
    const val = 1 + Math.log(tf);
    vec[bucket] = val;
    sumSq += val * val;
  }

  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
}

export class NgramEmbedder implements Embedder {
  readonly name = 'lightweight';

  async embed(texts: string[]): Promise<Float32Array[]> {
    return texts.map(t => embedNgram(t));
  }
}
