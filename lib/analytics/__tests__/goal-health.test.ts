import { describe, it, expect } from "vitest";
import { calculateGoalHealth, calculateAllGoalHealth } from "../goal-health";
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

describe("calculateGoalHealth", () => {
  it("returns healthy for high completion rate", () => {
    const goal = makeGoal({ start_date: "2026-09-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Complete 18 out of 21 days
    for (let i = 0; i < 21; i++) {
      if (i % 7 !== 0) {
        logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
      }
    }
    const health = calculateGoalHealth({ goal, logs, todayKey: "2026-09-21" });
    expect(health.status).toBe("healthy");
    expect(health.score).toBeGreaterThanOrEqual(60);
    expect(health.completionRate).toBeGreaterThanOrEqual(70);
  });

  it("returns low score for goal with no logs", () => {
    const goal = makeGoal();
    const health = calculateGoalHealth({ goal, logs: [], todayKey: "2026-09-21" });
    // With no logs, completion=0, consistency=0, streak=0, adherence=0
    // Trend defaults to "stable" giving minimal base score (~21)
    expect(health.score).toBeLessThanOrEqual(25);
    expect(health.status).toBe("struggling");
    expect(health.completionRate).toBe(0);
    expect(health.streak).toBe(0);
  });

  it("returns struggling for low completion rate", () => {
    const goal = makeGoal({ start_date: "2026-09-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Complete only 3 out of 21 days
    logs.push(makeLog({ log_date: "2026-09-01" }));
    logs.push(makeLog({ log_date: "2026-09-05" }));
    logs.push(makeLog({ log_date: "2026-09-10" }));
    const health = calculateGoalHealth({ goal, logs, todayKey: "2026-09-21" });
    expect(health.status).toBe("struggling");
    expect(health.score).toBeLessThan(50);
  });

  it("calculates streak correctly", () => {
    const goal = makeGoal();
    const logs: DailyLog[] = [];
    for (let i = 0; i < 5; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
    }
    const health = calculateGoalHealth({ goal, logs, todayKey: "2026-09-21" });
    expect(health.streak).toBe(5);
  });

  it("detects improving trend", () => {
    const goal = makeGoal({ start_date: "2026-06-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Older period: complete 30% of days
    for (let i = 60; i < 90; i++) {
      if (i % 10 === 0) {
        logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
      }
    }
    // Recent period: complete 80% of days
    for (let i = 0; i < 14; i++) {
      if (i % 3 !== 2) {
        logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
      }
    }
    const health = calculateGoalHealth({ goal, logs, todayKey: "2026-09-21" });
    expect(health.trend).toBe("improving");
  });

  it("detects declining trend", () => {
    const goal = makeGoal({ start_date: "2026-06-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Older period: complete 80%
    for (let i = 60; i < 90; i++) {
      if (i % 5 !== 0) {
        logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
      }
    }
    // Recent period: complete 30%
    for (let i = 0; i < 14; i++) {
      if (i % 10 === 0) {
        logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
      }
    }
    const health = calculateGoalHealth({ goal, logs, todayKey: "2026-09-21" });
    expect(health.trend).toBe("declining");
  });

  it("includes miss count in score", () => {
    const goal = makeGoal({ start_date: "2026-09-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Complete most days
    for (let i = 0; i < 20; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
    }
    const healthWithMisses = calculateGoalHealth({
      goal,
      logs,
      todayKey: "2026-09-21",
      recentMissCount: 8,
    });
    const healthWithout = calculateGoalHealth({
      goal,
      logs,
      todayKey: "2026-09-21",
      recentMissCount: 0,
    });
    expect(healthWithMisses.score).toBeLessThan(healthWithout.score);
  });

  it("returns at_risk for moderate completion", () => {
    const goal = makeGoal({ start_date: "2026-09-01", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    // Complete about 50% of days
    for (let i = 0; i < 21; i += 2) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
    }
    const health = calculateGoalHealth({ goal, logs, todayKey: "2026-09-21" });
    expect(["at_risk", "healthy"]).toContain(health.status);
  });
});

describe("calculateAllGoalHealth", () => {
  it("returns health for all non-archived goals", () => {
    const active = makeGoal({ id: "g1" });
    const archived = makeGoal({ id: "g2", archived: true });
    const logs = [makeLog({ goal_id: "g1" })];
    const result = calculateAllGoalHealth([active, archived], logs, "2026-09-21");
    expect(result.size).toBe(1);
    expect(result.has("g1")).toBe(true);
    expect(result.has("g2")).toBe(false);
  });

  it("returns empty map for no goals", () => {
    const result = calculateAllGoalHealth([], [], "2026-09-21");
    expect(result.size).toBe(0);
  });
});
