"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { store, addToCollection, removeFromCollection } from "@/lib/store";

interface Product {
  id?: string;
  createdAt?: number;
  name: string;
  price: number;
  status: "active" | "paused";
  views: number;
  likes: number;
}

type SortKey = "createdAt" | "views" | "likes" | "price";

export default function BoomPage() {
  const [tab, setTab] = useState<"overview" | "products" | "log" | "ai">("products");
  const [products, setProducts] = useState<Product[]>(() =>
    store.get<Product[]>("boom_products", [])
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [showAdd, setShowAdd] = useState(false);
  const [storeName, setStoreName] = useState(() => store.get<string>("boom_store_name", "我的闲鱼店铺"));

  // Add product form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleAddProduct = () => {
    if (!newName.trim()) { showToast("请输入商品名称", "warning"); return; }
    addToCollection<Product>("boom_products", {
      name: newName.trim(),
      price: parseFloat(newPrice) || 0,
      status: "active",
      views: 0,
      likes: 0,
    }, 200);
    const updated = store.get<Product[]>("boom_products", []);
    setProducts(updated);
    setNewName(""); setNewPrice("");
    setShowAdd(false);
    showToast("商品已添加", "success");
  };

  const toggleStatus = (id: string) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, status: p.status === "active" ? "paused" : "active" } : p
    ) as Product[];
    store.set("boom_products", updated);
    setProducts(updated);
  };

  const deleteProduct = (id: string) => {
    removeFromCollection<Product>("boom_products", id);
    setProducts(store.get<Product[]>("boom_products", []));
  };

  const filtered = products
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter((p) => !search || p.name.includes(search))
    .sort((a, b) => {
      if (sort === "createdAt") return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      return (b[sort] as number) - (a[sort] as number);
    });

  const activeCount = products.filter((p) => p.status === "active").length;
  const pausedCount = products.filter((p) => p.status === "paused").length;

  const TABS = [
    { key: "overview", label: "总览" },
    { key: "products", label: "商品" },
    { key: "log", label: "日志" },
    { key: "ai", label: "AI" },
  ] as const;

  return (
    <div>
      <PageHeader
        title={storeName}
        subtitle={`共 ${products.length} 个商品 · 活跃 ${activeCount} · 暂停 ${pausedCount}`}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all touch-feedback ${
                tab === t.key ? "bg-primary text-black" : "text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 搜索商品名称"
                className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex gap-2 text-xs">
              {(["all", "active", "paused"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 transition-all touch-feedback ${
                    statusFilter === s ? "bg-primary text-black" : "border border-border text-muted"
                  }`}
                >
                  {s === "all" ? "全部" : s === "active" ? "活跃" : "暂停"}
                </button>
              ))}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="ml-auto rounded-full border border-border bg-card px-3 py-1 text-xs text-muted focus:outline-none"
              >
                <option value="createdAt">添加时间</option>
                <option value="views">浏览量</option>
                <option value="likes">收藏量</option>
                <option value="price">价格</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="text-5xl">📦</span>
                <p className="mt-3 text-sm font-medium">还没有商品</p>
                <p className="mt-1 text-xs text-muted">点击下方按钮添加商品开始追踪</p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black touch-feedback"
                >
                  + 添加商品
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {filtered.map((p) => (
                    <div key={p.id} className="rounded-xl bg-card p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted mt-0.5">
                            ¥{p.price.toFixed(2)} · 浏览 {p.views} · 收藏 {p.likes}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                            p.status === "active"
                              ? "bg-success/20 text-success"
                              : "bg-muted/20 text-muted"
                          }`}>
                            {p.status === "active" ? "活跃" : "暂停"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => toggleStatus(p.id!)}
                          className="flex-1 rounded-lg border border-border py-1.5 text-xs text-muted hover:bg-card-hover touch-feedback"
                        >
                          {p.status === "active" ? "暂停" : "恢复"}
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id!)}
                          className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger touch-feedback"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted hover:border-primary hover:text-primary touch-feedback"
                >
                  + 添加商品
                </button>
              </>
            )}
          </>
        )}

        {tab === "overview" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "总商品", value: products.length, color: "text-foreground" },
                { label: "活跃中", value: activeCount, color: "text-success" },
                { label: "已暂停", value: pausedCount, color: "text-muted" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-card p-3 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-card p-4">
              <p className="text-sm font-semibold mb-2">店铺名称</p>
              <input
                value={storeName}
                onChange={(e) => { setStoreName(e.target.value); store.set("boom_store_name", e.target.value); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {(tab === "log" || tab === "ai") && (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="text-4xl">🚧</span>
            <p className="mt-3 text-sm font-medium">{tab === "log" ? "运营日志" : "AI 分析"}功能开发中</p>
            <p className="mt-1 text-xs text-muted">即将上线，敬请期待</p>
          </div>
        )}
      </div>

      {/* Add product sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative w-full rounded-t-2xl bg-background p-6 space-y-4">
            <h3 className="text-base font-semibold">添加商品</h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="商品名称"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="价格 (元)"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleAddProduct}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-black touch-feedback"
            >
              确认添加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
