import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "@/types";
import { DEFAULT_WEIGHTS as defaultWeights } from "@/lib/rgr/weights";

type Weights = typeof defaultWeights;

interface AuthState {
  currentUser: Customer | null;
  login: (customer: Customer) => void;
  logout: () => void;
}

interface WeightsState {
  weights: Weights;
  updateWeights: (weights: Partial<Weights>) => void;
  resetWeights: () => void;
}

interface RecentActionsState {
  actions: Array<{
    type: string;
    timestamp: number;
    data: unknown;
  }>;
  addAction: (type: string, data: unknown) => void;
  clearActions: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  login: (customer) => set({ currentUser: customer }),
  logout: () => set({ currentUser: null }),
}));

export const useWeightsStore = create<WeightsState>()(
  persist(
    (set) => ({
      weights: defaultWeights,
      updateWeights: (newWeights) =>
        set((state) => ({
          weights: { ...state.weights, ...newWeights },
        })),
      resetWeights: () => set({ weights: defaultWeights }),
    }),
    {
      name: "rgr-weights",
    }
  )
);

export const useRecentActionsStore = create<RecentActionsState>()((set) => ({
  actions: [],
  addAction: (type, data) =>
    set((state) => ({
      actions: [...state.actions, { type, timestamp: Date.now(), data }].slice(-50), // Keep last 50
    })),
  clearActions: () => set({ actions: [] }),
}));

