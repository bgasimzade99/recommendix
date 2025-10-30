// Centralized data loading utility
import type { Customer, Item, Transaction, AssocRule, GraphEdge, QValue } from "@/types";

import customersData from "@/data/customers.json";
import itemsData from "@/data/items.json";
import transactionsData from "@/data/transactions.json";
import assocRulesData from "@/data/assoc_rules.json";
import graphEdgesData from "@/data/graph_edges.json";
import qValuesData from "@/data/q_values.json";

let dataCache: {
  customers: Map<string, Customer>;
  items: Map<string, Item>;
  transactions: Transaction[];
  assocRules: AssocRule[];
  graphEdges: GraphEdge[];
  qValues: QValue[];
} | null = null;

export function loadAllData() {
  if (dataCache) return dataCache;

  const customers = new Map<string, Customer>();
  customersData.forEach((c) => customers.set(c.id, c));

  const items = new Map<string, Item>();
  itemsData.forEach((i) => items.set(i.id, i));

  dataCache = {
    customers,
    items,
    transactions: transactionsData as Transaction[],
    assocRules: assocRulesData as AssocRule[],
    graphEdges: graphEdgesData as GraphEdge[],
    qValues: qValuesData as QValue[],
  };

  return dataCache;
}

export function getCustomerHistory(customerId: string): Transaction[] {
  const data = loadAllData();
  return data.transactions.filter((tx) => tx.customerId === customerId);
}

export function refreshCache() {
  dataCache = null;
  loadAllData();
}

