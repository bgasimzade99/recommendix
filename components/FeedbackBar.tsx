"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ShoppingCart } from "lucide-react";

interface FeedbackBarProps {
  itemId: string;
  onFeedback: (itemId: string, feedback: "like" | "dislike" | "purchase") => void;
}

export function FeedbackBar({ itemId, onFeedback }: FeedbackBarProps) {
  const [pending, setPending] = useState(false);

  const handleFeedback = async (feedback: "like" | "dislike" | "purchase") => {
    setPending(true);
    await onFeedback(itemId, feedback);
    setTimeout(() => setPending(false), 500);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleFeedback("like")}
        disabled={pending}
        className="flex-1 rounded-lg bg-blue-950/50 border border-blue-800 px-3 py-2 text-sm font-medium text-blue-400 transition-all hover:bg-blue-900/50 hover:border-blue-600 disabled:opacity-50"
      >
        <ThumbsUp className="h-4 w-4 inline mr-1" />
        Like
      </button>
      <button
        onClick={() => handleFeedback("dislike")}
        disabled={pending}
        className="flex-1 rounded-lg bg-red-950/50 border border-red-800 px-3 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-900/50 hover:border-red-600 disabled:opacity-50"
      >
        <ThumbsDown className="h-4 w-4 inline mr-1" />
        Dislike
      </button>
      <button
        onClick={() => handleFeedback("purchase")}
        disabled={pending}
        className="flex-1 rounded-lg bg-green-950/50 border border-green-800 px-3 py-2 text-sm font-medium text-green-400 transition-all hover:bg-green-900/50 hover:border-green-600 disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4 inline mr-1" />
        Buy
      </button>
    </div>
  );
}

