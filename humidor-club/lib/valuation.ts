/**
 * Valuation index calculation for cigar releases
 * Based on comparable sales (comps) over the last 90 days
 * Weighted: 60% (0-30d), 30% (31-60d), 10% (61-90d)
 */

interface Comp {
  date: Date;
  priceCents: number;
  qty: number;
}

/**
 * Calculate valuation index score from comps
 * Returns null if insufficient data (< 3 comps)
 */
export function calculateIndexScore(comps: Comp[], referenceDate: Date = new Date()): number | null {
  if (!comps || comps.length < 3) {
    return null;
  }
  
  const now = referenceDate.getTime();
  const day = 24 * 60 * 60 * 1000;
  
  // Filter comps from last 90 days
  const recentComps = comps.filter((comp) => {
    const age = (now - comp.date.getTime()) / day;
    return age >= 0 && age <= 90;
  });
  
  if (recentComps.length < 3) {
    return null;
  }
  
  // Group comps by age range
  const ranges = {
    recent: [] as Comp[], // 0-30 days
    medium: [] as Comp[], // 31-60 days
    old: [] as Comp[],    // 61-90 days
  };
  
  recentComps.forEach((comp) => {
    const age = (now - comp.date.getTime()) / day;
    if (age <= 30) {
      ranges.recent.push(comp);
    } else if (age <= 60) {
      ranges.medium.push(comp);
    } else {
      ranges.old.push(comp);
    }
  });
  
  // Calculate weighted average
  const weights = { recent: 0.6, medium: 0.3, old: 0.1 };
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(ranges).forEach(([key, compsInRange]) => {
    if (compsInRange.length > 0) {
      const avgPrice = median(compsInRange.map((c) => c.priceCents));
      const weight = weights[key as keyof typeof weights];
      weightedSum += avgPrice * weight;
      totalWeight += weight;
    }
  });
  
  if (totalWeight === 0) {
    return null;
  }
  
  // Normalize if not all ranges have data
  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculate index delta (percentage change)
 */
export function calculateIndexDelta(
  currentScore: number,
  previousScore: number
): number {
  if (previousScore === 0) return 0;
  return ((currentScore - previousScore) / previousScore) * 100;
}

/**
 * Get confidence level based on number of comps
 */
export function getConfidenceLevel(compsCount: number): 'Low' | 'Medium' | 'High' {
  if (compsCount < 3) return 'Low';
  if (compsCount < 10) return 'Medium';
  return 'High';
}

/**
 * Calculate historical index scores for different time periods
 */
export function calculateHistoricalScores(
  allComps: Comp[],
  referenceDate: Date = new Date()
): {
  current: number | null;
  delta7d: number | null;
  delta30d: number | null;
  delta90d: number | null;
} {
  const day = 24 * 60 * 60 * 1000;
  
  const current = calculateIndexScore(allComps, referenceDate);
  
  const score7dAgo = calculateIndexScore(
    allComps,
    new Date(referenceDate.getTime() - 7 * day)
  );
  
  const score30dAgo = calculateIndexScore(
    allComps,
    new Date(referenceDate.getTime() - 30 * day)
  );
  
  const score90dAgo = calculateIndexScore(
    allComps,
    new Date(referenceDate.getTime() - 90 * day)
  );
  
  return {
    current,
    delta7d: current && score7dAgo ? calculateIndexDelta(current, score7dAgo) : null,
    delta30d: current && score30dAgo ? calculateIndexDelta(current, score30dAgo) : null,
    delta90d: current && score90dAgo ? calculateIndexDelta(current, score90dAgo) : null,
  };
}

/**
 * Calculate median value from array of numbers
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Prepare comps data for chart display
 */
export function prepareChartData(comps: Comp[]): Array<{ date: string; price: number }> {
  return comps
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((comp) => ({
      date: comp.date.toISOString().split('T')[0],
      price: comp.priceCents / 100,
    }));
}

