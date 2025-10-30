import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Customer, Item, Transaction } from "@/types";
import { handleError, ValidationError } from "@/lib/backend/errors";
import { logger } from "@/lib/backend/logger";
import { refreshCacheForTenant } from "@/lib/data-loader-runtime";

function parseCSV(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((c) => c.trim()));
}

async function writeJSON(filename: string, data: unknown, tenantId: string) {
  const dir = tenantId === "default" ? path.join(process.cwd(), "data") : path.join(process.cwd(), "data", "tenants", tenantId);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function buildGraphEdges(transactions: Transaction[]) {
  const counts = new Map<string, number>();
  for (const tx of transactions) {
    for (const itemId of tx.itemIds) {
      const key = `${tx.customerId}::${itemId}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).map(([key, weight]) => {
    const [userId, itemId] = key.split("::");
    return { userId, itemId, weight };
  });
}

function buildAssocRules(transactions: Transaction[]) {
  // Simple pairwise co-occurrence mining for A->B rules
  const itemSupport = new Map<string, number>();
  const pairSupport = new Map<string, number>(); // key: A::B
  let txCount = 0;
  for (const tx of transactions) {
    txCount += 1;
    const uniq = Array.from(new Set(tx.itemIds));
    uniq.forEach((i) => itemSupport.set(i, (itemSupport.get(i) ?? 0) + 1));
    for (let i = 0; i < uniq.length; i++) {
      for (let j = 0; j < uniq.length; j++) {
        if (i === j) continue;
        const key = `${uniq[i]}::${uniq[j]}`;
        pairSupport.set(key, (pairSupport.get(key) ?? 0) + 1);
      }
    }
  }
  const rules = [] as Array<{ id: string; antecedent: string[]; consequent: string[]; support: number; confidence: number; lift: number }>; 
  for (const [key, supp] of pairSupport.entries()) {
    const [a, b] = key.split("::");
    const supA = itemSupport.get(a) ?? 1;
    const supB = itemSupport.get(b) ?? 1;
    const support = supp / txCount;
    const confidence = supp / supA;
    const lift = confidence / (supB / txCount);
    rules.push({ id: `${a}->${b}`, antecedent: [a], consequent: [b], support, confidence, lift });
  }
  // Keep top N by lift
  rules.sort((x, y) => y.lift - x.lift);
  return rules.slice(0, 5000);
}

function buildQValues(transactions: Transaction[]) {
  const keys = new Set<string>();
  for (const tx of transactions) {
    for (const itemId of tx.itemIds) {
      keys.add(`${tx.customerId}::${itemId}`);
    }
  }
  return Array.from(keys).map((k) => {
    const [customerId, itemId] = k.split("::");
    return { customerId, itemId, q: 0 };
  });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const tenantId = (new URL(request.url).searchParams.get("tenant_id") ?? request.headers.get("x-tenant-id") ?? "default").trim();

    let customers: Customer[] | null = null;
    let items: Item[] | null = null;
    let transactions: Transaction[] | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      customers = (body.customers ?? []) as Customer[];
      items = (body.items ?? []) as Item[];
      transactions = (body.transactions ?? []) as Transaction[];
    } else if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const customersCsv = (form.get("customers_csv") as string) ?? "";
      const itemsCsv = (form.get("items_csv") as string) ?? "";
      const transactionsCsv = (form.get("transactions_csv") as string) ?? "";

      if (customersCsv) {
        const rows = parseCSV(customersCsv);
        const [h, ...data] = rows;
        const idx = {
          id: h.indexOf("id"),
          name: h.indexOf("name"),
          country: h.indexOf("country"),
        };
        customers = data.map((r) => ({ id: r[idx.id], name: r[idx.name], country: r[idx.country] || undefined }));
      }
      if (itemsCsv) {
        const rows = parseCSV(itemsCsv);
        const [h, ...data] = rows;
        const idx = {
          id: h.indexOf("id"),
          sku: h.indexOf("sku"),
          name: h.indexOf("name"),
          unitPrice: h.indexOf("unitPrice"),
          category: h.indexOf("category"),
        };
        items = data.map((r) => ({ id: r[idx.id], sku: r[idx.sku], name: r[idx.name], unitPrice: Number(r[idx.unitPrice] ?? 0), tags: r[idx.category] ? [r[idx.category]] : undefined }));
      }
      if (transactionsCsv) {
        const rows = parseCSV(transactionsCsv);
        const [h, ...data] = rows;
        const idx = {
          id: h.indexOf("id"),
          customerId: h.indexOf("customerId"),
          date: h.indexOf("date"),
          total: h.indexOf("total"),
          itemIds: h.indexOf("itemIds"), // CSV list in a cell
        };
        transactions = data.map((r) => ({
          id: r[idx.id],
          customerId: r[idx.customerId],
          date: r[idx.date] || new Date().toISOString(),
          total: Number(r[idx.total] ?? 0),
          itemIds: (r[idx.itemIds] || "").split("|").map((s) => s.trim()).filter(Boolean),
        }));
      }
    } else {
      throw new ValidationError("Unsupported content type. Use application/json or multipart/form-data.");
    }

    if (!customers || !items || !transactions) {
      throw new ValidationError("customers, items, and transactions are required");
    }

    // Write base datasets
    await writeJSON("customers.json", customers, tenantId);
    await writeJSON("items.json", items, tenantId);
    await writeJSON("transactions.json", transactions, tenantId);

    // Build derived datasets
    const edges = buildGraphEdges(transactions);
    const rules = buildAssocRules(transactions);
    const qValues = buildQValues(transactions);
    await writeJSON("graph_edges.json", edges, tenantId);
    await writeJSON("assoc_rules.json", rules, tenantId);
    await writeJSON("q_values.json", qValues, tenantId);

    refreshCacheForTenant(tenantId);

    return NextResponse.json({
      status: "ok",
      tenant_id: tenantId,
      counts: {
        customers: customers.length,
        items: items.length,
        transactions: transactions.length,
        rules: rules.length,
        edges: edges.length,
        qValues: qValues.length,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}


