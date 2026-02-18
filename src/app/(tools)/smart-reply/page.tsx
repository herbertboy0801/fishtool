"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { streamGenerate, useQuota } from "@/lib/quota-store";
import { store } from "@/lib/store";

interface Product {
  id: string;
  name: string;
  desc: string;
}

const SCENARIOS = [
  { key: "砍价应对", icon: "💸" },
  { key: "质量疑虑", icon: "🔍" },
  { key: "物流咨询", icon: "🚚" },
  { key: "竞品比较", icon: "⚖️" },
  { key: "售后问题", icon: "🛠️" },
  { key: "促成交易", icon: "🤝" },
];

export default function SmartReplyPage() {
  const [tab, setTab] = useState<"chat" | "config">("chat");
  const [products, setProducts] = useState<Product[]>(() =>
    store.get<Product[]>("smart_products", [])
  );
  const [selectedId, setSelectedId] = useState<string>("");
  const [scenario, setScenario] = useState("砍价应对");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // New product form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { recordUsage } = useQuota();

  const selectedProduct = products.find((p) => p.id === selectedId);

  const handleAddProduct = () => {
    if (!newName.trim()) {
      showToast("请输入商品名称", "warning");
      return;
    }
    const p: Product = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      desc: newDesc.trim(),
    };
    const updated = [p, ...products];
    store.set("smart_products", updated);
    setProducts(updated);
    setSelectedId(p.id);
    setNewName("");
    setNewDesc("");
    setShowAdd(false);
    showToast("商品档案已添加", "success");
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedProduct) {
      showToast("请先选择或创建商品档案", "warning");
      return;
    }
    if (!message.trim()) {
      showToast("请输入买家的消息", "warning");
      return;
    }

    setResult("");
    setLoading(true);

    try {
      const productInfo = `${selectedProduct.name}${selectedProduct.desc ? " — " + selectedProduct.desc : ""}`;
      const gen = streamGenerate("smart-reply", {
        product: productInfo,
        scenario,
        message,
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
  }, [selectedProduct, scenario, message, recordUsage]);

  return (
    <div>
      <PageHeader title="智能话术助手" subtitle="AI帮你回复买家咨询" />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Product selector */}
        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">选择商品档案</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-white text-xl touch-feedback"
          >
            +
          </button>
        </div>

        {/* Add product modal */}
        {showAdd && (
          <div className="rounded-xl bg-card p-4 border border-cyan-500/30 space-y-3">
            <p className="text-sm font-semibold">新建商品档案</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="商品名称"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="商品描述（选填）：品牌、规格、成色等"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={handleAddProduct} className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-white touch-feedback">
                保存
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted touch-feedback">
                取消
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl bg-card p-1">
          {(["chat", "config"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all touch-feedback ${
                tab === t ? "bg-cyan-500 text-white" : "text-muted"
              }`}
            >
              {t === "chat" ? "💬 对话" : "⚙️ 配置"}
            </button>
          ))}
        </div>

        {tab === "chat" && (
          <>
            {/* Scenario chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScenario(s.key)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all touch-feedback ${
                    scenario === s.key
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                      : "border border-border text-muted"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.key}</span>
                </button>
              ))}
            </div>

            {!selectedProduct ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="text-4xl">💬</span>
                <p className="mt-3 text-sm font-medium">请先选择或创建一个商品档案</p>
                <p className="mt-1 text-xs text-muted">选择商品后，粘贴买家消息即可生成回复</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-card p-4 space-y-3">
                  <label className="block text-sm font-medium">输入买家的消息</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="输入买家的消息..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-60 touch-feedback"
                  >
                    {loading ? "生成中..." : "🔥 生成回复"}
                  </button>
                </div>

                {result && (
                  <div className="rounded-xl bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">推荐回复</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(result); showToast("已复制", "success"); }}
                        className="text-xs text-muted hover:text-primary touch-feedback"
                      >
                        复制
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed">{result}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "config" && (
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm font-semibold mb-3">商品档案列表</p>
            {products.length === 0 ? (
              <p className="text-center text-sm text-muted py-4">暂无商品档案</p>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      {p.desc && <p className="text-xs text-muted truncate">{p.desc}</p>}
                    </div>
                    <button
                      onClick={() => {
                        const updated = products.filter((x) => x.id !== p.id);
                        store.set("smart_products", updated);
                        setProducts(updated);
                        if (selectedId === p.id) setSelectedId("");
                      }}
                      className="text-xs text-danger touch-feedback"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
