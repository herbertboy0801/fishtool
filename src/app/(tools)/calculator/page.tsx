"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { addToCollection, store } from "@/lib/store";

interface CalcResult {
  profit: number;
  profitRate: number;
  platformFee: number;
  totalCost: number;
  suggestedPrice?: number;
  totalProfit?: number;
}

interface HistoryItem {
  id?: string;
  createdAt?: number;
  mode: string;
  price: number;
  cost: number;
  profit: number;
  profitRate: number;
}

const defaultFeeRate = 1;

export default function CalculatorPage() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [shipping, setShipping] = useState("");
  const [packing, setPacking] = useState("");
  const [feeRate, setFeeRate] = useState(String(defaultFeeRate));
  const [quantity, setQuantity] = useState("");
  const [targetProfit, setTargetProfit] = useState("");

  const [result, setResult] = useState<CalcResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    store.get<HistoryItem[]>("calc_history", [])
  );

  const handleCalculate = useCallback(() => {
    const costVal = parseFloat(cost);
    const shippingVal = parseFloat(shipping) || 0;
    const packingVal = parseFloat(packing) || 0;
    const feeRateVal = parseFloat(feeRate) || defaultFeeRate;
    const quantityVal = parseInt(quantity) || 1;

    if (mode === "forward") {
      const priceVal = parseFloat(price);
      if (!priceVal || !costVal) {
        showToast("请输入售价和成本价", "warning");
        return;
      }
      const platformFee = priceVal * (feeRateVal / 100);
      const totalCost = costVal + shippingVal + packingVal + platformFee;
      const profit = priceVal - totalCost;
      const profitRate = (profit / priceVal) * 100;

      const calcResult: CalcResult = {
        profit,
        profitRate,
        platformFee,
        totalCost,
        totalProfit: quantityVal > 1 ? profit * quantityVal : undefined,
      };
      setResult(calcResult);

      addToCollection<HistoryItem>(
        "calc_history",
        { mode: "forward", price: priceVal, cost: costVal, profit, profitRate },
        30
      );
      setHistory(store.get<HistoryItem[]>("calc_history", []));
    } else {
      const targetVal = parseFloat(targetProfit);
      if (!targetVal || !costVal) {
        showToast("请输入成本价和期望利润", "warning");
        return;
      }
      const suggestedPrice =
        (costVal + shippingVal + packingVal + targetVal) / (1 - feeRateVal / 100);
      const platformFee = suggestedPrice * (feeRateVal / 100);
      const totalCost = costVal + shippingVal + packingVal + platformFee;
      const profitRate = (targetVal / suggestedPrice) * 100;

      const calcResult: CalcResult = {
        profit: targetVal,
        profitRate,
        platformFee,
        totalCost,
        suggestedPrice,
        totalProfit: quantityVal > 1 ? targetVal * quantityVal : undefined,
      };
      setResult(calcResult);

      addToCollection<HistoryItem>(
        "calc_history",
        { mode: "reverse", price: suggestedPrice, cost: costVal, profit: targetVal, profitRate },
        30
      );
      setHistory(store.get<HistoryItem[]>("calc_history", []));
    }
  }, [mode, price, cost, shipping, packing, feeRate, quantity, targetProfit]);

  const handleClear = useCallback(() => {
    setPrice("");
    setCost("");
    setShipping("");
    setPacking("");
    setFeeRate(String(defaultFeeRate));
    setQuantity("");
    setTargetProfit("");
    setResult(null);
  }, []);

  return (
    <div>
      <PageHeader title="利润计算器" subtitle="快速计算商品利润，精准定价" />

      <div className="space-y-4 px-4 py-4 pb-8">
        {/* Mode Tabs */}
        <div className="flex rounded-xl bg-card p-1">
          {(["forward", "reverse"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all touch-feedback ${
                mode === m
                  ? "bg-primary text-black shadow-sm"
                  : "text-muted"
              }`}
            >
              {m === "forward" ? "📊 正向计算" : "🎯 反向计算"}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="rounded-xl bg-card p-4 space-y-3">
          {mode === "forward" && (
            <GridField
              label="售价 (元)"
              value={price}
              onChange={setPrice}
              placeholder="0.00"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <GridField
              label="成本价 (元)"
              value={cost}
              onChange={setCost}
              placeholder="0.00"
            />
            <GridField
              label="邮费 (元)"
              value={shipping}
              onChange={setShipping}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GridField
              label="包装费 (元)"
              value={packing}
              onChange={setPacking}
              placeholder="0"
            />
            <GridField
              label="平台费率 (%)"
              value={feeRate}
              onChange={setFeeRate}
              placeholder="1"
            />
          </div>

          {mode === "reverse" && (
            <GridField
              label="期望利润 (元)"
              value={targetProfit}
              onChange={setTargetProfit}
              placeholder="输入期望单件利润"
            />
          )}

          <GridField
            label="单量 (选填)"
            value={quantity}
            onChange={setQuantity}
            placeholder="填写后计算总利润"
          />

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCalculate}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
            >
              🔥 {mode === "forward" ? "计算利润" : "计算售价"}
            </button>
            <button
              onClick={handleClear}
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition-colors hover:bg-card-hover touch-feedback"
            >
              清空
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">计算结果</h3>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-xs text-muted">
                  {mode === "forward" ? "单件利润" : "建议售价"}
                </p>
                <p className={`mt-1 text-2xl font-bold ${result.profit >= 0 ? "text-success" : "text-danger"}`}>
                  ¥{mode === "forward" ? result.profit.toFixed(2) : result.suggestedPrice?.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-xs text-muted">利润率</p>
                <p className={`mt-1 text-2xl font-bold ${result.profitRate >= 0 ? "text-success" : "text-danger"}`}>
                  {result.profitRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>成本价</span>
                <span className="text-foreground">¥{parseFloat(cost || "0").toFixed(2)}</span>
              </div>
              {parseFloat(shipping || "0") > 0 && (
                <div className="flex justify-between text-muted">
                  <span>邮费</span>
                  <span className="text-foreground">¥{parseFloat(shipping).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(packing || "0") > 0 && (
                <div className="flex justify-between text-muted">
                  <span>包装费</span>
                  <span className="text-foreground">¥{parseFloat(packing).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>平台费</span>
                <span className="text-foreground">¥{result.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <span>总成本</span>
                <span>¥{result.totalCost.toFixed(2)}</span>
              </div>
              {result.totalProfit !== undefined && (
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>总利润（{quantity}件）</span>
                  <span className={result.totalProfit >= 0 ? "text-success" : "text-danger"}>
                    ¥{result.totalProfit.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        <div className="rounded-xl bg-card p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <span>📋</span> 历史记录
          </h3>
          {history.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">暂无计算记录</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((h, i) => (
                <div key={h.id ?? i} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-xs">
                  <div className="text-muted">
                    <span className="mr-2">{h.mode === "forward" ? "正向" : "反向"}</span>
                    <span>售价 ¥{h.price.toFixed(0)}</span>
                    <span className="mx-1">·</span>
                    <span>成本 ¥{h.cost.toFixed(0)}</span>
                  </div>
                  <span className={`font-medium ${h.profit >= 0 ? "text-success" : "text-danger"}`}>
                    {h.profit >= 0 ? "+" : ""}¥{h.profit.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="rounded-xl bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <span>💡</span> 使用提示
          </p>
          <ul className="space-y-1.5 text-xs text-muted">
            <li className="flex gap-2">
              <span className="text-primary shrink-0">·</span>
              <span>正向计算：已知成本和售价，计算能赚多少</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">·</span>
              <span>反向计算：想赚特定金额，计算应该定价多少</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary shrink-0">·</span>
              <span>闲鱼平台费率默认 1%，可根据实际调整</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function GridField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-muted">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
      />
    </div>
  );
}
