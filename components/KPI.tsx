"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KPI({ title, value, subtitle, icon: Icon, trend, className }: KPIProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-purple-500/30",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium text-zinc-400">
            {title}
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{value}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 border border-purple-500/30">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            trend === "up" && "bg-green-950/50 text-green-400 border border-green-800",
            trend === "down" && "bg-red-950/50 text-red-400 border border-red-800",
            trend === "neutral" &&
              "bg-zinc-800/50 text-zinc-400 border border-zinc-700"
          )}
        >
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          {trend === "neutral" && "→"}
        </div>
      )}
    </div>
  );
}

