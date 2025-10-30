// RGR Weight Configuration

export const DEFAULT_WEIGHTS = {
  rule: 0.42,
  graph: 0.38,
  rlExploit: 0.15,
  rlExplore: 0.05,
} as const;

export function validateWeights(weights: Partial<typeof DEFAULT_WEIGHTS>): typeof DEFAULT_WEIGHTS {
  const validated = { ...DEFAULT_WEIGHTS, ...weights };

  // Ensure they sum to approximately 1.0
  const sum = validated.rule + validated.graph + validated.rlExploit + validated.rlExplore;
  if (Math.abs(sum - 1.0) > 0.01) {
    throw new Error(`Weights must sum to 1.0, got ${sum}`);
  }

  // Ensure all weights are non-negative
  if (validated.rule < 0 || validated.graph < 0 || validated.rlExploit < 0 || validated.rlExplore < 0) {
    throw new Error("All weights must be non-negative");
  }

  return validated;
}

export function getNormalizedWeights(weights: typeof DEFAULT_WEIGHTS) {
  const sum = weights.rule + weights.graph + weights.rlExploit + weights.rlExplore;
  return {
    rule: weights.rule / sum,
    graph: weights.graph / sum,
    rlExploit: weights.rlExploit / sum,
    rlExplore: weights.rlExplore / sum,
  };
}

