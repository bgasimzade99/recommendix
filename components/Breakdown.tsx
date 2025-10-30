"use client";

import { X } from "lucide-react";
import type { Recommendation } from "@/types";
import { motion } from "framer-motion";

interface BreakdownProps {
  recommendation: Recommendation;
  customerId: string;
  onClose: () => void;
}

export function Breakdown({ recommendation, customerId: _customerId, onClose }: BreakdownProps) {
  const { breakdown } = recommendation;
  void _customerId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-zinc-800 bg-gradient-to-r from-purple-950/30 to-blue-950/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Why Recommended?
              </h2>
              <p className="mt-1 text-zinc-400">
                {recommendation.itemName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Rule-based */}
          <div className="mb-6 rounded-xl border border-blue-800 bg-blue-950/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
              <h3 className="text-lg font-semibold text-white">
                Rule-based (42%)
              </h3>
            </div>
            <div className="text-sm text-blue-300">
              Score: {(breakdown.ruleBased.score * 100).toFixed(1)}%
            </div>
            {breakdown.ruleBased.matchedRuleIds.length > 0 ? (
              <div className="mt-2 text-sm text-zinc-400">
                Matched {breakdown.ruleBased.matchedRuleIds.length} association rule(s)
              </div>
            ) : (
              <div className="mt-2 text-sm text-zinc-500">No applicable rules found</div>
            )}
          </div>

          {/* Graph-based */}
          <div className="mb-6 rounded-xl border border-green-800 bg-green-950/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
              <h3 className="text-lg font-semibold text-white">
                Graph-based (38%)
              </h3>
            </div>
            <div className="text-sm text-green-300">
              Score: {(breakdown.graphBased.score * 100).toFixed(1)}%
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              Considered {breakdown.graphBased.neighborsConsidered} similar users
            </div>
            {breakdown.graphBased.samplePaths.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-zinc-400">
                  Sample paths:
                </div>
                {breakdown.graphBased.samplePaths.slice(0, 3).map((path, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300"
                  >
                    Via {path.viaUserId} → {path.viaItemId}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RL */}
          <div className="rounded-xl border border-purple-800 bg-purple-950/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <h3 className="text-lg font-semibold text-white">
                Reinforcement Learning (20%)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-purple-300">
                  Exploitation: {(breakdown.rl.exploitation * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  Q-value: {breakdown.rl.qBefore.toFixed(3)}
                </div>
              </div>
              <div>
                {breakdown.rl.explorationBonus > 0 ? (
                  <>
                    <div className="text-sm text-purple-300">
                      Exploration: {(breakdown.rl.explorationBonus * 100).toFixed(1)}%
                    </div>
                    <div className="mt-1 rounded-full bg-orange-950/50 border border-orange-800 px-2 py-0.5 text-xs text-orange-300">
                      New item
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-zinc-500">No exploration bonus</div>
                )}
              </div>
            </div>

            {breakdown.rl.qAfter !== undefined && (
              <div className="mt-3 rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300">
                Q-value updated: {breakdown.rl.qBefore.toFixed(3)} →{" "}
                {breakdown.rl.qAfter.toFixed(3)}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

