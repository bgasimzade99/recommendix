import { NextRequest, NextResponse } from "next/server";
import type { RecommendResponse, Recommendation } from "@/types";
import { loadAllData, getCustomerHistory } from "@/lib/data-loader";
import { computeAssociationScores } from "@/lib/rgr/association";
import { computeGraphScores } from "@/lib/rgr/graph";
import {
  initializeQTable,
  computeExploitationScore,
  computeExplorationBonus,
} from "@/lib/rgr/rl";
import { computeFinalScore, buildBreakdown } from "@/lib/rgr/aggregate";
import { DEFAULT_WEIGHTS } from "@/lib/rgr/weights";
import { handleError } from "@/lib/backend/errors";
import { validateRecommendRequest, validateCustomerExists } from "@/lib/backend/validation";
import { logger } from "@/lib/backend/logger";
// import { recommendationCache } from "@/lib/backend/cache";

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const body = await request.json();
    const { customerId, topN } = validateRecommendRequest(body);
    
    logger.info("Recommendation request received", { customerId, topN });

    const t0 = performance.now();

    // Load data
    const data = loadAllData();

    // Validate customer exists
    validateCustomerExists(customerId, data.customers);

    // Get customer history
    const history = getCustomerHistory(customerId);
    
    logger.debug("Customer history loaded", { 
      customerId, 
      transactionCount: history.length 
    });

    // Initialize Q-table
    const qTable = initializeQTable(data.qValues);

    // Run algorithms
    const tAssoc = performance.now();
    const assocScores = computeAssociationScores(history, data.assocRules);
    const tAssocEnd = performance.now();

    const tGraph = performance.now();
    const graphScores = computeGraphScores(customerId, data.graphEdges, history);
    const tGraphEnd = performance.now();

    const tRL = performance.now();

    // Aggregate candidates
    const candidates = new Set<string>();
    Object.keys(assocScores).forEach((id) => candidates.add(id));
    Object.keys(graphScores).forEach((id) => candidates.add(id));
    // Add some unexplored items from full catalog
    Array.from(data.items.keys()).slice(0, 20).forEach((id) => candidates.add(id));

    const recommendations: Recommendation[] = [];

    candidates.forEach((itemId) => {
      const item = data.items.get(itemId);
      if (!item) return;

      const assocData = assocScores[itemId];
      const graphData = graphScores[itemId];

      const ruleScore = assocData?.score ?? 0;
      const graphScore = graphData?.score ?? 0;
      const exploitation = computeExploitationScore(qTable, customerId, itemId);

      // Check if item is in recent history for exploration bonus
      const recentItems = history
        .slice(-5)
        .flatMap((tx) => tx.itemIds);
      const explorationBonus = computeExplorationBonus(recentItems, itemId);

      // Compute final score
      const finalScore = computeFinalScore(
        {
          ruleScore,
          graphScore,
          exploitationScore: exploitation,
          explorationBonus,
        },
        DEFAULT_WEIGHTS
      );

      const assocRuleIds = assocData?.matchedRuleIds ?? [];
      const samplePaths = graphData?.samplePaths ?? [];
      const qBefore = qTable.get(`${customerId}:${itemId}`) ?? 0;

      const breakdown = buildBreakdown(
        itemId,
        ruleScore,
        assocRuleIds,
        graphScore,
        samplePaths,
        exploitation,
        explorationBonus,
        qBefore
      );

      recommendations.push({
        itemId,
        itemName: item.name,
        score: finalScore,
        breakdown,
      });
    });

    const tRLEnd = performance.now();

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    const topRecommendations = recommendations.slice(0, topN);

    const tTotal = performance.now();

    const response: RecommendResponse = {
      customerId,
      recommendations: topRecommendations,
      weights: DEFAULT_WEIGHTS,
      timingsMs: {
        association: tAssocEnd - tAssoc,
        graph: tGraphEnd - tGraph,
        rl: tRLEnd - tRL,
        total: tTotal - t0,
      },
    };

    logger.info("Recommendations generated successfully", {
      customerId,
      topN,
      totalRecommendations: topRecommendations.length,
      totalTime: (tTotal - t0).toFixed(2),
    });

    logger.performance("Recommendation Generation", startTime, {
      customerId,
      topN,
      timings: response.timingsMs,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error generating recommendations", error as Error, { 
      requestBody: await request.json().catch(() => "Failed to parse body") 
    });
    return handleError(error);
  }
}

