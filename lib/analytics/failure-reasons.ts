import type { GoalMiss, MissReason } from "../types";
import { addDays } from "../dates";

export interface FailureStats {
  totalMisses: number;
  byReason: { reason: MissReason; count: number; percentage: number }[];
  mostCommonReason: MissReason | null;
  recentMisses: number; // last 30 days
  missesByGoal: Map<string, number>;
}

/**
 * Aggregate failure/reason statistics for a user.
 */
export function aggregateFailureStats(
  misses: GoalMiss[],
  todayKey: string,
  lookbackDays: number = 90,
): FailureStats {
  const cutoff = addDays(todayKey, -lookbackDays);
  const recentCutoff = addDays(todayKey, -30);

  const recentMisses = misses.filter((m) => m.miss_date >= recentCutoff);
  const allMisses = misses.filter((m) => m.miss_date >= cutoff);

  // Count by reason
  const reasonCounts = new Map<MissReason, number>();
  for (const m of allMisses) {
    if (!m.reason) continue;
    reasonCounts.set(m.reason, (reasonCounts.get(m.reason) ?? 0) + 1);
  }

  const totalWithReason = [...reasonCounts.values()].reduce((a, b) => a + b, 0);
  const byReason = [...reasonCounts.entries()]
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: totalWithReason > 0 ? Math.round((count / totalWithReason) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const mostCommonReason = byReason.length > 0 ? byReason[0].reason : null;

  // Misses by goal
  const missesByGoal = new Map<string, number>();
  for (const m of recentMisses) {
    missesByGoal.set(m.goal_id, (missesByGoal.get(m.goal_id) ?? 0) + 1);
  }

  return {
    totalMisses: allMisses.length,
    byReason,
    mostCommonReason,
    recentMisses: recentMisses.length,
    missesByGoal,
  };
}

/**
 * Get failure stats for a specific goal.
 */
export function getGoalFailureStats(
  misses: GoalMiss[],
  goalId: string,
  todayKey: string,
  lookbackDays: number = 90,
): FailureStats {
  const goalMisses = misses.filter((m) => m.goal_id === goalId);
  return aggregateFailureStats(goalMisses, todayKey, lookbackDays);
}
