import { describe, it, expect } from "vitest";
import { aggregateFailureStats, getGoalFailureStats } from "../failure-reasons";
import type { GoalMiss } from "../../types";

function makeMiss(overrides: Partial<GoalMiss> = {}): GoalMiss {
  return {
    id: "m1",
    goal_id: "g1",
    user_id: "u1",
    miss_date: "2026-09-21",
    reason: null,
    note: null,
    created_at: "2026-09-21T00:00:00Z",
    ...overrides,
  };
}

describe("aggregateFailureStats", () => {
  it("returns empty stats with no misses", () => {
    const stats = aggregateFailureStats([], "2026-09-21");
    expect(stats.totalMisses).toBe(0);
    expect(stats.byReason).toHaveLength(0);
    expect(stats.mostCommonReason).toBeNull();
    expect(stats.recentMisses).toBe(0);
  });

  it("counts misses by reason", () => {
    const misses = [
      makeMiss({ reason: "no_time" }),
      makeMiss({ reason: "no_time" }),
      makeMiss({ reason: "forgot" }),
      makeMiss({ reason: "too_tired" }),
      makeMiss({ id: "m5", reason: "no_time" }),
    ];
    const stats = aggregateFailureStats(misses, "2026-09-21");
    expect(stats.totalMisses).toBe(5);
    expect(stats.mostCommonReason).toBe("no_time");
    expect(stats.byReason[0].reason).toBe("no_time");
    expect(stats.byReason[0].count).toBe(3);
    expect(stats.byReason[0].percentage).toBe(60);
  });

  it("counts recent misses (last 30 days)", () => {
    const misses = [
      makeMiss({ miss_date: "2026-09-20", reason: "no_time" }),
      makeMiss({ miss_date: "2026-09-15", reason: "forgot" }),
      makeMiss({ miss_date: "2026-08-01", reason: "too_tired" }), // older than 30 days
      makeMiss({ miss_date: "2026-07-15", reason: "forgot" }), // older than 30 days
    ];
    const stats = aggregateFailureStats(misses, "2026-09-21");
    expect(stats.recentMisses).toBe(2);
    expect(stats.totalMisses).toBe(4); // All within 90 days
  });

  it("groups misses by goal", () => {
    const misses = [
      makeMiss({ goal_id: "g1", miss_date: "2026-09-20" }),
      makeMiss({ goal_id: "g1", miss_date: "2026-09-19" }),
      makeMiss({ goal_id: "g2", miss_date: "2026-09-18" }),
    ];
    const stats = aggregateFailureStats(misses, "2026-09-21");
    expect(stats.missesByGoal.get("g1")).toBe(2);
    expect(stats.missesByGoal.get("g2")).toBe(1);
  });

  it("ignores misses without reason in byReason", () => {
    const misses = [
      makeMiss({ reason: null }),
      makeMiss({ reason: null }),
      makeMiss({ reason: "forgot" }),
    ];
    const stats = aggregateFailureStats(misses, "2026-09-21");
    expect(stats.totalMisses).toBe(3);
    expect(stats.byReason).toHaveLength(1);
    expect(stats.byReason[0].reason).toBe("forgot");
  });

  it("calculates percentages correctly", () => {
    const misses = [
      makeMiss({ reason: "no_time" }),
      makeMiss({ reason: "no_time" }),
      makeMiss({ reason: "forgot" }),
    ];
    const stats = aggregateFailureStats(misses, "2026-09-21");
    const noTime = stats.byReason.find((r) => r.reason === "no_time");
    const forgot = stats.byReason.find((r) => r.reason === "forgot");
    expect(noTime?.percentage).toBe(67);
    expect(forgot?.percentage).toBe(33);
  });
});

describe("getGoalFailureStats", () => {
  it("filters misses by goal ID", () => {
    const misses = [
      makeMiss({ goal_id: "g1", reason: "no_time" }),
      makeMiss({ goal_id: "g2", reason: "forgot" }),
      makeMiss({ goal_id: "g1", reason: "too_tired" }),
    ];
    const stats = getGoalFailureStats(misses, "g1", "2026-09-21");
    expect(stats.totalMisses).toBe(2);
    expect(stats.byReason).toHaveLength(2);
  });

  it("returns empty stats for goal with no misses", () => {
    const misses = [makeMiss({ goal_id: "g1" })];
    const stats = getGoalFailureStats(misses, "g99", "2026-09-21");
    expect(stats.totalMisses).toBe(0);
  });
});
