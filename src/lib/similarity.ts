/**
 * Computes cosine similarity between two L2-normalized Float32Array vectors.
 * Since vectors are unit-norm, cosine similarity is simply the dot product.
 */
export function cosineSimilarity(v1: Float32Array, v2: Float32Array): number {
  let dot = 0;
  const len = Math.min(v1.length, v2.length);
  for (let i = 0; i < len; i++) {
    dot += v1[i] * v2[i];
  }
  return dot;
}

export interface ClusterableItem<T> {
  id: string;
  data: T;
  vector: Float32Array;
}

export interface ClusterResult<T> {
  clusterId: string;
  items: ClusterableItem<T>[];
  centroid: Float32Array;
  representativeItem: ClusterableItem<T>;
}

/**
 * Performs single-linkage clustering based on a cosine similarity threshold.
 */
export function clusterSingleLinkage<T>(
  items: ClusterableItem<T>[],
  threshold = 0.65
): ClusterResult<T>[] {
  if (items.length === 0) return [];

  const clusters: ClusterableItem<T>[][] = [];

  for (const item of items) {
    let matchedCluster: ClusterableItem<T>[] | null = null;
    let maxSim = -1;

    for (const cluster of clusters) {
      for (const member of cluster) {
        const sim = cosineSimilarity(item.vector, member.vector);
        if (sim >= threshold && sim > maxSim) {
          maxSim = sim;
          matchedCluster = cluster;
        }
      }
    }

    if (matchedCluster) {
      matchedCluster.push(item);
    } else {
      clusters.push([item]);
    }
  }

  // Calculate centroids and representative item nearest to centroid
  return clusters.map((cluster, idx) => {
    const dim = cluster[0].vector.length;
    const centroid = new Float32Array(dim);

    for (const member of cluster) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += member.vector[i];
      }
    }

    // L2 normalize centroid
    let sumSq = 0;
    for (let i = 0; i < dim; i++) {
      centroid[i] /= cluster.length;
      sumSq += centroid[i] * centroid[i];
    }
    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        centroid[i] /= norm;
      }
    }

    // Find nearest member to centroid
    let bestItem = cluster[0];
    let bestSim = -1;
    for (const member of cluster) {
      const sim = cosineSimilarity(member.vector, centroid);
      if (sim > bestSim) {
        bestSim = sim;
        bestItem = member;
      }
    }

    return {
      clusterId: `cluster-${idx + 1}`,
      items: cluster,
      centroid,
      representativeItem: bestItem
    };
  });
}
