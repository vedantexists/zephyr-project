import type { Embedder } from '../types';
import { NgramEmbedder } from './ngramEmbedder';

let activeEngine: 'lightweight' | 'semantic' = 'lightweight';
const defaultEmbedder = new NgramEmbedder();
let semanticEmbedderInstance: Embedder | null = null;

type EngineChangeListener = (engine: 'lightweight' | 'semantic') => void;
const listeners: EngineChangeListener[] = [];

export function getActiveEngine(): 'lightweight' | 'semantic' {
  return activeEngine;
}

export function subscribeEngineChange(listener: EngineChangeListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export async function setEmbedderEngine(engine: 'lightweight' | 'semantic'): Promise<void> {
  if (engine === 'semantic') {
    try {
      // Dynamic import to allow optional transformerEmbedder spike
      // @ts-ignore
      const mod = await import('./transformerEmbedder');
      semanticEmbedderInstance = new mod.TransformerEmbedder();
      activeEngine = 'semantic';
    } catch (e) {
      console.warn('Semantic embedder not installed or failed to load. Using lightweight:', e);
      activeEngine = 'lightweight';
    }
  } else {
    activeEngine = 'lightweight';
  }

  listeners.forEach(fn => fn(activeEngine));
}

export function getEmbedder(): Embedder {
  if (activeEngine === 'semantic' && semanticEmbedderInstance) {
    return semanticEmbedderInstance;
  }
  return defaultEmbedder;
}
