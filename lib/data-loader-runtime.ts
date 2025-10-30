import { promises as fs } from "fs";
import path from "path";
import type { Customer, Item, Transaction, AssocRule, GraphEdge, QValue } from "@/types";

type Dataset = {
  customers: Map<string, Customer>;
  items: Map<string, Item>;
  transactions: Transaction[];
  assocRules: AssocRule[];
  graphEdges: GraphEdge[];
  qValues: QValue[];
};

const tenantCache = new Map<string, Dataset>();

function datasetDir(tenantId: string) {
  return tenantId === "default"
    ? path.join(process.cwd(), "data")
    : path.join(process.cwd(), "data", "tenants", tenantId);
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function loadAllDataForTenant(tenantId: string = "default"): Promise<Dataset> {
  if (tenantCache.has(tenantId)) return tenantCache.get(tenantId)!;

  const dir = datasetDir(tenantId);
  const [customers, items, transactions, assocRules, graphEdges, qValues] = await Promise.all([
    readJson<Customer[]>(path.join(dir, "customers.json"), []),
    readJson<Item[]>(path.join(dir, "items.json"), []),
    readJson<Transaction[]>(path.join(dir, "transactions.json"), []),
    readJson<AssocRule[]>(path.join(dir, "assoc_rules.json"), []),
    readJson<GraphEdge[]>(path.join(dir, "graph_edges.json"), []),
    readJson<QValue[]>(path.join(dir, "q_values.json"), []),
  ]);

  const customersMap = new Map<string, Customer>();
  customers.forEach((c) => customersMap.set(c.id, c));
  const itemsMap = new Map<string, Item>();
  items.forEach((i) => itemsMap.set(i.id, i));

  const dataset: Dataset = {
    customers: customersMap,
    items: itemsMap,
    transactions,
    assocRules,
    graphEdges,
    qValues,
  };
  tenantCache.set(tenantId, dataset);
  return dataset;
}

export async function getCustomerHistoryForTenant(tenantId: string, customerId: string): Promise<Transaction[]> {
  const data = await loadAllDataForTenant(tenantId);
  return data.transactions.filter((tx) => tx.customerId === customerId);
}

export function refreshCacheForTenant(tenantId: string = "default") {
  tenantCache.delete(tenantId);
}


