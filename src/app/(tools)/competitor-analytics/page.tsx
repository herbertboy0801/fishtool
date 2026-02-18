"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { addToCollection, removeFromCollection, store } from "@/lib/store";

interface Seller {
  id?: string;
  createdAt?: number;
  name: string;
  link: string;
  note: string;
  tags: string[];
}

interface TrackedProduct {
  id?: string;
  createdAt?: number;
  name: string;
  price: string;
  seller: string;
  note: string;
}

export default function CompetitorAnalyticsPage() {
  const [tab, setTab] = useState<"sellers" | "products">("sellers");

  const [sellers, setSellers] = useState<Seller[]>(() =>
    store.get<Seller[]>("ca_sellers", [])
  );
  const [products, setProducts] = useState<TrackedProduct[]>(() =>
    store.get<TrackedProduct[]>("ca_products", [])
  );

  // Seller form
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [sellerLink, setSellerLink] = useState("");
  const [sellerNote, setSellerNote] = useState("");
  const [sellerTagInput, setSellerTagInput] = useState("");
  const [sellerTags, setSellerTags] = useState<string[]>([]);

  // Product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productSeller, setProductSeller] = useState("");
  const [productNote, setProductNote] = useState("");

  const addSellerTag = () => {
    const t = sellerTagInput.trim();
    if (t && !sellerTags.includes(t)) setSellerTags([...sellerTags, t]);
    setSellerTagInput("");
  };

  const handleAddSeller = () => {
    if (!sellerName.trim()) { showToast("请输入卖家名称", "warning"); return; }
    addToCollection<Seller>("ca_sellers", {
      name: sellerName.trim(),
      link: sellerLink.trim(),
      note: sellerNote.trim(),
      tags: sellerTags,
    }, 100);
    setSellers(store.get<Seller[]>("ca_sellers", []));
    setSellerName(""); setSellerLink(""); setSellerNote(""); setSellerTags([]);
    setShowAddSeller(false);
    showToast("卖家已添加", "success");
  };

  const handleAddProduct = () => {
    if (!productName.trim()) { showToast("请输入商品名称", "warning"); return; }
    addToCollection<TrackedProduct>("ca_products", {
      name: productName.trim(),
      price: productPrice.trim(),
      seller: productSeller.trim(),
      note: productNote.trim(),
    }, 200);
    setProducts(store.get<TrackedProduct[]>("ca_products", []));
    setProductName(""); setProductPrice(""); setProductSeller(""); setProductNote("");
    setShowAddProduct(false);
    showToast("商品已添加追踪", "success");
  };

  const deleteSeller = (id: string) => {
    removeFromCollection<Seller>("ca_sellers", id);
    setSellers(store.get<Seller[]>("ca_sellers", []));
  };

  const deleteProduct = (id: string) => {
    removeFromCollection<TrackedProduct>("ca_products", id);
    setProducts(store.get<TrackedProduct[]>("ca_products", []));
  };

  const TAG_PRESETS = ["主要竞品", "价格标杆", "爆款卖家", "同类目", "学习对象"];

  return (
    <div>
      <PageHeader
        title="同行监控"
        subtitle={`追踪 ${sellers.length} 位卖家 · ${products.length} 个商品`}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Tabs */}
        <div className="flex rounded-xl bg-card p-1">
          {(["sellers", "products"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all touch-feedback ${
                tab === t ? "bg-teal-500 text-white" : "text-muted"
              }`}
            >
              {t === "sellers" ? "👀 卖家监控" : "📦 商品追踪"}
            </button>
          ))}
        </div>

        {/* Sellers tab */}
        {tab === "sellers" && (
          <>
            {sellers.length === 0 && !showAddSeller ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="text-5xl">👀</span>
                <p className="mt-3 text-sm font-medium">还没有追踪任何卖家</p>
                <p className="mt-1 text-xs text-muted">添加同行卖家，随时关注他们的动态</p>
                <button
                  onClick={() => setShowAddSeller(true)}
                  className="mt-4 rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white touch-feedback"
                >
                  + 添加卖家
                </button>
              </div>
            ) : (
              <>
                {!showAddSeller && (
                  <div className="space-y-3">
                    {sellers.map((s) => (
                      <div key={s.id} className="rounded-xl bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{s.name}</p>
                            {s.link && (
                              <p className="mt-0.5 text-xs text-teal-400 truncate">{s.link}</p>
                            )}
                            {s.note && (
                              <p className="mt-1 text-xs text-muted">{s.note}</p>
                            )}
                            {s.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {s.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] text-teal-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteSeller(s.id!)}
                            className="shrink-0 text-xs text-danger touch-feedback"
                          >
                            删除
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-muted/50">
                          添加于 {new Date(s.createdAt ?? 0).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddSeller(true)}
                      className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted hover:border-teal-500 hover:text-teal-400 touch-feedback"
                    >
                      + 添加卖家
                    </button>
                  </div>
                )}

                {showAddSeller && (
                  <div className="rounded-xl bg-card p-4 space-y-3 border border-teal-500/30">
                    <p className="text-sm font-semibold">添加竞品卖家</p>
                    <input
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="卖家昵称 *"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <input
                      value={sellerLink}
                      onChange={(e) => setSellerLink(e.target.value)}
                      placeholder="闲鱼主页链接（选填）"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <textarea
                      value={sellerNote}
                      onChange={(e) => setSellerNote(e.target.value)}
                      placeholder="备注（选填）：如主要品类、定价策略等"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <div>
                      <p className="mb-1.5 text-xs text-muted">标签</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {TAG_PRESETS.map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              if (!sellerTags.includes(t)) setSellerTags([...sellerTags, t]);
                            }}
                            className={`rounded-full px-2.5 py-1 text-xs touch-feedback ${
                              sellerTags.includes(t)
                                ? "bg-teal-500/20 border border-teal-500/50 text-teal-400"
                                : "border border-border text-muted"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={sellerTagInput}
                          onChange={(e) => setSellerTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSellerTag()}
                          placeholder="自定义标签"
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs placeholder:text-muted/50 focus:border-primary focus:outline-none"
                        />
                        <button onClick={addSellerTag} className="rounded-lg border border-border px-3 py-2 text-xs text-muted touch-feedback">
                          + 添加
                        </button>
                      </div>
                      {sellerTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sellerTags.map((t) => (
                            <span
                              key={t}
                              onClick={() => setSellerTags(sellerTags.filter((x) => x !== t))}
                              className="flex cursor-pointer items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"
                            >
                              {t} ×
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleAddSeller} className="flex-1 rounded-lg bg-teal-500 py-2.5 text-sm font-semibold text-white touch-feedback">
                        保存
                      </button>
                      <button onClick={() => setShowAddSeller(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted touch-feedback">
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Products tab */}
        {tab === "products" && (
          <>
            {products.length === 0 && !showAddProduct ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="text-5xl">📦</span>
                <p className="mt-3 text-sm font-medium">还没有追踪任何商品</p>
                <p className="mt-1 text-xs text-muted">追踪竞品商品，了解定价与策略</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="mt-4 rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white touch-feedback"
                >
                  + 添加商品
                </button>
              </div>
            ) : (
              <>
                {!showAddProduct && (
                  <div className="space-y-3">
                    {products.map((p) => (
                      <div key={p.id} className="rounded-xl bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{p.name}</p>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                              {p.price && <span>💰 {p.price}</span>}
                              {p.seller && <span>👤 {p.seller}</span>}
                            </div>
                            {p.note && (
                              <p className="mt-1 text-xs text-muted">{p.note}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteProduct(p.id!)}
                            className="shrink-0 text-xs text-danger touch-feedback"
                          >
                            删除
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-muted/50">
                          添加于 {new Date(p.createdAt ?? 0).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted hover:border-teal-500 hover:text-teal-400 touch-feedback"
                    >
                      + 追踪商品
                    </button>
                  </div>
                )}

                {showAddProduct && (
                  <div className="rounded-xl bg-card p-4 space-y-3 border border-teal-500/30">
                    <p className="text-sm font-semibold">追踪竞品商品</p>
                    <input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="商品名称 *"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <input
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="当前售价（如 ¥299）"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <input
                      value={productSeller}
                      onChange={(e) => setProductSeller(e.target.value)}
                      placeholder="所属卖家（选填）"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <textarea
                      value={productNote}
                      onChange={(e) => setProductNote(e.target.value)}
                      placeholder="备注：浏览量、收藏数、竞争优势等"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleAddProduct} className="flex-1 rounded-lg bg-teal-500 py-2.5 text-sm font-semibold text-white touch-feedback">
                        保存
                      </button>
                      <button onClick={() => setShowAddProduct(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted touch-feedback">
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
