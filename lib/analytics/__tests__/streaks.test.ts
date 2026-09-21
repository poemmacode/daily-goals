import { describe, it, expect } from "vitest";
import { calculateStreaks, calculateGoalStreak } from "../streaks";
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

describe("calculateStreaks", () => {
  it("returns 0 streak with no goals", () => {
    const result = calculateStreaks([], [], "2026-09-21");
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it("calculates current streak for consecutive completions", () => {
    const goal = makeGoal();
    const logs: DailyLog[] = [];
    // Complete last 5 days
    for (let i = 0; i < 5; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i), goal_id: "g1" }));
    }
    const result = calculateStreaks([goal], logs, "2026-09-21");
    expect(result.current).toBe(5);
  });

  it("breaks streak on missed day", () => {
    const goal = makeGoal();
    const logs: DailyLog[] = [];
    // Complete 3 days ago and 2 days ago, but not yesterday or today
    logs.push(makeLog({ log_date: addDays("2026-09-21", -3), goal_id: "g1" }));
    logs.push(makeLog({ log_date: addDays("2026-09-21", -2), goal_id: "g1" }));
    const result = calculateStreaks([goal], logs, "2026-09-21");
    expect(result.current).toBe(0);
  });

  it("allows today to be incomplete and counts from yesterday", () => {
    const goal = makeGoal();
    const logs: DailyLog[] = [];
    // Complete last 4 days but not today
    for (let i = 1; i <= 4; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i), goal_id: "g1" }));
    }
    const result = calculateStreaks([goal], logs, "2026-09-21");
    expect(result.current).toBe(4);
  });

  it("counts longest streak correctly", () => {
    const goal = makeGoal({ start_date: "2026-09-01", end_date: "2026-09-10" });
    const logs: DailyLog[] = [];
    // First 3 days complete
    for (let i = 0; i < 3; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-10", -(9-i)), goal_id: "g1" }));
    }
    // Skip day 4
    // Days 5-10 complete (6 days)
    for (let i = 5; i <= 10; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-10", -(10-i)), goal_id: "g1" }));
    }
    const result = calculateStreaks([goal], logs, "2026-09-10", 14);
    expect(result.longest).toBe(6);
    expect(result.current).toBe(6);
    expect(result.totalDaysCompleted).toBe(9);
  });

  it("skips days with no active goals (grace days)", () => {
    const goal = makeGoal({
      active_days: [1, 3, 5], // Mon, Wed, Fri only
    });
    const logs: DailyLog[] = [];
    // Mon Sept 14, Wed Sept 16, Fri Sept 18 - all active days completed
    logs.push(makeLog({ log_date: "2026-09-14", goal_id: "g1" })); // Mon
    logs.push(makeLog({ log_date: "2026-09-16", goal_id: "g1" })); // Wed
    logs.push(makeLog({ log_date: "2026-09-18", goal_id: "g1" })); // Fri
    // Mon Sept 7, Wed Sept 9, Fri Sept 11 - previous week all completed
    logs.push(makeLog({ log_date: "2026-09-07", goal_id: "g1" })); // Mon
    logs.push(makeLog({ log_date: "2026-09-09", goal_id: "g1" })); // Wed
    logs.push(makeLog({ log_date: "2026-09-11", goal_id: "g1" })); // Fri
    // Use Saturday Sept 19 as today - inactive days (Sat, Sun, Tue, Thu) are skipped
    const result = calculateStreaks([goal], logs, "2026-09-19", 30);
    expect(result.current).toBe(6);
    expect(result.longest).toBe(6);
  });

  it("counts totalDaysWithGoals and totalDaysCompleted", () => {
    const goal = makeGoal({ start_date: "2026-09-18", end_date: "2026-09-21" });
    const logs: DailyLog[] = [];
    logs.push(makeLog({ log_date: "2026-09-18", goal_id: "g1" }));
    logs.push(makeLog({ log_date: "2026-09-19", goal_id: "g1" }));
    // Skip 20, complete 21
    logs.push(makeLog({ log_date: "2026-09-21", goal_id: "g1" }));
    const result = calculateStreaks([goal], logs, "2026-09-21", 7);
    expect(result.totalDaysWithGoals).toBe(4);
    expect(result.totalDaysCompleted).toBe(3);
  });
});

describe("calculateGoalStreak", () => {
  it("returns 0 for goal with no logs", () => {
    const goal = makeGoal();
    const result = calculateGoalStreak(goal, [], "2026-09-21");
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it("calculates single goal streak", () => {
    const goal = makeGoal();
    const logs: DailyLog[] = [];
    for (let i = 0; i < 7; i++) {
      logs.push(makeLog({ log_date: addDays("2026-09-21", -i) }));
    }
    const result = calculateGoalStreak(goal, logs, "2026-09-21");
    expect(result.current).toBe(7);
    expect(result.longest).toBe(7);
  });

  it("respects active_days for streak calculation", () => {
    const goal = makeGoal({ active_days: [1, 3, 5] }); // Mon, Wed, Fri
    const logs: DailyLog[] = [];
    // Complete Mon 9/14, Wed 9/16, Fri 9/18, Mon 9/21 (today is Mon)
    logs.push(makeLog({ log_date: "2026-09-14" }));
    logs.push(makeLog({ log_date: "2026-09-16" }));
    logs.push(makeLog({ log_date: "2026-09-18" }));
    logs.push(makeLog({ log_date: "2026-09-21" }));
    const result = calculateGoalStreak(goal, logs, "2026-09-21");
    expect(result.current).toBe(4);
  });
});
