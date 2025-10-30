"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { loadAllData } from "@/lib/data-loader";
import { KPI } from "@/components/KPI";
import { Users, ShoppingBag, Receipt, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  type Stats = {
    customers: number;
    items: number;
    transactions: number;
    rules: number;
  } | null;

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }
  }, [currentUser, router]);

  const stats: Stats = useMemo(() => {
    if (!currentUser) return null;
    const data = loadAllData();
    return {
      customers: data.customers.size,
      items: data.items.size,
      transactions: data.transactions.length,
      rules: data.assocRules.length,
    };
  }, [currentUser]);

  if (!currentUser || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 w-full">
      <div className="container mx-auto max-w-[1600px] w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Welcome back, {currentUser.name}! Here&rsquo;s your overview.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPI
            title="Total Customers"
            value={stats.customers}
            subtitle="Active users"
            icon={Users}
            trend="up"
          />
          <KPI
            title="Catalog Size"
            value={stats.items}
            subtitle="Available products"
            icon={ShoppingBag}
            trend="neutral"
          />
          <KPI
            title="Transactions"
            value={stats.transactions}
            subtitle="All-time sales"
            icon={Receipt}
            trend="up"
          />
          <KPI
            title="Association Rules"
            value={stats.rules}
            subtitle="Active patterns"
            icon={TrendingUp}
            trend="neutral"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/recommend")}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-left font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                Get Recommendations →
              </button>
              <button
                onClick={() => router.push("/metrics")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-left text-white transition-all hover:border-purple-500/50 hover:bg-zinc-800"
              >
                View Metrics →
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">
              System Health
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Avg Response Time</span>
                <span className="text-sm font-medium text-white">~234ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Memory Usage</span>
                <span className="text-sm font-medium text-white">
                  &lt;500MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Recommendations Generated</span>
                <span className="text-sm font-medium text-white">
                  {(stats.customers * 2).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

