"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import type { StatsResponse } from "@/types";
import { KPI } from "@/components/KPI";
import { Database, Network, Clock, HardDrive } from "lucide-react";

export default function MetricsPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    fetchStats();
  }, [currentUser, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-400">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 w-full">
      <div className="container mx-auto max-w-[1600px] w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">System Metrics</h1>
          <p className="mt-2 text-zinc-400">
            Performance analytics and algorithm insights
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPI
            title="Avg Response Time"
            value={`${stats.performance.avgResponseMs}ms`}
            icon={Clock}
            trend="neutral"
          />
          <KPI
            title="Memory Usage"
            value={`${stats.performance.memoryFootprintMB}MB`}
            icon={HardDrive}
            trend="neutral"
          />
          <KPI
            title="Association Rules"
            value={stats.counts.rules}
            icon={Database}
            trend="neutral"
          />
          <KPI
            title="Graph Density"
            value={(stats.counts.edges / (stats.counts.customers * stats.counts.items) * 100).toFixed(1)}
            subtitle="%"
            icon={Network}
            trend="neutral"
          />
        </div>

        {/* Baselines */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Random Baseline
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Hit Rate</span>
                <span className="text-sm font-medium text-white">
                  {(stats.baselines.random.hitRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Avg Precision</span>
                <span className="text-sm font-medium text-white">
                  {(stats.baselines.random.avgPrecision * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Popularity Baseline
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Hit Rate</span>
                <span className="text-sm font-medium text-white">
                  {(stats.baselines.popularity.hitRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Avg Precision</span>
                <span className="text-sm font-medium text-white">
                  {(stats.baselines.popularity.avgPrecision * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-950/30 to-blue-950/30 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              RGR Hybrid
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Hit Rate</span>
                <span className="text-sm font-medium text-green-400">
                  {(stats.baselines.rgr.hitRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Avg Precision</span>
                <span className="text-sm font-medium text-green-400">
                  {(stats.baselines.rgr.avgPrecision * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm weights */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Algorithm Weights
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(stats.weights).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-400">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <div
                    className="h-full bg-zinc-900 dark:bg-white"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top rules and Q-values */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Top 10 Rules (by Lift)
            </h2>
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {stats.topRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3"
                >
                  <div className="mb-1 text-xs font-medium text-zinc-400">
                    #{idx + 1}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {rule.antecedent.join(", ")} → {rule.consequent.join(", ")}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-zinc-400">
                    <span>Conf: {(rule.confidence * 100).toFixed(1)}%</span>
                    <span>Lift: {rule.lift.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Top 10 Q-Values
            </h2>
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {stats.topQValues.map((qv, idx) => (
                <div
                  key={`${qv.customerId}-${qv.itemId}`}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3"
                >
                  <div className="mb-1 text-xs font-medium text-zinc-400">
                    #{idx + 1}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {qv.customerId} × {qv.itemId}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Q: {qv.q.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

