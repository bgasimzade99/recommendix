"use client";

import { useState } from "react";
import type { Recommendation } from "@/types";
import { Info, Package } from "lucide-react";
import { Breakdown } from "./Breakdown";
import { FeedbackBar } from "./FeedbackBar";

interface RecCardProps {
  recommendation: Recommendation;
  rank: number;
  customerId: string;
  onFeedback: (itemId: string, feedback: "like" | "dislike" | "purchase") => void;
}

export function RecCard({ recommendation, rank, customerId, onFeedback }: RecCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Generate placeholder gradient based on rank
  const gradientColors = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-cyan-400",
    "from-green-400 to-emerald-400",
    "from-orange-400 to-red-400",
    "from-indigo-400 to-purple-400",
    "from-pink-400 to-rose-400",
    "from-cyan-400 to-blue-400",
    "from-emerald-400 to-green-400",
  ];
  const gradient = gradientColors[rank % gradientColors.length];

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-purple-500/30">
        {/* Rank badge */}
        <div className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white shadow-lg">
          #{rank}
        </div>

        {/* Image placeholder */}
        <div className={`relative h-56 w-full bg-gradient-to-br ${gradient} p-8 opacity-80`}>
          <Package className="absolute bottom-4 right-4 h-32 w-32 text-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="mb-3 text-xl font-bold text-white">
            {recommendation.itemName}
          </h3>

          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {(recommendation.score * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-zinc-400">match score</div>
            </div>

            <button
              onClick={() => setShowBreakdown(true)}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:shadow-lg"
            >
              <Info className="h-4 w-4" />
              Why?
            </button>
          </div>

          {/* Score breakdown preview */}
          <div className="mb-5 flex gap-2 rounded-lg">
            {recommendation.breakdown.ruleBased.score > 0 && (
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-80" />
            )}
            {recommendation.breakdown.graphBased.score > 0 && (
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-80" />
            )}
            {recommendation.breakdown.rl.exploitation > 0 && (
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-80" />
            )}
            {recommendation.breakdown.rl.explorationBonus > 0 && (
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 opacity-80" />
            )}
          </div>

          {/* Feedback actions */}
          <FeedbackBar
            itemId={recommendation.itemId}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* Breakdown Drawer */}
      {showBreakdown && (
        <Breakdown
          recommendation={recommendation}
          customerId={customerId}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </>
  );
}

