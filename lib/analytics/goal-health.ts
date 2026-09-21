import type { Goal, DailyLog } from "../types";
import { isGoalActiveOn, addDays } from "../dates";

export interface GoalHealth {
  score: number; // 0-100
  status: "healthy" | "at_risk" | "struggling";
  completionRate: number;
  streak: number;
  trend: "improving" | "stable" | "declining";
  scheduleAdherence: number;
  recentMisses: number;
}

interface GoalHealthInput {
  goal: Goal;
  logs: DailyLog[];
  todayKey: string;
  recentMissCount?: number;
}

/**
 * Calculate a deterministic Goal Health score.
 *
 * Factors (weighted):
 * - Completion rate: 30%
 * - Recent consistency (last 14 days): 25%
 * - Current streak: 15%
 * - Trend (improving/stable/declining): 15%
 * - Missed sessions (last 30 days): 10%
 * - Schedule adherence: 5%
 */
export function calculateGoalHealth(input: GoalHealthInput): GoalHealth {
  const { goal, logs, todayKey, recentMissCount = 0 } = input;
  const lookbackDays = 90;
  const recentDays = 14;

  // Build day-by-day data
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.log_date),
  );

  let totalActive = 0;
  let totalCompleted = 0;
  let recentActive = 0;
  let recentCompleted = 0;
  let olderActive = 0;
  let olderCompleted = 0;

  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const active = isGoalActiveOn(goal, date) && goal.created_at.slice(0, 10) <= date;
    if (!active) continue;

    totalActive++;
    const completed = completedDates.has(date);
    if (completed) totalCompleted++;

    if (i < recentDays) {
      recentActive++;
      if (completed) recentCompleted++;
    } else {
      olderActive++;
      if (completed) olderCompleted++;
    }
  }

  // Completion rate (0-1)
  const completionRate = totalActive > 0 ? totalCompleted / totalActive : 0;

  // Recent consistency (0-1)
  const recentConsistency = recentActive > 0 ? recentCompleted / recentActive : 0;

  // Current streak
  let streak = 0;
  for (let i = 0; i < lookbackDays; i++) {
    const date = addDays(todayKey, -i);
    const active = isGoalActiveOn(goal, date) && goal.created_at.slice(0, 10) <= date;
    if (!active) continue;
    if (completedDates.has(date)) {
      streak++;
    } else {
      // If today is the first day and not completed yet, don't break the streak
      if (i === 0) continue;
      break;
    }
  }

  // Trend: compare recent vs older performance
  const recentRate = recentActive > 0 ? recentCompleted / recentActive : 0;
  const olderRate = olderActive > 0 ? olderCompleted / olderActive : 0;
  const trendDiff = recentRate - olderRate;
  const trend: "improving" | "stable" | "declining" =
    trendDiff > 0.1 ? "improving" : trendDiff < -0.1 ? "declining" : "stable";

  // Schedule adherence: how many active days had a log entry (completed or not)
  const logDates = new Set(logs.map((l) => l.log_date));
  let daysWithLog = 0;
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const active = isGoalActiveOn(goal, date) && goal.created_at.slice(0, 10) <= date;
    if (active && logDates.has(date)) daysWithLog++;
  }
  const scheduleAdherence = totalActive > 0 ? daysWithLog / totalActive : 0;

  // Weighted score
  const streakScore = Math.min(1, streak / 14); // Max out at 14 days
  const missScore = Math.max(0, 1 - recentMissCount / 10); // Penalty for misses
  const trendScore = trend === "improving" ? 1 : trend === "stable" ? 0.7 : 0.3;

  const raw =
    completionRate * 0.3 +
    recentConsistency * 0.25 +
    streakScore * 0.15 +
    trendScore * 0.15 +
    missScore * 0.1 +
    scheduleAdherence * 0.05;

  const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

  let status: "healthy" | "at_risk" | "struggling";
  if (score >= 70) status = "healthy";
  else if (score >= 40) status = "at_risk";
  else status = "struggling";

  return {
    score,
    status,
    completionRate: Math.round(completionRate * 100),
    streak,
    trend,
    scheduleAdherence: Math.round(scheduleAdherence * 100),
    recentMisses: recentMissCount,
  };
}

/**
 * Calculate health for all active goals.
 */
export function calculateAllGoalHealth(
  goals: Goal[],
  logs: DailyLog[],
  todayKey: string,
  missCounts?: Map<string, number>,
): Map<string, GoalHealth> {
  const result = new Map<string, GoalHealth>();
  const activeGoals = goals.filter((g) => !g.archived);

  for (const goal of activeGoals) {
    const goalLogs = logs.filter((l) => l.goal_id === goal.id);
    const recentMisses = missCounts?.get(goal.id) ?? 0;
    result.set(goal.id, calculateGoalHealth({ goal, logs: goalLogs, todayKey, recentMissCount: recentMisses }));
  }

  return result;
}
