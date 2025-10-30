import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type TenantConfig = {
  apiKey?: string;
};

async function readTenantConfig(tenantId: string): Promise<TenantConfig | null> {
  try {
    const dir = tenantId === "default" ? path.join(process.cwd(), "data") : path.join(process.cwd(), "data", "tenants", tenantId);
    const file = path.join(dir, "config.json");
    const content = await fs.readFile(file, "utf-8");
    return JSON.parse(content) as TenantConfig;
  } catch {
    return null;
  }
}

export async function enforceApiKey(request: NextRequest, tenantId: string): Promise<NextResponse | null> {
  const provided = request.headers.get("x-api-key") ?? "";
  const cfg = await readTenantConfig(tenantId);
  const expected = cfg?.apiKey ?? "";
  if (!expected) {
    // No key configured for tenant; allow for development/evaluation
    return null;
  }
  if (provided !== expected) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid API key" } }, { status: 401 });
  }
  return null;
}


