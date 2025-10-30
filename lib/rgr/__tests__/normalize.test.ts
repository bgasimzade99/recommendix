import { describe, it, expect } from "vitest";
import { minMaxNormalize, maxRowNormalize, softmaxNormalize } from "../normalize";

describe("normalize", () => {
  describe("minMaxNormalize", () => {
    it("should normalize values to [0, 1]", () => {
      const result = minMaxNormalize([1, 2, 3, 4, 5]);
      expect(result).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });

    it("should handle empty array", () => {
      const result = minMaxNormalize([]);
      expect(result).toEqual([]);
    });

    it("should handle single value", () => {
      const result = minMaxNormalize([5]);
      expect(result).toEqual([0.5]);
    });

    it("should handle identical values", () => {
      const result = minMaxNormalize([3, 3, 3]);
      expect(result).toEqual([0.5, 0.5, 0.5]);
    });
  });

  describe("maxRowNormalize", () => {
    it("should normalize values dividing by max", () => {
      const result = maxRowNormalize([10, 20, 30, 40]);
      expect(result).toEqual([0.25, 0.5, 0.75, 1]);
    });

    it("should handle negative values", () => {
      const result = maxRowNormalize([-10, -5, 0, 5]);
      expect(result).toEqual([1, 0.5, 0, 0.5]); // Uses absolute values
    });

    it("should cap at 1", () => {
      const result = maxRowNormalize([2, 4, 6, 8]);
      expect(result).toEqual([0.25, 0.5, 0.75, 1]);
    });
  });

  describe("softmaxNormalize", () => {
    it("should normalize to probability distribution", () => {
      const result = softmaxNormalize([1, 2, 3]);
      const sum = result.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
      expect(result.length).toBe(3);
    });

    it("should handle large values", () => {
      const result = softmaxNormalize([100, 200, 300]);
      const sum = result.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
      expect(result[2]).toBeGreaterThan(result[0]);
    });
  });
});

