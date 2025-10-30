// RGR Recommender System - Type Definitions

export type Customer = {
  id: string;
  name: string;
  country?: string;
  tags?: string[];
};

export type Item = {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  tags?: string[];
};

export type Transaction = {
  id: string;
  customerId: string;
  itemIds: string[];
  date: string;
  total: number;
};

export type AssocRule = {
  id: string;
  antecedent: string[]; // items A
  consequent: string[]; // items B
  support: number;
  confidence: number;
  lift: number;
};

export type GraphEdge = {
  userId: string;
  itemId: string;
  weight: number;
};

export type QValue = {
  customerId: string;
  itemId: string;
  q: number;
};

export type RecBreakdown = {
  ruleBased: {
    score: number;
    matchedRuleIds: string[];
  };
  graphBased: {
    score: number;
    neighborsConsidered: number;
    samplePaths: Array<{ viaUserId: string; viaItemId: string }>;
  };
  rl: {
    exploitation: number;
    explorationBonus: number;
    qBefore: number;
    qAfter?: number;
  };
};

export type Recommendation = {
  itemId: string;
  itemName: string;
  score: number;
  breakdown: RecBreakdown;
};

export type RecommendResponse = {
  customerId: string;
  recommendations: Recommendation[];
  weights: {
    rule: number;
    graph: number;
    rlExploit: number;
    rlExplore: number;
  };
  timingsMs: {
    association: number;
    graph: number;
    rl: number;
    total: number;
  };
};

export type FeedbackRequest = {
  customerId: string;
  itemId: string;
  feedback: "like" | "dislike" | "purchase";
};

export type FeedbackResponse = {
  customerId: string;
  itemId: string;
  qBefore: number;
  qAfter: number;
  rationale: string;
  isExploration: boolean;
};

export type StatsResponse = {
  counts: {
    rules: number;
    edges: number;
    items: number;
    customers: number;
    transactions: number;
  };
  performance: {
    avgResponseMs: number;
    memoryFootprintMB: number;
  };
  weights: {
    rule: number;
    graph: number;
    rlExploit: number;
    rlExplore: number;
  };
  baselines: {
    random: {
      hitRate: number;
      avgPrecision: number;
    };
    popularity: {
      hitRate: number;
      avgPrecision: number;
    };
    rgr: {
      hitRate: number;
      avgPrecision: number;
    };
  };
  topRules: Array<{
    id: string;
    antecedent: string[];
    consequent: string[];
    confidence: number;
    lift: number;
  }>;
  topQValues: Array<{
    customerId: string;
    itemId: string;
    q: number;
  }>;
};

