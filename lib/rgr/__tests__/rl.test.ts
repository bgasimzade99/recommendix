import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeQTable,
  getQValue,
  updateQValue,
  computeExploitationScore,
  computeExplorationBonus,
  qTableToJSON,
} from "../rl";

describe("rl", () => {
  const testQValues = [
    { customerId: "c1", itemId: "i1", q: 0.1 },
    { customerId: "c2", itemId: "i2", q: 0.2 },
  ];

  let qTable: ReturnType<typeof initializeQTable>;

  beforeEach(() => {
    qTable = initializeQTable(testQValues);
  });

  it("should initialize Q-table correctly", () => {
    expect(getQValue(qTable, "c1", "i1")).toBe(0.1);
    expect(getQValue(qTable, "c2", "i2")).toBe(0.2);
  });

  it("should return 0 for missing values", () => {
    expect(getQValue(qTable, "c1", "missing")).toBe(0);
  });

  it("should update Q-value on purchase feedback", () => {
    const before = getQValue(qTable, "c1", "i1");
    updateQValue(qTable, "c1", "i1", "purchase");
    const after = getQValue(qTable, "c1", "i1");
    expect(after).toBeGreaterThan(before);
  });

  it("should update Q-value on like feedback", () => {
    const before = getQValue(qTable, "c1", "i1");
    updateQValue(qTable, "c1", "i1", "like");
    const after = getQValue(qTable, "c1", "i1");
    expect(after).toBeGreaterThan(before);
    expect(after).toBeLessThan(
      getQValue(
        (() => {
          const t = initializeQTable(testQValues);
          updateQValue(t, "c1", "i1", "purchase");
          return t;
        })(),
        "c1",
        "i1"
      )
    );
  });

  it("should decrease Q-value on dislike feedback", () => {
    const before = getQValue(qTable, "c1", "i1");
    updateQValue(qTable, "c1", "i1", "dislike");
    const after = getQValue(qTable, "c1", "i1");
    expect(after).toBeLessThan(before);
  });

  it("should compute exploitation score", () => {
    const score = computeExploitationScore(qTable, "c1", "i1");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("should give exploration bonus for new items", () => {
    const bonus = computeExplorationBonus([], "new-item");
    expect(bonus).toBeGreaterThan(0);
  });

  it("should not give exploration bonus for known items", () => {
    const bonus = computeExplorationBonus(["known-item"], "known-item");
    expect(bonus).toBe(0);
  });

  it("should convert Q-table to JSON", () => {
    const json = qTableToJSON(qTable);
    expect(json.length).toBeGreaterThanOrEqual(2);
    expect(json.some((qv) => qv.customerId === "c1" && qv.itemId === "i1")).toBe(true);
  });
});

