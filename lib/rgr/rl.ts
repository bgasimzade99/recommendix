// Reinforcement Learning placeholder for adaptive recommendations
import type { QValue } from "@/types";

// Q-learning hyperparameters
const ALPHA = 0.1; // Learning rate
const EXPLORATION_BONUS = 0.1; // Bonus for unexplored items

// Reward function
const REWARDS = {
  purchase: 1.0,
  like: 0.4,
  dislike: -0.6,
} as const;

type QTable = Map<string, number>; // key = "customerId:itemId"

/**
 * Initialize or load Q-table from JSON
 */
export function initializeQTable(qValues: QValue[]): QTable {
  const table = new Map<string, number>();
  qValues.forEach((qv) => {
    table.set(`${qv.customerId}:${qv.itemId}`, qv.q);
  });
  return table;
}

/**
 * Get Q-value for a (customer, item) pair
 */
export function getQValue(table: QTable, customerId: string, itemId: string): number {
  return table.get(`${customerId}:${itemId}`) ?? 0;
}

/**
 * Update Q-value based on feedback
 * Q(s,a) ← Q(s,a) + α * [r + γ * max_a' Q(s',a') - Q(s,a)]
 */
export function updateQValue(
  table: QTable,
  customerId: string,
  itemId: string,
  feedback: "like" | "dislike" | "purchase",
): number {
  const key = `${customerId}:${itemId}`;
  const currentQ = table.get(key) ?? 0;
  const reward = REWARDS[feedback];

  // Simplified update: Q ← Q + α * (reward - Q)
  // (assuming next state Q is approximated by current max)
  const newQ = currentQ + ALPHA * (reward - currentQ);
  table.set(key, newQ);

  return newQ;
}

/**
 * Compute exploitation score (scaled Q-value)
 */
export function computeExploitationScore(
  table: QTable,
  customerId: string,
  itemId: string,
): number {
  const q = getQValue(table, customerId, itemId);
  // Scale to [0, 1] using sigmoid-like function
  return 1 / (1 + Math.exp(-q * 5));
}

/**
 * Compute exploration bonus for items not in recent history
 */
export function computeExplorationBonus(
  customerHistory: string[],
  itemId: string,
): number {
  if (customerHistory.includes(itemId)) {
    return 0; // Already explored
  }
  return EXPLORATION_BONUS;
}

/**
 * Convert Q-table back to JSON format
 */
export function qTableToJSON(table: QTable): QValue[] {
  const result: QValue[] = [];
  table.forEach((q, key) => {
    const [customerId, itemId] = key.split(":");
    result.push({ customerId, itemId, q });
  });
  return result;
}

export { type QTable };

