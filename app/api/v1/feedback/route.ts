import { NextRequest, NextResponse } from "next/server";
import { loadAllDataForTenant } from "@/lib/data-loader-runtime";
import { initializeQTable, updateQValue, type QTable } from "@/lib/rgr/rl";
import { qTableCache } from "@/lib/backend/cache";
import { handleError, ValidationError } from "@/lib/backend/errors";
import { validateCustomerExists, validateItemExists } from "@/lib/backend/validation";
import { logger } from "@/lib/backend/logger";
import { addRequestId, rateLimitMiddleware, securityHeaders } from "@/lib/backend/middleware";
import { enforceApiKey } from "@/lib/backend/auth";
import { persistQTable } from "@/lib/backend/qtable-persist";

function getQTableKey(tenantId: string) {
  return `main-qtable:${tenantId}`;
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const requestId = addRequestId(request);
    const body = await request.json();
    const userId = body?.user_id as string | undefined;
    const itemId = body?.item_id as string | undefined;
    const action = body?.action as ("like" | "dislike" | "purchase") | undefined;
    const _timestamp = body?.timestamp as string | undefined;
    const tenantId = (body?.tenant_id as string | undefined) ?? request.headers.get("x-tenant-id") ?? "default";

    if (!userId || !itemId || !action) {
      throw new ValidationError("user_id, item_id and action are required");
    }

    const rl = rateLimitMiddleware(request, `${tenantId}:${userId}:feedback`);
    if (rl) return rl;

    const unauthorized = await enforceApiKey(request, tenantId);
    if (unauthorized) return unauthorized;

    const data = await loadAllDataForTenant(tenantId);
    validateCustomerExists(userId, data.customers);
    validateItemExists(itemId, data.items);

    let qTable = qTableCache.get(getQTableKey(tenantId)) as QTable | null;
    if (!qTable) {
      qTable = initializeQTable(data.qValues);
      qTableCache.set(getQTableKey(tenantId), qTable);
    }
    const qBefore = qTable.get(`${userId}:${itemId}`) ?? 0;
    const qAfter = updateQValue(qTable, userId, itemId, action);

    // Persist latest Q-table snapshot asynchronously (best-effort)
    (async () => {
      try {
        const entries = Array.from(qTable.entries()).map(([key, q]) => {
          const [customerId, itemId2] = key.split(":");
          return { customerId, itemId: itemId2, q };
        });
        await persistQTable(tenantId, entries);
      } catch {}
    })();

    logger.performance("v1 Feedback Processing", startTime, { requestId, userId, itemId, action });

    return NextResponse.json({
      tenant_id: tenantId,
      user_id: userId,
      item_id: itemId,
      action,
      q_before: qBefore,
      q_after: qAfter,
      processed_at: new Date().toISOString(),
    }, { headers: securityHeaders() });
  } catch (error) {
    return handleError(error);
  }
}


