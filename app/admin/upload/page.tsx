"use client";

import { useState } from "react";

export default function AdminUploadPage() {
  const [tenantId, setTenantId] = useState("default");
  const [mode, setMode] = useState<"csv" | "json">("csv");
  const [customersCsv, setCustomersCsv] = useState("");
  const [itemsCsv, setItemsCsv] = useState("");
  const [transactionsCsv, setTransactionsCsv] = useState("");
  const [jsonPayload, setJsonPayload] = useState("{\n  \"customers\": [],\n  \"items\": [],\n  \"transactions\": []\n}");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    setLoading(true);
    setResult("");
    try {
      let res: Response;
      if (mode === "csv") {
        const form = new FormData();
        form.set("customers_csv", customersCsv);
        form.set("items_csv", itemsCsv);
        form.set("transactions_csv", transactionsCsv);
        res = await fetch(`/api/v1/data/upload?tenant_id=${encodeURIComponent(tenantId)}`, {
          method: "POST",
          body: form,
        });
      } else {
        const payload = JSON.parse(jsonPayload);
        res = await fetch(`/api/v1/data/upload?tenant_id=${encodeURIComponent(tenantId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const text = await res.text();
      setResult(text);
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 w-full">
      <div className="container mx-auto max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4">Admin: Data Upload</h1>
        <p className="text-sm text-zinc-500 mb-6">Upload customer, item, and transaction data for a specific tenant to generate rules/graph/Q-values.</p>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Tenant ID</label>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. acme"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Mode</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" checked={mode === "csv"} onChange={() => setMode("csv")} />
                CSV (paste text)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" checked={mode === "json"} onChange={() => setMode("json")} />
                JSON
              </label>
            </div>
          </div>
        </div>

        {mode === "csv" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">customers_csv</label>
              <textarea
                className="w-full h-48 rounded border border-zinc-700 bg-zinc-900 p-2 text-sm"
                placeholder="id,name,country\n1,Alice,UK"
                value={customersCsv}
                onChange={(e) => setCustomersCsv(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">items_csv</label>
              <textarea
                className="w-full h-48 rounded border border-zinc-700 bg-zinc-900 p-2 text-sm"
                placeholder="id,sku,name,unitPrice,category\nSKU1,SKU1,Widget,9.99,Tools"
                value={itemsCsv}
                onChange={(e) => setItemsCsv(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">transactions_csv</label>
              <textarea
                className="w-full h-48 rounded border border-zinc-700 bg-zinc-900 p-2 text-sm"
                placeholder="id,customerId,date,total,itemIds\nT1,1,2024-01-01,19.98,SKU1|SKU2"
                value={transactionsCsv}
                onChange={(e) => setTransactionsCsv(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">JSON payload</label>
            <textarea
              className="w-full h-72 rounded border border-zinc-700 bg-zinc-900 p-2 text-sm"
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
            />
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            className="rounded bg-purple-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload & Build"}
          </button>
          <span className="text-xs text-zinc-500">transactions_csv expects itemIds separated by |</span>
        </div>

        {result && (
          <pre className="mt-6 whitespace-pre-wrap rounded border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
{result}
          </pre>
        )}
      </div>
    </div>
  );
}


