// Association rule-based recommendations
import type { AssocRule, Transaction } from "@/types";

const DEFAULT_RULE_WEIGHT = 0.5; // Balance between confidence and lift

/**
 * Find applicable association rules for a customer's transaction history
 * and compute per-item rule-based scores
 */
export function computeAssociationScores(
  customerHistory: Transaction[],
  allRules: AssocRule[],
): Record<string, { score: number; matchedRuleIds: string[] }> {
  // Extract all items from customer's history
  const customerBasket = new Set<string>();
  customerHistory.forEach((tx) => {
    tx.itemIds.forEach((itemId) => customerBasket.add(itemId));
  });

  if (customerBasket.size === 0) {
    return {};
  }

  // Find rules where antecedent ⊆ customer_basket
  const applicableRules = allRules.filter((rule) =>
    rule.antecedent.every((item) => customerBasket.has(item))
  );

  // For each consequent item, aggregate rule scores
  const itemScores: Record<
    string,
    { score: number; matchedRuleIds: string[] }
  > = {};

  applicableRules.forEach((rule) => {
    const compositeScore = DEFAULT_RULE_WEIGHT * rule.confidence + (1 - DEFAULT_RULE_WEIGHT) * rule.lift;

    rule.consequent.forEach((itemId) => {
      if (!customerBasket.has(itemId)) {
        // Only recommend items not already purchased
        if (!itemScores[itemId]) {
          itemScores[itemId] = { score: 0, matchedRuleIds: [] };
        }
        itemScores[itemId].score = Math.max(itemScores[itemId].score, compositeScore);
        itemScores[itemId].matchedRuleIds.push(rule.id);
      }
    });
  });

  // Normalize scores to [0, 1]
  const scores = Object.values(itemScores).map((s) => s.score);
  const normalizedScores = normalizeScores(scores);

  const normalizedKeys = Object.keys(itemScores);
  normalizedKeys.forEach((key, idx) => {
    itemScores[key].score = normalizedScores[idx];
  });

  return itemScores;
}

function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (max === min) return scores.map(() => 0);
  return scores.map((s) => (s - min) / (max - min));
}

