// Aggregate multiple recommendation sources into final ranked list
import type { Item, RecBreakdown } from "@/types";
import { getNormalizedWeights, type DEFAULT_WEIGHTS } from "./weights";

type Weights = typeof DEFAULT_WEIGHTS;

type ScoringInput = {
  ruleScore?: number;
  graphScore?: number;
  exploitationScore?: number;
  explorationBonus?: number;
  lift?: number;
  price?: number;
};

/**
 * Compute final aggregated score for an item
 */
export function computeFinalScore(
  inputs: ScoringInput,
  weights: Weights
): number {
  const normalizedWeights = getNormalizedWeights(weights);

  const ruleContribution = (inputs.ruleScore ?? 0) * normalizedWeights.rule;
  const graphContribution = (inputs.graphScore ?? 0) * normalizedWeights.graph;
  const exploitContribution = (inputs.exploitationScore ?? 0) * normalizedWeights.rlExploit;
  const exploreContribution = (inputs.explorationBonus ?? 0) * normalizedWeights.rlExplore;

  const finalScore = ruleContribution + graphContribution + exploitContribution + exploreContribution;

  // Tie-breaker: slightly boost items with higher lift
  if (inputs.lift) {
    return finalScore * (1 + inputs.lift * 0.05);
  }

  return finalScore;
}

/**
 * Top-N ranking with tie-breaking
 */
export function rankItems(
  candidates: Map<string, ScoringInput>,
  allItems: Map<string, Item>,
  topN: number = 10
): string[] {
  const scores: Array<{ itemId: string; score: number; price: number }> = [];

  candidates.forEach((inputs, itemId) => {
    const item = allItems.get(itemId);
    const score = (inputs.ruleScore ?? 0) + (inputs.graphScore ?? 0); // Temporary score for ranking
    scores.push({
      itemId,
      score,
      price: item?.unitPrice ?? 999999, // Prefer cheaper items as tie-breaker
    });
  });

  // Sort by score descending, then by price ascending
  scores.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.001) {
      return a.price - b.price;
    }
    return b.score - a.score;
  });

  return scores.slice(0, topN).map((s) => s.itemId);
}

/**
 * Build breakdown for explainability
 */
export function buildBreakdown(
  itemId: string,
  ruleScore: number,
  matchedRuleIds: string[],
  graphScore: number,
  samplePaths: Array<{ viaUserId: string; viaItemId: string }>,
  exploitation: number,
  explorationBonus: number,
  qBefore: number,
  qAfter?: number
): RecBreakdown {
  return {
    ruleBased: {
      score: ruleScore,
      matchedRuleIds,
    },
    graphBased: {
      score: graphScore,
      neighborsConsidered: samplePaths.length,
      samplePaths: samplePaths.slice(0, 3), // Limit for UI
    },
    rl: {
      exploitation,
      explorationBonus,
      qBefore,
      qAfter,
    },
  };
}

