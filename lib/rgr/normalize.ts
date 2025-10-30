// Normalization utilities for RGR scores

/**
 * Min-max normalization: scales values to [0, 1]
 */
export function minMaxNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5); // Avoid division by zero
  return values.map((v) => (v - min) / (max - min));
}

/**
 * Max-row normalization: divides each value by max in row, caps at 1
 */
export function maxRowNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const max = Math.max(...values.map(Math.abs));
  if (max === 0) return values;
  return values.map((v) => Math.min(Math.abs(v) / max, 1));
}

/**
 * Softmax-like normalization: exp-scaled probabilities
 */
export function softmaxNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const max = Math.max(...values);
  const expValues = values.map((v) => Math.exp(v - max));
  const sum = expValues.reduce((a, b) => a + b, 0);
  return expValues.map((v) => v / sum);
}

