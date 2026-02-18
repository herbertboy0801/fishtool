import { create } from "zustand";
import { store } from "./store";

interface QuotaState {
  quota: number;          // remaining quota
  used: number;           // used this month
  estimatedCost: number;  // for current request
  actualCost: number;     // last request actual cost

  setEstimated: (tokens: number) => void;
  recordUsage: (tokens: number) => void;
  hydrate: () => void;
}

const QUOTA_KEY = "quota_remaining";
const USED_KEY = "quota_used";
const FREE_QUOTA = 50;

export const useQuota = create<QuotaState>((set, get) => ({
  quota: FREE_QUOTA,
  used: 0,
  estimatedCost: 0,
  actualCost: 0,

  setEstimated: (tokens) => set({ estimatedCost: tokens }),

  recordUsage: (tokens) => {
    const { quota, used } = get();
    const newUsed = used + tokens;
    const newQuota = Math.max(quota - tokens, 0);
    store.set(QUOTA_KEY, newQuota);
    store.set(USED_KEY, newUsed);
    set({ quota: newQuota, used: newUsed, actualCost: tokens, estimatedCost: 0 });
  },

  hydrate: () => {
    const quota = store.get<number>(QUOTA_KEY, FREE_QUOTA);
    const used = store.get<number>(USED_KEY, 0);
    set({ quota, used });
  },
}));

/** SSE stream reader helper — returns async generator of text chunks */
export async function* streamGenerate(
  type: string,
  params: Record<string, unknown>
): AsyncGenerator<string, { tokens: number }, unknown> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...params }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let tokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = JSON.parse(line.slice(6)) as {
        text?: string;
        done?: boolean;
        tokens?: number;
        error?: string;
      };
      if (json.error) throw new Error(json.error);
      if (json.done) {
        tokens = json.tokens ?? 0;
      } else if (json.text) {
        yield json.text;
      }
    }
  }

  return { tokens };
}
