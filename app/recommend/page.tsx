"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import type { Customer, Recommendation as RecType, FeedbackResponse } from "@/types";
import { CustomerPicker } from "@/components/CustomerPicker";
import { RecCard } from "@/components/RecCard";
import { Loader2, Sparkles } from "lucide-react";

export default function RecommendPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [recommendations, setRecommendations] = useState<RecType[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackQueue, setFeedbackQueue] = useState<Array<{ itemId: string; feedback: "like" | "dislike" | "purchase" }>>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleGetRecommendations = async () => {
    if (!selectedCustomer) return;

    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomer.id, topN: 12 }),
      });

      if (!res.ok) throw new Error("Failed to fetch recommendations");

      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (itemId: string, feedback: "like" | "dislike" | "purchase") => {
    if (!selectedCustomer) return;

    // Optimistic update
    setFeedbackQueue((prev) => [...prev, { itemId, feedback }]);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          itemId,
          feedback,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");

      const data: FeedbackResponse = await res.json();

      // Update the specific recommendation's breakdown
      setRecommendations((prev) =>
        prev.map((rec) => {
          if (rec.itemId === itemId) {
            return {
              ...rec,
              breakdown: {
                ...rec.breakdown,
                rl: {
                  ...rec.breakdown.rl,
                  qAfter: data.qAfter,
                },
              },
            };
          }
          return rec;
        })
      );

      // Show feedback success (could use a toast library)
      setTimeout(() => {
        setFeedbackQueue((prev) => prev.filter((f) => f.itemId !== itemId));
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackQueue((prev) => prev.filter((f) => f.itemId !== itemId));
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 w-full">
      <div className="container mx-auto max-w-[1600px] w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Product Recommendations
          </h1>
          <p className="mt-2 text-zinc-400">
            Select a customer and generate personalized recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left sidebar - Customer selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Select Customer
                </h2>
                <CustomerPicker
                  selectedCustomer={selectedCustomer}
                  onSelect={setSelectedCustomer}
                />
              </div>

              <button
                onClick={handleGetRecommendations}
                disabled={!selectedCustomer || loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get Recommendations
                  </span>
                )}
              </button>

              {feedbackQueue.length > 0 && (
                <div className="rounded-xl bg-green-950/50 border border-green-800 p-4 text-sm text-green-400">
                  Processing {feedbackQueue.length} feedback update(s)...
                </div>
              )}
            </div>
          </div>

          {/* Right content - Recommendations */}
          <div className="lg:col-span-2">
            {recommendations.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-16 text-center">
                <Sparkles className="mb-4 h-16 w-16 text-zinc-500" />
                <h3 className="mb-2 text-xl font-semibold text-white">
                  No recommendations yet
                </h3>
                <p className="text-zinc-400">
                  Select a customer and click &quot;Get Recommendations&quot; to start
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-16">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                <p className="mt-4 text-zinc-400">
                  Analyzing patterns and generating recommendations...
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Top Recommendations
                  </h2>
                  <span className="text-sm text-zinc-400">
                    {recommendations.length} items
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {recommendations.map((rec, idx) => (
                    <RecCard
                      key={rec.itemId}
                      recommendation={rec}
                      rank={idx + 1}
                      customerId={selectedCustomer!.id}
                      onFeedback={handleFeedback}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

