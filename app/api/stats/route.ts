import { NextResponse } from "next/server";
import type { StatsResponse } from "@/types";
import { loadAllData } from "@/lib/data-loader";
import { DEFAULT_WEIGHTS } from "@/lib/rgr/weights";
import { handleError } from "@/lib/backend/errors";
import { logger } from "@/lib/backend/logger";

export async function GET() {
  const startTime = performance.now();
  
  try {
    logger.info("Stats request received");
    
    const data = loadAllData();

    // Sort rules by lift descending
    const topRules = [...data.assocRules]
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 10)
      .map((rule) => ({
        id: rule.id,
        antecedent: rule.antecedent,
        consequent: rule.consequent,
        confidence: rule.confidence,
        lift: rule.lift,
      }));

    // Sort Q-values by Q descending
    const topQValues = [...data.qValues]
      .sort((a, b) => b.q - a.q)
      .slice(0, 10);

    // Graph density calculation removed as it was unused

    // Simulate baselines (these would be computed from actual metrics)
    const response: StatsResponse = {
      counts: {
        rules: data.assocRules.length,
        edges: data.graphEdges.length,
        items: data.items.size,
        customers: data.customers.size,
        transactions: data.transactions.length,
      },
      performance: {
        avgResponseMs: 234, // Simulated
        memoryFootprintMB: 456, // Simulated
      },
      weights: DEFAULT_WEIGHTS,
      baselines: {
        random: {
          hitRate: 0.12,
          avgPrecision: 0.08,
        },
        popularity: {
          hitRate: 0.28,
          avgPrecision: 0.21,
        },
        rgr: {
          hitRate: 0.47,
          avgPrecision: 0.39,
        },
      },
      topRules,
      topQValues,
    };

    logger.info("Stats generated successfully", {
      ruleCount: data.assocRules.length,
      itemCount: data.items.size,
    });

    logger.performance("Stats Generation", startTime);

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error fetching stats", error as Error);
    return handleError(error);
  }
}

