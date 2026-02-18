"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { store } from "@/lib/store";
import { streamGenerate, useQuota } from "@/lib/quota-store";

type Style = "标准" | "精炼" | "权威" | "种草";

const STYLES: { key: Style; icon: string; desc: string }[] = [
  { key: "标准", icon: "📦", desc: "清晰专业" },
  { key: "精炼", icon: "😊", desc: "简洁有力" },
  { key: "权威", icon: "🔥", desc: "可信权威" },
  { key: "种草", icon: "🌿", desc: "感染种草" },
];

const MAX_INPUT = 200;
const HISTORY_KEY = "copywriting_history";

interface HistoryItem {
  id: string;
  input: string;
  style: Style;
  result: string;
  date: string;
  starred: boolean;
}

function loadHistory(): HistoryItem[] {
  return store.get<HistoryItem[]>(HISTORY_KEY, []);
}

function saveHistory(items: HistoryItem[]) {
  store.set(HISTORY_KEY, items.slice(0, 30));
}

export default function CopywritingPage() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<Style>("标准");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"generate" | "history">("generate");
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const { estimatedCost, actualCost, recordUsage } = useQuota();

  const generate = useCallback(async () => {
    if (!input.trim()) {
      showToast("请先粘贴同行文案", "error");
      return;
    }
    if (loading) return;

    setLoading(true);
    setResult("");
    let fullText = "";

    try {
      const gen = streamGenerate("copywriting", { text: input, style });
      // Manual iteration to capture the generator return value (tokens)
      let next = await gen.next();
      while (!next.done) {
        fullText += next.value as string;
        setResult(fullText);
        next = await gen.next();
      }
      const tokens = (next.value as { tokens: number } | undefined)?.tokens ?? 0;
      recordUsage(tokens);

      // save to history
      const item: HistoryItem = {
        id: Date.now().toString(),
        input: input.slice(0, 50) + (input.length > 50 ? "…" : ""),
        style,
        result: fullText,
        date: new Date().toLocaleDateString("zh-CN"),
        starred: false,
      };
      const updated = [item, ...history];
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "生成失败，请重试", "error");
      setResult("");
    } finally {
      setLoading(false);
    }
  }, [input, style, loading, history, recordUsage]);

  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => showToast("已复制到剪贴板", "success"));
  }

  function toggleStar(id: string) {
    const updated = history.map((h) => (h.id === id ? { ...h, starred: !h.starred } : h));
    setHistory(updated);
    saveHistory(updated);
  }

  function clearInput() {
    setInput("");
    setResult("");
  }

  return (
    <>
      <PageHeader
        title="文案生成"
        subtitle="粘贴同行文案，AI一键改写"
        rightSlot={
          <div className="flex gap-3">
            <button
              onClick={() => setTab("history")}
              className="text-muted active:text-primary"
              title="历史记录"
            >
              🕐
            </button>
            <button
              onClick={() => setTab(tab === "generate" ? "history" : "generate")}
              className="text-muted active:text-primary"
              title="收藏"
            >
              ⭐
            </button>
          </div>
        }
      />

      {tab === "generate" ? (
        <div className="px-4 pt-4 pb-6">
          {/* Input area */}
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>📋 粘贴同行文案</span>
              <span className={input.length > MAX_INPUT ? "text-danger" : ""}>
                {input.length}/{MAX_INPUT}
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
              placeholder="粘贴同行的商品描述，AI将帮你生成独特的优化文案..."
              rows={5}
              className="w-full resize-none rounded-xl bg-card px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary placeholder:text-muted leading-relaxed"
            />
            {input && (
              <button
                onClick={clearInput}
                className="mt-1 text-xs text-muted hover:text-foreground"
              >
                清空
              </button>
            )}
          </div>

          {/* Style selector */}
          <div className="mb-4">
            <p className="mb-2 text-xs text-muted">🎨 选择文案风格</p>
            <div className="grid grid-cols-4 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-3 text-xs transition-colors border ${
                    style === s.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted"
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-medium">{s.key}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-black disabled:opacity-50 touch-feedback"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                生成中...
              </span>
            ) : (
              "✨ 开始生成"
            )}
          </button>

          {/* Usage display */}
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>本次预计消耗：{estimatedCost > 0 ? `${estimatedCost} token` : "-"}</span>
            <span>本次实际消耗：{actualCost > 0 ? `${actualCost} token` : "-"}</span>
          </div>

          {/* Result area */}
          {result && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>✅ 生成结果</span>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-primary"
                >
                  📋 复制
                </button>
              </div>
              <div className="relative min-h-24 rounded-xl bg-card p-4 text-sm leading-relaxed border border-primary/20">
                {result}
                {loading && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History tab */
        <div className="px-4 pt-4">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("generate")}
              className="text-xs text-muted underline"
            >
              ← 返回生成
            </button>
            <span className="text-xs text-muted">历史记录 ({history.length})</span>
          </div>

          {history.length === 0 ? (
            <div className="mt-20 text-center text-sm text-muted">暂无记录</div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="rounded-xl bg-card p-4 border border-border">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        {item.style}
                      </span>
                      <span>{item.date}</span>
                    </div>
                    <button onClick={() => toggleStar(item.id)}>
                      {item.starred ? "⭐" : "☆"}
                    </button>
                  </div>
                  <p className="mb-2 text-xs text-muted line-clamp-1">原文：{item.input}</p>
                  <p className="text-sm leading-relaxed line-clamp-3">{item.result}</p>
                  <button
                    onClick={() =>
                      navigator.clipboard
                        .writeText(item.result)
                        .then(() => showToast("已复制", "success"))
                    }
                    className="mt-2 text-xs text-primary"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
