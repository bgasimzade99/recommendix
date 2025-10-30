import { promises as fs } from "fs";
import path from "path";
import type { QValue } from "@/types";

export async function persistQTable(tenantId: string, entries: QValue[]): Promise<void> {
  const dir = tenantId === "default" ? path.join(process.cwd(), "data") : path.join(process.cwd(), "data", "tenants", tenantId);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "q_values.json");
  await fs.writeFile(file, JSON.stringify(entries, null, 2), "utf-8");
}


