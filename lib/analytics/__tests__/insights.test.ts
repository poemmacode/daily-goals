import { describe, it, expect } from "vitest";
import { generateInsights, getGoalInsights } from "../insights";
import type { Goal, DailyLog } from "../../types";
import { addDays } from "../../dates";

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "g1",
    user_id: "u1",
    title: "Test Goal",
    category: "general",
    color: "#6366f1",
    icon: "target",
    allocated_minutes: 30,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    active_days: [0, 1, 2, 3, 4, 5, 6],
    archived: false,
    notes: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeLog(overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    id: "l1",
    goal_id: "g1",
    user_id: "u1",
    log_date: "2026-09-21",
    completed: true,
    time_spent_seconds: 1800,
    completed_at: "2026-09-21T12:00:00Z",
    created_at: "2026-09-21T00:00:00Z",
    ...overrides,
  };
}

describe("generateInsights", () => {
  it("returns default values with no data", () => {
    const insights = generateInsights({
      goals: [],
      logs: [],
      todayKey: "2026-09-21",
    });
    expect(insights.completionRate).toBe(0);
    expect(insights.streak).toBe(0);
    expect(insights.longestStreak).toBe(0);
    expect(insights.goalHealth.size).toBe(0);
    expect(insights.averageSessionMinutes).toBe(0);
  });

  it("calculates completion rate", () => {
    const goal = makeGoal({ start_date: "2026-09-18", end_date: "2026-09-21" });
    const logs = [
      makeLog({ log_date: "2026-09-18" }),
      makeLog({ log_date: "2026-09-19" }),
      makeLog({ log_date: "2026-09-20" }),
      makeLog({ log_date: "2026-09-21" }),
    ];
    const insights = generateInsights({
      goals: [goal],
      logs,
      todayKey: "2026-09-21",
      lookbackDays: 7,
    });
    expect(insights.completionRate).toBe(100);
  });

  it("finds best days of the week", () => {
    const goal = makeGoal();
    const logs: DailyLog[] = [];
    // Complete on Mon and Tue, skip others
    logs.push(makeLog({ log_date: "2026-09-14" })); // Mon
    logs.push(makeLog({ log_date: "2026-09-15" })); // Tue
    const insights = generateInsights({
      goals: [goal],
      logs,
      todayKey: "2026-09-21",
      lookbackDays: 14,
    });
    expect(insights.bestDays.length).toBeGreaterThan(0);
    // Mon and Tue should be at the top
    const bestDayNumbers = insights.bestDays.map((d) => d.day);
    expect(bestDayNumbers).toContain(1); // Monday
    expect(bestDayNumbers).toContain(2); // Tuesday
  });

  it("calculates schedule adherence", () => {
    const goal = makeGoal({ start_date: "2026-09-18", end_date: "2026-09-21" });
    const logs = [
      makeLog({ log_date: "2026-09-18", completed: false }),
      makeLog({ log_date: "2026-09-19" }),
    ];
    const insights = generateInsights({
      goals: [goal],
      logs,
      todayKey: "2026-09-21",
      lookbackDays: 7,
    });
    // 2 out of 4 days have logs
    expect(insights.scheduleAdherence).toBe(50);
  });

  it("detects improving trend", () => {
    const goal = makeGoal({ start_date: "2026-06-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Older period (60-90 days ago): low completion
    for (let i = 60; i < 90; i += 5) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
    }
    // Recent period (0-14 days ago): high completion
    for (let i = 0; i < 14; i++) {
      if (i % 3 !== 2) {
        logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
      }
    }
    const insights = generateInsights({
      goals: [goal],
      logs,
      todayKey: "2026-09-21",
    });
    expect(insights.trend).toBe("improving");
  });

  it("calculates average session minutes", () => {
    const goal = makeGoal();
    const logs = [
      makeLog({ time_spent_seconds: 1800 }), // 30 min
      makeLog({ time_spent_seconds: 3600 }), // 60 min
    ];
    const insights = generateInsights({
      goals: [goal],
      logs,
      todayKey: "2026-09-21",
      lookbackDays: 1,
    });
    expect(insights.averageSessionMinutes).toBe(45);
    expect(insights.totalMinutesLogged).toBe(90);
  });

  it("excludes archived goals", () => {
    const active = makeGoal({ id: "g1" });
    const archived = makeGoal({ id: "g2", archived: true });
    const logs = [
      makeLog({ goal_id: "g1" }),
      makeLog({ goal_id: "g2", id: "l2" }),
    ];
    const insights = generateInsights({
      goals: [active, archived],
      logs,
      todayKey: "2026-09-21",
      lookbackDays: 1,
    });
    expect(insights.goalHealth.size).toBe(1);
    expect(insights.goalHealth.has("g1")).toBe(true);
  });

  it("includes goal health for each active goal", () => {
    const g1 = makeGoal({ id: "g1" });
    const g2 = makeGoal({ id: "g2" });
    const logs = [
      makeLog({ goal_id: "g1" }),
      makeLog({ goal_id: "g2", id: "l2" }),
    ];
    const insights = generateInsights({
      goals: [g1, g2],
      logs,
      todayKey: "2026-09-21",
      lookbackDays: 1,
    });
    expect(insights.goalHealth.size).toBe(2);
    expect(insights.goalHealth.get("g1")).toBeDefined();
    expect(insights.goalHealth.get("g2")).toBeDefined();
  });
});

describe("getGoalInsights", () => {
  it("returns health, streak, and completion rate for a single goal", () => {
    const goal = makeGoal({ start_date: "2026-09-18", end_date: "2026-09-21" });
    const logs = [
      makeLog({ log_date: "2026-09-18" }),
      makeLog({ log_date: "2026-09-19" }),
      makeLog({ log_date: "2026-09-20" }),
      makeLog({ log_date: "2026-09-21" }),
    ];
    const result = getGoalInsights(goal, logs, "2026-09-21");
    expect(result.health).toBeDefined();
    expect(result.health.status).toBe("healthy");
    expect(result.streak.current).toBe(4);
    expect(result.completionRate).toBe(100);
  });

  it("handles goal with no logs", () => {
    const goal = makeGoal();
    const result = getGoalInsights(goal, [], "2026-09-21");
    expect(result.health.score).toBeLessThanOrEqual(25);
    expect(result.health.status).toBe("struggling");
    expect(result.streak.current).toBe(0);
    expect(result.completionRate).toBe(0);
  });
});
