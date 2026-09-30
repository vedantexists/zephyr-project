import type { Embedder } from '../types';

/**
 * Stub for Optional Semantic Engine.
 * In Plan v3, transformers.js is evaluated only in Phase 6 on branch spike/transformers.
 * On main, this stub satisfies the build and guarantees zero external downloads.
 */
export class TransformerEmbedder implements Embedder {
  name: 'semantic' = 'semantic';

  async embed(_texts: string[]): Promise<Float32Array[]> {
    throw new Error('Semantic MiniLM engine is an optional upgrade evaluated on branch spike/transformers.');
  }
}
