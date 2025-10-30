import { NextRequest, NextResponse } from "next/server";
import { loadAllDataForTenant, getCustomerHistoryForTenant } from "@/lib/data-loader-runtime";
import { computeAssociationScores } from "@/lib/rgr/association";
import { computeGraphScores } from "@/lib/rgr/graph";
import { initializeQTable, computeExploitationScore, computeExplorationBonus } from "@/lib/rgr/rl";
import { computeFinalScore, buildBreakdown } from "@/lib/rgr/aggregate";
import { getCurrentWeights } from "@/lib/rgr/runtime-weights";
import { handleError } from "@/lib/backend/errors";
import { validateCustomerExists } from "@/lib/backend/validation";
import { logger } from "@/lib/backend/logger";
import { addRequestId, rateLimitMiddleware, securityHeaders } from "@/lib/backend/middleware";
import { enforceApiKey } from "@/lib/backend/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const startTime = performance.now();

  try {
    const requestId = addRequestId(request);
    const url = new URL(request.url);
    const countParam = url.searchParams.get("count");
    const excludeParam = url.searchParams.get("exclude");
    const categoryParam = url.searchParams.get("category");
    const tenantParam = url.searchParams.get("tenant_id") ?? request.headers.get("x-tenant-id") ?? "default";

    const userId = params.user_id;
    const topN = Math.max(1, Math.min(Number(countParam ?? 10), 100));
    const exclude = (excludeParam ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const categoryFilter = categoryParam?.trim();

    const rl = rateLimitMiddleware(request, `${tenantParam}:${userId}`);
    if (rl) return rl;

    const unauthorized = await enforceApiKey(request, tenantParam);
    if (unauthorized) return unauthorized;

    logger.info("v1 recommendations request received", { requestId, tenant: tenantParam, userId, topN, exclude, category: categoryFilter });

    const t0 = performance.now();
    const data = await loadAllDataForTenant(tenantParam);
    validateCustomerExists(userId, data.customers);

    // History and Q-table
    const history = await getCustomerHistoryForTenant(tenantParam, userId);
    const qTable = initializeQTable(data.qValues);

    // Association and Graph
    const tAssoc = performance.now();
    const assocScores = computeAssociationScores(history, data.assocRules);
    const tAssocEnd = performance.now();

    const tGraph = performance.now();
    const graphScores = computeGraphScores(userId, data.graphEdges, history);
    const tGraphEnd = performance.now();

    const tRL = performance.now();

    // Candidate pool
    const candidates = new Set<string>();
    Object.keys(assocScores).forEach((id) => candidates.add(id));
    Object.keys(graphScores).forEach((id) => candidates.add(id));
    // Add catalog items as exploration fallback
    for (const id of data.items.keys()) {
      candidates.add(id);
    }

    const recs = [] as Array<{
      item_id: string;
      description: string;
      score: number;
      confidence: number;
      method: "hybrid";
    }>;

    const recentItems = history.slice(-5).flatMap((tx) => tx.itemIds);

    for (const itemId of candidates) {
      if (exclude.includes(itemId)) continue;
      const item = data.items.get(itemId);
      if (!item) continue;
      if (categoryFilter && item.category && item.category !== categoryFilter) continue;

      const assocData = assocScores[itemId];
      const graphData = graphScores[itemId];
      const ruleScore = assocData?.score ?? 0;
      const graphScore = graphData?.score ?? 0;
      const exploitation = computeExploitationScore(qTable, userId, itemId);
      const explorationBonus = computeExplorationBonus(recentItems, itemId);

      const finalScore = computeFinalScore(
        {
          ruleScore,
          graphScore,
          exploitationScore: exploitation,
          explorationBonus,
        },
        getCurrentWeights()
      );

      // Confidence proxy: normalized blend of components
      const confidence = Math.max(0, Math.min(1, (ruleScore + graphScore + exploitation) / 3));

      recs.push({
        item_id: itemId,
        description: item.name,
        score: Number(finalScore.toFixed(3)),
        confidence: Number(confidence.toFixed(2)),
        method: "hybrid",
      });
    }

    recs.sort((a, b) => b.score - a.score);
    const recommendations = recs.slice(0, topN);

    const tTotal = performance.now();

    const response = {
      user_id: userId,
      recommendations,
      generated_at: new Date().toISOString(),
      cache_hit: false,
      latency_ms: Math.round(tTotal - t0),
    };

    logger.performance("v1 Recommendation Generation", startTime, { userId, topN });
    return NextResponse.json(response, { headers: { ...securityHeaders(), "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    return handleError(error);
  }
}


