"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { streamGenerate, useQuota } from "@/lib/quota-store";
import { addToCollection, store } from "@/lib/store";

interface HistoryItem {
  id?: string;
  createdAt?: number;
  samples: string[];
  result: string;
}

export default function KeywordSeoPage() {
  const [samples, setSamples] = useState(["", ""]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history] = useState<HistoryItem[]>(() =>
    store.get<HistoryItem[]>("seo_history", [])
  );
  const { recordUsage } = useQuota();

  const addSample = () => {
    if (samples.length < 3) setSamples([...samples, ""]);
  };

  const updateSample = (i: number, val: string) => {
    const updated = [...samples];
    updated[i] = val;
    setSamples(updated);
  };

  const handleGenerate = useCallback(async () => {
    const filled = samples.filter((s) => s.trim());
    if (filled.length === 0) {
      showToast("请至少粘贴一条爆款文案", "warning");
      return;
    }

    setResult("");
    setLoading(true);

    try {
      const gen = streamGenerate("seo", { samples: filled });
      let fullText = "";
      let next = await gen.next();
      while (!next.done) {
        fullText += next.value as string;
        setResult(fullText);
        next = await gen.next();
      }
      const { tokens } = next.value as { tokens: number };
      recordUsage(tokens);

      addToCollection<HistoryItem>("seo_history", { samples: filled, result: fullText }, 20);
    } catch {
      showToast("生成失败，请重试", "error");
    } finally {
      setLoading(false);
    }
  }, [samples, recordUsage]);

  return (
    <div>
      <PageHeader title="关键词优化" subtitle="分析爆款文案，提取关键词规律" />

      <div className="space-y-4 px-4 py-4 pb-8">
        {/* Sample inputs */}
        <div className="rounded-xl bg-card p-4 space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <span>📋</span> 粘贴爆款文案
            <span className="ml-auto text-xs font-normal text-muted">{samples.length}/3</span>
          </p>
          {samples.map((s, i) => (
            <div key={i}>
              <p className="mb-1.5 flex items-center gap-1 text-xs text-muted">
                <span>🔥</span> 爆款文案 {i + 1}
              </p>
              <textarea
                value={s}
                onChange={(e) => updateSample(i, e.target.value)}
                placeholder={`粘贴第${i + 1}个爆款文案...`}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>
          ))}
          {samples.length < 3 && (
            <button
              onClick={addSample}
              className="w-full rounded-lg border border-dashed border-border py-2 text-sm text-muted transition-colors hover:border-primary hover:text-primary touch-feedback"
            >
              + 添加更多文案
            </button>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover disabled:opacity-60 touch-feedback"
        >
          {loading ? "🔍 分析中..." : "🚀 一键生成解析与指南"}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-xl bg-card p-4">
            <p className="mb-2 text-sm font-semibold">分析结果</p>
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}

        {/* History */}
        <div className="rounded-xl bg-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <span>🏷️</span> 历史记录
          </p>
          {history.length === 0 ? (
            <p className="text-center text-sm text-muted py-3">暂无记录</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <div key={h.id ?? i} className="rounded-lg bg-background px-3 py-2 text-xs">
                  <p className="text-muted truncate">{h.samples[0]?.slice(0, 40)}...</p>
                  <p className="mt-0.5 text-muted/60">{new Date(h.createdAt ?? 0).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
