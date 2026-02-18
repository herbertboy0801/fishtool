"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import {
  getAllWords,
  forbiddenWordsData,
} from "@/lib/forbidden-words-data";

interface DetectedWord {
  word: string;
  level: "high" | "medium" | "low";
  category: string;
  count: number;
  suggestion?: string;
}

interface AnalysisResult {
  score: number;
  detectedWords: DetectedWord[];
  highlightedText: string;
  totalFound: number;
}

const levelConfig = {
  high: { label: "高危", color: "text-danger", bg: "bg-danger/10", border: "border-danger/30", penalty: 40, maxPenalty: 49 },
  medium: { label: "中危", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", penalty: 15, maxPenalty: 100 },
  low: { label: "低危", color: "text-info", bg: "bg-info/10", border: "border-info/30", penalty: 5, maxPenalty: 100 },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function analyzeText(text: string): AnalysisResult {
  const allWords = getAllWords();
  const detectedMap = new Map<string, DetectedWord>();

  for (const wordDef of allWords) {
    const regex = new RegExp(wordDef.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const existing = detectedMap.get(wordDef.word);
      if (existing) {
        existing.count += matches.length;
      } else {
        detectedMap.set(wordDef.word, {
          word: wordDef.word,
          level: wordDef.level,
          category: wordDef.category,
          count: matches.length,
          suggestion: wordDef.suggestion,
        });
      }
    }
  }

  const detectedWords = Array.from(detectedMap.values()).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.level] - order[b.level];
  });

  // Calculate score (100 - penalties)
  let penalty = 0;
  let highPenalty = 0;
  for (const dw of detectedWords) {
    const config = levelConfig[dw.level];
    const wordPenalty = config.penalty * dw.count;
    if (dw.level === "high") {
      highPenalty += wordPenalty;
    } else {
      penalty += wordPenalty;
    }
  }
  highPenalty = Math.min(highPenalty, levelConfig.high.maxPenalty);
  const score = Math.max(0, 100 - highPenalty - penalty);

  // Generate highlighted text
  let highlighted = escapeHtml(text);
  const sortedByLength = [...detectedWords].sort(
    (a, b) => b.word.length - a.word.length
  );
  for (const dw of sortedByLength) {
    const escapedWord = escapeHtml(dw.word);
    const regex = new RegExp(
      escapedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    const className =
      dw.level === "high"
        ? "fw-high"
        : dw.level === "medium"
          ? "fw-medium"
          : "fw-low";
    highlighted = highlighted.replace(
      regex,
      `<mark class="${className}">$&</mark>`
    );
  }

  return {
    score,
    detectedWords,
    highlightedText: highlighted,
    totalFound: detectedWords.reduce((sum, dw) => sum + dw.count, 0),
  };
}

export default function ForbiddenWordsPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      showToast("请输入要检测的文案内容", "warning");
      return;
    }
    const analysisResult = analyzeText(trimmed);
    setResult(analysisResult);
    if (analysisResult.totalFound === 0) {
      showToast("未检测到违禁词，文案安全！", "success");
    } else {
      showToast(`检测到 ${analysisResult.totalFound} 个敏感词`, "warning");
    }
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
    setResult(null);
  }, []);

  const scoreColor =
    result === null
      ? ""
      : result.score >= 80
        ? "text-success"
        : result.score >= 50
          ? "text-warning"
          : "text-danger";

  const scoreLabel =
    result === null
      ? ""
      : result.score >= 80
        ? "安全"
        : result.score >= 50
          ? "有风险"
          : "高危";

  return (
    <div>
      <PageHeader title="违禁词检测" subtitle="检测文案敏感词，避免限流" />

      <div className="space-y-4 px-4 py-4">
        {/* Input Card */}
        <div className="rounded-xl bg-card p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴你的商品标题或文案内容..."
            rows={5}
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAnalyze}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
            >
              🔍 开始检测
            </button>
            <button
              onClick={handleClear}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:bg-card-hover touch-feedback"
            >
              清空
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <>
            {/* Score Card */}
            <div className="rounded-xl bg-card p-6 text-center">
              <p className="text-sm text-muted">安全评分</p>
              <p className={`mt-1 text-5xl font-bold ${scoreColor}`}>
                {result.score}
              </p>
              <p className={`mt-1 text-sm font-medium ${scoreColor}`}>
                {scoreLabel}
              </p>
              <p className="mt-2 text-xs text-muted">
                共检测到 {result.totalFound} 个敏感词
              </p>
            </div>

            {/* Highlighted Text */}
            {result.totalFound > 0 && (
              <div className="rounded-xl bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold">检测结果</h3>
                <div
                  className="whitespace-pre-wrap text-sm leading-relaxed [&_.fw-high]:rounded [&_.fw-high]:bg-danger/20 [&_.fw-high]:px-0.5 [&_.fw-high]:text-danger [&_.fw-medium]:rounded [&_.fw-medium]:bg-warning/20 [&_.fw-medium]:px-0.5 [&_.fw-medium]:text-warning [&_.fw-low]:rounded [&_.fw-low]:bg-info/20 [&_.fw-low]:px-0.5 [&_.fw-low]:text-info"
                  dangerouslySetInnerHTML={{ __html: result.highlightedText }}
                />
              </div>
            )}

            {/* Detected Words List */}
            {result.detectedWords.length > 0 && (
              <div className="rounded-xl bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">违禁词明细</h3>
                <div className="space-y-2">
                  {result.detectedWords.map((dw) => {
                    const config = levelConfig[dw.level];
                    return (
                      <div
                        key={dw.word}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${config.border} ${config.bg}`}
                      >
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${config.color}`}
                        >
                          {config.label}
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {dw.word}
                        </span>
                        <span className="text-xs text-muted">
                          {dw.count}次
                        </span>
                        {dw.suggestion && (
                          <span className="text-xs text-muted">
                            → {dw.suggestion}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Legend */}
        <div className="rounded-xl bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">风险等级说明</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-danger/20 px-2 py-0.5 text-danger">
                高危
              </span>
              <span className="text-muted">极可能导致限流或下架，每个扣40分</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-warning/20 px-2 py-0.5 text-warning">
                中危
              </span>
              <span className="text-muted">有一定风险，建议修改，每个扣15分</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-info/20 px-2 py-0.5 text-info">
                低危
              </span>
              <span className="text-muted">较低风险，视情况保留，每个扣5分</span>
            </div>
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs text-muted">
              词库覆盖 {forbiddenWordsData.length} 大分类，共{" "}
              {getAllWords().length} 个违禁词。评分 ≥80 为安全，50-79 有风险，＜50 高危。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
