"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TabBar } from "@/components/layout/tab-bar";
import { showToast } from "@/components/ui/toast";
import { addToCollection } from "@/lib/store";

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
  mode: string;
  price: number;
  cost: number;
  profit: number;
  profitRate: number;
  createdAt?: number;
}

const defaultFeeRate = 1;

const templates = [
  { name: "数码产品", cost: 200, shipping: 10, packing: 5, feeRate: 1 },
  { name: "服装配饰", cost: 50, shipping: 8, packing: 3, feeRate: 1 },
  { name: "书籍文具", cost: 15, shipping: 5, packing: 2, feeRate: 1 },
  { name: "家居用品", cost: 80, shipping: 12, packing: 5, feeRate: 1 },
];

export default function CalculatorPage() {
  const [mode, setMode] = useState("forward");

  // Forward mode fields
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [shipping, setShipping] = useState("");
  const [packing, setPacking] = useState("");
  const [feeRate, setFeeRate] = useState(String(defaultFeeRate));
  const [quantity, setQuantity] = useState("");

  // Reverse mode fields
  const [targetProfit, setTargetProfit] = useState("");

  const [result, setResult] = useState<CalcResult | null>(null);

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

      addToCollection<HistoryItem>("calc_history", {
        mode: "forward",
        price: priceVal,
        cost: costVal,
        profit,
        profitRate,
      }, 50);
    } else {
      const targetVal = parseFloat(targetProfit);
      if (!targetVal || !costVal) {
        showToast("请输入成本价和期望利润", "warning");
        return;
      }
      const suggestedPrice =
        (costVal + shippingVal + packingVal + targetVal) /
        (1 - feeRateVal / 100);
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

      addToCollection<HistoryItem>("calc_history", {
        mode: "reverse",
        price: suggestedPrice,
        cost: costVal,
        profit: targetVal,
        profitRate,
      }, 50);
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

  const applyTemplate = useCallback(
    (tpl: (typeof templates)[number]) => {
      setCost(String(tpl.cost));
      setShipping(String(tpl.shipping));
      setPacking(String(tpl.packing));
      setFeeRate(String(tpl.feeRate));
      showToast(`已应用「${tpl.name}」模板`, "info");
    },
    []
  );

  return (
    <div>
      <PageHeader title="利润计算器" subtitle="快速核算单品利润和利润率" />

      <div className="space-y-4 px-4 py-4">
        {/* Mode Switch */}
        <TabBar
          tabs={[
            { key: "forward", label: "正向计算" },
            { key: "reverse", label: "反向计算" },
          ]}
          activeTab={mode}
          onTabChange={(key) => {
            setMode(key);
            setResult(null);
          }}
        />

        {/* Quick Templates */}
        <div className="flex gap-2 overflow-x-auto">
          {templates.map((tpl) => (
            <button
              key={tpl.name}
              onClick={() => applyTemplate(tpl)}
              className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary hover:text-primary touch-feedback"
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="rounded-xl bg-card p-4">
          <div className="space-y-3">
            {mode === "forward" && (
              <InputField
                label="售价（元）"
                value={price}
                onChange={setPrice}
                placeholder="输入商品售价"
              />
            )}

            <InputField
              label="成本价（元）"
              value={cost}
              onChange={setCost}
              placeholder="输入商品成本"
            />
            <InputField
              label="邮费（元）"
              value={shipping}
              onChange={setShipping}
              placeholder="0"
              optional
            />
            <InputField
              label="包装费（元）"
              value={packing}
              onChange={setPacking}
              placeholder="0"
              optional
            />
            <InputField
              label="平台费率（%）"
              value={feeRate}
              onChange={setFeeRate}
              placeholder="1"
            />

            {mode === "reverse" && (
              <InputField
                label="期望利润（元）"
                value={targetProfit}
                onChange={setTargetProfit}
                placeholder="输入期望单件利润"
              />
            )}

            <InputField
              label="单量"
              value={quantity}
              onChange={setQuantity}
              placeholder="1"
              optional
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCalculate}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
            >
              {mode === "forward" ? "💰 计算利润" : "💰 计算售价"}
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
          <div className="rounded-xl bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">计算结果</h3>

            <div className="mb-4 flex gap-4 text-center">
              <div className="flex-1 rounded-lg bg-background p-3">
                <p className="text-xs text-muted">
                  {mode === "forward" ? "单件利润" : "建议售价"}
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${result.profit >= 0 ? "text-success" : "text-danger"}`}
                >
                  ¥
                  {mode === "forward"
                    ? result.profit.toFixed(2)
                    : result.suggestedPrice?.toFixed(2)}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-background p-3">
                <p className="text-xs text-muted">利润率</p>
                <p
                  className={`mt-1 text-2xl font-bold ${result.profitRate >= 0 ? "text-success" : "text-danger"}`}
                >
                  {result.profitRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">成本价</span>
                <span>¥{parseFloat(cost || "0").toFixed(2)}</span>
              </div>
              {parseFloat(shipping || "0") > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">邮费</span>
                  <span>¥{parseFloat(shipping).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(packing || "0") > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">包装费</span>
                  <span>¥{parseFloat(packing).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">平台费</span>
                <span>¥{result.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <span>总成本</span>
                <span>¥{result.totalCost.toFixed(2)}</span>
              </div>
              {mode === "forward" && (
                <div className="flex justify-between font-medium">
                  <span>单件利润</span>
                  <span className={result.profit >= 0 ? "text-success" : "text-danger"}>
                    ¥{result.profit.toFixed(2)}
                  </span>
                </div>
              )}
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
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-24 shrink-0 text-sm text-muted">
        {label}
        {optional && <span className="text-xs text-muted/50"> 选填</span>}
      </label>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
      />
    </div>
  );
}
