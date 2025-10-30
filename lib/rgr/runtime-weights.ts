import { DEFAULT_WEIGHTS, validateWeights } from "@/lib/rgr/weights";

let CURRENT_WEIGHTS = { ...DEFAULT_WEIGHTS };

export function getCurrentWeights() {
  return { ...CURRENT_WEIGHTS };
}

export function setCurrentWeights(partial: Partial<typeof DEFAULT_WEIGHTS>) {
  CURRENT_WEIGHTS = validateWeights(partial);
  return getCurrentWeights();
}


