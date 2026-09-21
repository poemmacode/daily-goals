import type { Goal, DailyLog, GoalMiss } from "../types";
import { isGoalActiveOn, addDays, weekdayOf } from "../dates";
import type { BehavioralInsights } from "./insights";

export interface WeeklyReview {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  goalsCompleted: number;
  totalGoals: number;
  completionPercentage: number;
  changeFromLastWeek: number; // percentage points
  bestGoal: { goal: Goal; completionRate: number } | null;
  goalsNeedingAttention: { goal: Goal; completionRate: number; health: string }[];
  totalMinutesLogged: number;
  bestDay: string | null;
  commonFailureReason: string | null;
  streak: number;
  // Pro features (populated if insights provided)
  advanced?: {
    insights: BehavioralInsights;
    topPerformingDay: string;
    averageSessionMinutes: number;
    scheduleAdherence: number;
  };
}

interface WeeklyReviewInput {
  goals: Goal[];
  logs: DailyLog[];
  misses?: GoalMiss[];
  todayKey: string;
  insights?: BehavioralInsights;
}

/**
 * Generate a weekly review summary.
 */
export function generateWeeklyReview(input: WeeklyReviewInput): WeeklyReview {
  const { goals, logs, misses = [], todayKey, insights } = input;
  const activeGoals = goals.filter((g) => !g.archived);

  const weekEnd = todayKey;
  const weekStart = addDays(todayKey, -6);
  const lastWeekEnd = addDays(todayKey, -7);
  const lastWeekStart = addDays(todayKey, -13);

  // This week's stats
  const weekLogs = logs.filter(
    (l) => l.log_date >= weekStart && l.log_date <= weekEnd,
  );
  const lastWeekLogs = logs.filter(
    (l) => l.log_date >= lastWeekStart && l.log_date <= lastWeekEnd,
  );

  // Count completed goals per day this week
  let goalsCompleted = 0;
  let totalGoals = 0;
  const goalCompletion = new Map<string, { total: number; done: number }>();

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    totalGoals += activeToday.length;

    const completedToday = weekLogs.filter(
      (l) => l.log_date === date && l.completed,
    ).length;
    goalsCompleted += Math.min(completedToday, activeToday.length);

    for (const g of activeToday) {
      const stat = goalCompletion.get(g.id) ?? { total: 0, done: 0 };
      stat.total++;
      if (weekLogs.some((l) => l.goal_id === g.id && l.log_date === date && l.completed)) {
        stat.done++;
      }
      goalCompletion.set(g.id, stat);
    }
  }

  // Last week's stats for comparison
  let lastWeekTotal = 0;
  let lastWeekDone = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(lastWeekStart, i);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    lastWeekTotal += activeToday.length;
    const completedToday = lastWeekLogs.filter(
      (l) => l.log_date === date && l.completed,
    ).length;
    lastWeekDone += Math.min(completedToday, activeToday.length);
  }

  const completionPercentage = totalGoals > 0 ? Math.round((goalsCompleted / totalGoals) * 100) : 0;
  const lastWeekPct = lastWeekTotal > 0 ? Math.round((lastWeekDone / lastWeekTotal) * 100) : 0;
  const changeFromLastWeek = completionPercentage - lastWeekPct;

  // Best goal
  let bestGoal: WeeklyReview["bestGoal"] = null;
  let bestRate = -1;
  const goalsNeedingAttention: WeeklyReview["goalsNeedingAttention"] = [];

  for (const [goalId, stat] of goalCompletion) {
    const rate = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
    const goal = activeGoals.find((g) => g.id === goalId);
    if (!goal) continue;

    if (rate > bestRate) {
      bestRate = rate;
      bestGoal = { goal, completionRate: rate };
    }
    if (rate < 50) {
      goalsNeedingAttention.push({
        goal,
        completionRate: rate,
        health: rate < 25 ? "struggling" : "at_risk",
      });
    }
  }

  // Total minutes logged this week
  const totalMinutesLogged = Math.round(
    weekLogs.reduce((a, l) => a + l.time_spent_seconds, 0) / 60,
  );

  // Best day this week
  const dayStats = new Map<number, { active: number; done: number }>();
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const weekday = weekdayOf(date);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    if (activeToday.length === 0) continue;
    const stat = dayStats.get(weekday) ?? { active: 0, done: 0 };
    stat.active += activeToday.length;
    const doneToday = weekLogs.filter(
      (l) => l.log_date === date && l.completed,
    ).length;
    stat.done += Math.min(doneToday, activeToday.length);
    dayStats.set(weekday, stat);
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let bestDay: string | null = null;
  let bestDayRate = -1;
  for (const [day, stat] of dayStats) {
    const rate = stat.active > 0 ? stat.done / stat.active : 0;
    if (rate > bestDayRate) {
      bestDayRate = rate;
      bestDay = dayNames[day];
    }
  }

  // Common failure reason this week
  const weekMisses = misses.filter(
    (m) => m.miss_date >= weekStart && m.miss_date <= weekEnd,
  );
  const reasonCounts = new Map<string, number>();
  for (const m of weekMisses) {
    if (m.reason) {
      reasonCounts.set(m.reason, (reasonCounts.get(m.reason) ?? 0) + 1);
    }
  }
  let commonFailureReason: string | null = null;
  let maxCount = 0;
  for (const [reason, count] of reasonCounts) {
    if (count > maxCount) {
      maxCount = count;
      commonFailureReason = reason;
    }
  }

  // Streak
  const streak = insights?.streak ?? 0;

  const review: WeeklyReview = {
    weekStart,
    weekEnd,
    goalsCompleted,
    totalGoals,
    completionPercentage,
    changeFromLastWeek,
    bestGoal,
    goalsNeedingAttention,
    totalMinutesLogged,
    bestDay,
    commonFailureReason,
    streak,
  };

  // Advanced (Pro) features
  if (insights) {
    const topDay = insights.bestDays[0];
    review.advanced = {
      insights,
      topPerformingDay: topDay ? WEEKDAY_NAMES[topDay.day] : "N/A",
      averageSessionMinutes: insights.averageSessionMinutes,
      scheduleAdherence: insights.scheduleAdherence,
    };
  }

  return review;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
