// Input validation utilities with type safety
import { ValidationError } from "./errors";

export function validateRecommendRequest(body: unknown): { customerId: string; topN: number } {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid JSON object");
  }

  const { customerId, topN } = body as { customerId?: unknown; topN?: unknown };

  if (!customerId || typeof customerId !== "string" || customerId.trim().length === 0) {
    throw new ValidationError("customerId is required and must be a non-empty string");
  }

  if (topN !== undefined) {
    if (typeof topN !== "number" || !Number.isInteger(topN) || topN < 1 || topN > 100) {
      throw new ValidationError("topN must be an integer between 1 and 100");
    }
  }

  return {
    customerId: customerId.trim(),
    topN: topN || 10,
  };
}

export function validateFeedbackRequest(body: unknown): {
  customerId: string;
  itemId: string;
  feedback: "like" | "dislike" | "purchase";
} {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid JSON object");
  }

  const { customerId, itemId, feedback } = body as {
    customerId?: unknown;
    itemId?: unknown;
    feedback?: unknown;
  };

  if (!customerId || typeof customerId !== "string" || customerId.trim().length === 0) {
    throw new ValidationError("customerId is required and must be a non-empty string");
  }

  if (!itemId || typeof itemId !== "string" || itemId.trim().length === 0) {
    throw new ValidationError("itemId is required and must be a non-empty string");
  }

  if (!feedback || typeof feedback !== "string") {
    throw new ValidationError("feedback is required and must be a string");
  }

  const validFeedbackTypes = ["like", "dislike", "purchase"];
  if (!validFeedbackTypes.includes(feedback)) {
    throw new ValidationError(
      `feedback must be one of: ${validFeedbackTypes.join(", ")}`,
      { received: feedback }
    );
  }

  return {
    customerId: customerId.trim(),
    itemId: itemId.trim(),
    feedback: feedback as "like" | "dislike" | "purchase",
  };
}

export function validateCustomerExists(customerId: string, customers: Map<string, unknown>): void {
  if (!customers.has(customerId)) {
    throw new ValidationError(`Customer with ID '${customerId}' not found`, {
      customerId,
    });
  }
}

export function validateItemExists(itemId: string, items: Map<string, unknown>): void {
  if (!items.has(itemId)) {
    throw new ValidationError(`Item with ID '${itemId}' not found`, {
      itemId,
    });
  }
}

