// Graph-based collaborative filtering recommendations
import type { GraphEdge, Transaction } from "@/types";

/**
 * Compute graph-based scores using 2-hop traversal: U→I→U→I
 * Returns scores and sample paths for explainability
 */
export function computeGraphScores(
  customerId: string,
  allEdges: GraphEdge[],
  customerHistory: Transaction[],
): Record<string, { score: number; samplePaths: Array<{ viaUserId: string; viaItemId: string }> }> {
  // Get user's purchased items (hop 1)
  const userItems = new Set<string>();
  customerHistory.forEach((tx) => {
    tx.itemIds.forEach((itemId) => userItems.add(itemId));
  });

  if (userItems.size === 0) {
    return {};
  }

  // Build adjacency maps
  const itemToUsers = new Map<string, Set<string>>();
  const userToItems = new Map<string, Set<string>>();

  allEdges.forEach((edge) => {
    if (!itemToUsers.has(edge.itemId)) {
      itemToUsers.set(edge.itemId, new Set());
    }
    if (!userToItems.has(edge.userId)) {
      userToItems.set(edge.userId, new Set());
    }
    itemToUsers.get(edge.itemId)!.add(edge.userId);
    userToItems.get(edge.userId)!.add(edge.itemId);
  });

  // 2-hop traversal: for each item user bought, find similar users, then their items
  const candidateItems = new Map<
    string,
    { weight: number; paths: Array<{ viaUserId: string; viaItemId: string }> }
  >();

  userItems.forEach((itemId) => {
    const similarUsers = itemToUsers.get(itemId);
    if (!similarUsers) return;

    similarUsers.forEach((similarUserId) => {
      if (similarUserId === customerId) return; // Skip self

      const similarUserItems = userToItems.get(similarUserId);
      if (!similarUserItems) return;

      similarUserItems.forEach((candidateItemId) => {
        if (userItems.has(candidateItemId)) return; // Skip already purchased

        if (!candidateItems.has(candidateItemId)) {
          candidateItems.set(candidateItemId, { weight: 0, paths: [] });
        }

        const entry = candidateItems.get(candidateItemId)!;
        entry.weight += 1; // Simple count-based similarity
        if (entry.paths.length < 3) {
          entry.paths.push({ viaUserId: similarUserId, viaItemId: itemId });
        }
      });
    });
  });

  // Normalize weights to [0, 1]
  const scores = Array.from(candidateItems.values()).map((e) => e.weight);
  const maxScore = Math.max(...scores, 1);
  const normalized = scores.map((s) => s / maxScore);

  // Convert to result format
  const result: Record<string, { score: number; samplePaths: Array<{ viaUserId: string; viaItemId: string }> }> = {};
  Array.from(candidateItems.keys()).forEach((itemId, idx) => {
    result[itemId] = {
      score: normalized[idx],
      samplePaths: candidateItems.get(itemId)!.paths,
    };
  });

  return result;
}

/**
 * Get total neighbors considered
 */
export function countNeighbors(customerId: string, allEdges: GraphEdge[]): number {
  const userItems = new Set<string>();
  allEdges.forEach((edge) => {
    if (edge.userId === customerId) {
      userItems.add(edge.itemId);
    }
  });

  const neighbors = new Set<string>();
  allEdges.forEach((edge) => {
    if (userItems.has(edge.itemId) && edge.userId !== customerId) {
      neighbors.add(edge.userId);
    }
  });

  return neighbors.size;
}

