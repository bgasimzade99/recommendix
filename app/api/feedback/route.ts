import { NextRequest, NextResponse } from "next/server";
import type { FeedbackResponse } from "@/types";
import { loadAllData } from "@/lib/data-loader";
import { initializeQTable, updateQValue, type QTable } from "@/lib/rgr/rl";
import { handleError } from "@/lib/backend/errors";
import { validateFeedbackRequest, validateCustomerExists, validateItemExists } from "@/lib/backend/validation";
import { logger } from "@/lib/backend/logger";
import { qTableCache } from "@/lib/backend/cache";

function getQTable(): QTable {
  const cached = qTableCache.get("main-qtable");
  if (cached) {
    return cached;
  }

  const data = loadAllData();
  const qTable = initializeQTable(data.qValues);
  qTableCache.set("main-qtable", qTable);
  
  return qTable;
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const body = await request.json();
    const { customerId, itemId, feedback } = validateFeedbackRequest(body);
    
    logger.info("Feedback received", { customerId, itemId, feedback });

    const data = loadAllData();
    
    // Validate customer and item exist
    validateCustomerExists(customerId, data.customers);
    validateItemExists(itemId, data.items);

    const qTable = getQTable();
    const qBefore = qTable.get(`${customerId}:${itemId}`) ?? 0;

    // Update Q-value
    const qAfter = updateQValue(qTable, customerId, itemId, feedback);

    // Determine if this is exploration or exploitation
    const isExploration = qBefore === 0;

    // Generate rationale
    let rationale = "";
    if (feedback === "purchase") {
      rationale = isExploration
        ? "Great discovery! Q-value increased significantly for this unexplored item."
        : "Confirmed preference! Q-value reinforced.";
    } else if (feedback === "like") {
      rationale = "Positive signal recorded. Q-value increased moderately.";
    } else {
      rationale = "Negative feedback noted. Q-value decreased to avoid future recommendations.";
    }

    const response: FeedbackResponse = {
      customerId,
      itemId,
      qBefore,
      qAfter,
      rationale,
      isExploration,
    };

    logger.info("Feedback processed successfully", {
      customerId,
      itemId,
      feedback,
      qDelta: (qAfter - qBefore).toFixed(3),
      isExploration,
    });

    logger.performance("Feedback Processing", startTime, {
      customerId,
      itemId,
      feedback,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error processing feedback", error as Error);
    return handleError(error);
  }
}

