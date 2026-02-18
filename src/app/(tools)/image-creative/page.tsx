"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { streamGenerate, useQuota } from "@/lib/quota-store";

const CATEGORIES = [
  { icon: "📱", name: "数码电子" },
  { icon: "👗", name: "服装鞋包" },
  { icon: "🏠", name: "家居日用" },
  { icon: "⚽", name: "运动护具" },
  { icon: "🐾", name: "宠物用品" },
  { icon: "🎮", name: "玩具手办" },
  { icon: "📚", name: "图书文具" },
  { icon: "💄", name: "美妆护肤" },
  { icon: "🎵", name: "乐器音响" },
  { icon: "💍", name: "发饰配件" },
  { icon: "🍳", name: "厨房电器" },
  { icon: "🎨", name: "艺术收藏" },
];

const POINT_PRESETS = [
  "九九成新", "原包装", "低价转", "闲置良品",
  "正品保证", "手慢无", "限量款", "绝版品",
];

export default function ImageCreativePage() {
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [points, setPoints] = useState<string[]>([]);
  const [customPoint, setCustomPoint] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { recordUsage } = useQuota();

  const togglePoint = (p: string) => {
    setPoints((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const addCustomPoint = () => {
    const p = customPoint.trim();
    if (!p) return;
    if (!points.includes(p)) setPoints([...points, p]);
    setCustomPoint("");
  };

  const handleGenerate = useCallback(async () => {
    if (!category) {
      showToast("请选择商品类目", "warning");
      return;
    }

    setResult("");
    setLoading(true);

    try {
      const gen = streamGenerate("image-creative", {
        category,
        productName,
        points,
      });
      let fullText = "";
      let next = await gen.next();
      while (!next.done) {
        fullText += next.value as string;
        setResult(fullText);
        next = await gen.next();
      }
      const { tokens } = next.value as { tokens: number };
      recordUsage(tokens);
    } catch {
      showToast("生成失败，请重试", "error");
    } finally {
      setLoading(false);
    }
  }, [category, productName, points, recordUsage]);

  return (
    <div>
      <PageHeader title="图片创意方案" subtitle="AI分析同行图片，生成拍摄优化建议" />

      <div className="space-y-4 px-4 py-4 pb-8">
        {/* Category */}
        <div className="rounded-xl bg-card p-4">
          <p className="mb-3 text-sm font-semibold">📦 商品类目</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs transition-all touch-feedback ${
                  category === c.name
                    ? "bg-pink-500/20 border border-pink-500/50 text-pink-400"
                    : "bg-background border border-border text-muted"
                }`}
              >
                <span className="text-lg">{c.icon}</span>
                <span className="text-[10px]">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product name */}
        <div className="rounded-xl bg-card p-4">
          <label className="mb-1.5 block text-sm font-semibold">🏷️ 商品名称</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="例：iPhone 14 Pro 256G 暗紫色"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Selling points */}
        <div className="rounded-xl bg-card p-4">
          <p className="mb-3 text-sm font-semibold">✨ 核心卖点</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {POINT_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => togglePoint(p)}
                className={`rounded-full px-3 py-1 text-xs transition-all touch-feedback ${
                  points.includes(p)
                    ? "bg-primary text-black"
                    : "border border-border text-muted hover:border-primary/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {points.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {points.map((p) => (
                <span
                  key={p}
                  onClick={() => togglePoint(p)}
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary"
                >
                  {p} ×
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={customPoint}
              onChange={(e) => setCustomPoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomPoint()}
              placeholder="输入自定义卖点"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            <button
              onClick={addCustomPoint}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary touch-feedback"
            >
              + 添加
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-pink-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-pink-600 disabled:opacity-60 touch-feedback"
        >
          {loading ? "🎨 生成中..." : "📸 AI 生成拍摄方案"}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-xl bg-card p-4">
            <p className="mb-2 text-sm font-semibold">拍摄方案</p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
