import type { Submission, Cluster, Digest, ActionItem, Pillar, Day } from '../types';
import { calculateStats } from './stats';
import { clusterSingleLinkage, type ClusterableItem } from './similarity';
import { embedNgram } from '../ai/ngramEmbedder';
import { SpamShield } from './spamShield';

/**
 * Builds the complete 2-Minute Executive Digest according to Plan v3 spec.
 */
export function buildExecutiveDigest(
  currentWeek: Submission[],
  priorWeek: Submission[] = [],
  engineUsed: 'lightweight' | 'semantic' = 'lightweight'
): Digest {
  const stats = calculateStats(currentWeek, priorWeek);

  // 1. Cluster negative submissions with comments
  const negativeComments = currentWeek.filter(
    s => s.status === 'valid' && s.rating <= 3 && s.comment && s.comment.trim().length > 0
  );

  // Group by (day, meal, primary pillar)
  const grouped = new Map<string, ClusterableItem<Submission>[]>();

  for (const sub of negativeComments) {
    const hasStockout = sub.analysis?.pillars.some(p => p.pillar === 'stockout') || sub.quickTags.includes('Ran Out');
    const primaryPillar: Pillar = hasStockout ? 'stockout' : (sub.analysis?.pillars[0]?.pillar || 'taste');
    const key = `${sub.day}_${sub.meal}_${primaryPillar}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push({
      id: sub.id,
      data: sub,
      vector: embedNgram(sub.comment!)
    });
  }

  const rawClusters: Cluster[] = [];

  for (const [key, items] of grouped.entries()) {
    const [day, meal, pillar] = key.split('_') as [any, any, Pillar];
    const subClusters = clusterSingleLinkage(items, 0.35);

    for (const sc of subClusters) {
      const count = sc.items.length;
      const avgRating = Number(
        (sc.items.reduce((acc, it) => acc + it.data.rating, 0) / count).toFixed(2)
      );

      // Ranking formula from Plan v3: severityScore = count * (6 - avgRating)/5 * weight
      const weight = (pillar === 'stockout' || pillar === 'hygiene') ? 1.5 : 1.0;
      const severityScore = Number((count * ((6 - avgRating) / 5) * weight).toFixed(2));

      let severity: Cluster['severity'] = 'low';
      if (severityScore >= 15 || pillar === 'stockout') severity = 'critical';
      else if (severityScore >= 8) severity = 'high';
      else if (severityScore >= 4) severity = 'medium';

      let title = `${day} ${meal} ${pillar.toUpperCase()} issue`;
      let recommendedAction = 'Investigate kitchen shift preparation and temperature logs.';
      let medianTime: string | undefined;

      if (pillar === 'stockout') {
        title = `${day} ${meal}: Rapid Item Stockout Detected`;
        recommendedAction = 'Recalibrate batch volume and adjust preparation buffer times.';
        medianTime = stats.medianStockoutTime;
      } else if (pillar === 'taste') {
        title = `${day} ${meal}: Taste & Preparation Quality Variance`;
        recommendedAction = 'Standardize recipe cards and enforce temperature/taste checks pre-service.';
      } else if (pillar === 'hygiene') {
        title = `${day} ${meal}: Hygiene or Cleanliness Standards Failure`;
        recommendedAction = 'Audit washing procedures and deploy immediate spot-checks.';
      } else if (pillar === 'delay') {
        title = `${day} ${meal}: Peak Rush Queue Delays`;
        recommendedAction = 'Add additional service counters during peak rush window.';
      }

      rawClusters.push({
        id: sc.clusterId,
        day,
        meal,
        pillar,
        title,
        count,
        avgRating,
        severityScore,
        severity,
        medianTime,
        representativeQuote: sc.representativeItem.data.comment || 'Issue reported during meal service.',
        recommendedAction,
        submissionIds: sc.items.map(it => it.id)
      });
    }
  }

  // Sort clusters descending by severityScore
  rawClusters.sort((a, b) => b.severityScore - a.severityScore);

  // Take top 3 clusters
  const topClusters = rawClusters.slice(0, 3);

  // 2. Action items checklist
  const actionChecklist: ActionItem[] = topClusters.map((c, i) => ({
    id: `act-${i + 1}`,
    role: c.pillar === 'hygiene' ? 'Cleaning Supervisor' : 'Head Cook',
    directive: c.recommendedAction,
    urgency: c.severity === 'critical' ? 'Immediate' : 'Today',
    completed: false
  }));

  // 3. Positives
  const sortedMatrix = [...stats.matrix].sort((a, b) => b.avgRating - a.avgRating);
  const best = sortedMatrix.filter(m => m.count >= 5);
  const positives = best.slice(0, 3).map(m => 
    `${m.day} ${m.meal} was highly rated, scoring ${m.avgRating}/5 across ${m.count} reports.`
  );
  if (positives.length === 0) {
    positives.push('Overall baseline quality maintained without severe system-wide failures.');
  }

  // 4. Headline
  const dayNames: Record<Day, string> = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday'
  };
  const topClusterDesc = topClusters[0] ? `${dayNames[topClusters[0].day]} ${topClusters[0].meal.toLowerCase()} ${topClusters[0].pillar}s` : 'None detected';
  const headline = `Weekly campus satisfaction stabilized at ${stats.currentWeekAvg}/5 (+${stats.wowDelta} WoW); primary bottleneck: ${topClusterDesc} (${topClusters[0]?.count || 0} reports).`;

  // 5. Word count and read time budget (Target 250-350 words, readSeconds = words / 200 * 60)
  const fullText = [
    headline,
    topClusters.map(c => `${c.title} ${c.representativeQuote} ${c.recommendedAction}`).join(' '),
    actionChecklist.map(a => a.directive).join(' '),
    positives.join(' ')
  ].join(' ');

  const words = fullText.trim().split(/\s+/).length;
  const readTimeSeconds = Math.round((words / 200) * 60);

  const blockedCount = SpamShield.getBlockedCount();

  return {
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    headline,
    overallRating: stats.currentWeekAvg,
    priorWeekRating: stats.priorWeekAvg,
    wowDelta: stats.wowDelta,
    totalSubmissions: stats.currentWeekTotal,
    redAlertsCount: stats.anomalies.length,
    blockedCount,
    readTimeSeconds,
    wordCount: words,
    topClusters,
    anomalies: stats.anomalies,
    actionChecklist,
    positives,
    engineUsed
  };
}
