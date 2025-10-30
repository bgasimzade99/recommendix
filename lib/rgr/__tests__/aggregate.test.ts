import { describe, it, expect } from "vitest";
import { computeFinalScore, buildBreakdown } from "../aggregate";
import { DEFAULT_WEIGHTS } from "../weights";

describe("aggregate", () => {
  describe("computeFinalScore", () => {
    it("should combine scores with weights", () => {
      const score = computeFinalScore(
        {
          ruleScore: 0.8,
          graphScore: 0.6,
          exploitationScore: 0.4,
          explorationBonus: 0.1,
        },
        DEFAULT_WEIGHTS
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should handle missing scores", () => {
      const score = computeFinalScore({ ruleScore: 0.5 }, DEFAULT_WEIGHTS);
      expect(score).toBeGreaterThan(0);
    });

    it("should boost by lift when provided", () => {
      const score1 = computeFinalScore({ ruleScore: 0.5 }, DEFAULT_WEIGHTS);
      const score2 = computeFinalScore({ ruleScore: 0.5, lift: 2.0 }, DEFAULT_WEIGHTS);
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe("buildBreakdown", () => {
    it("should build correct breakdown structure", () => {
      const breakdown = buildBreakdown(
        "i1",
        0.5,
        ["r1", "r2"],
        0.3,
        [{ viaUserId: "u1", viaItemId: "i2" }],
        0.2,
        0.1,
        0.05,
        0.08
      );

      expect(breakdown.ruleBased.score).toBe(0.5);
      expect(breakdown.ruleBased.matchedRuleIds).toEqual(["r1", "r2"]);
      expect(breakdown.graphBased.score).toBe(0.3);
      expect(breakdown.graphBased.neighborsConsidered).toBe(1);
      expect(breakdown.rl.exploitation).toBe(0.2);
      expect(breakdown.rl.explorationBonus).toBe(0.1);
      expect(breakdown.rl.qBefore).toBe(0.05);
      expect(breakdown.rl.qAfter).toBe(0.08);
    });
  });
});

