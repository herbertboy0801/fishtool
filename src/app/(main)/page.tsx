"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";

// 每日运营小技巧（按日期轮播）
const tips = [
  { icon: "📌", title: "标题前5字最重要", desc: "把核心卖点放在最前面" },
  { icon: "⏰", title: "下午3-6点是黄金发布期", desc: "用户活跃度最高，曝光更多" },
  { icon: "📸", title: "主图用白底纯净背景", desc: "点击率提升30%以上" },
  { icon: "💬", title: "15分钟内回复买家", desc: "提升成交率和好评率" },
  { icon: "🏷️", title: "价格定尾数9或8", desc: "心理定价策略，更易成交" },
  { icon: "🔄", title: "每3天刷新一次商品", desc: "保持搜索排名和曝光量" },
  { icon: "🚫", title: "发布前必检违禁词", desc: "避免被限流或下架风险" },
  { icon: "📦", title: "描述中写清楚品牌和规格", desc: "减少买家询问，提高效率" },
  { icon: "⭐", title: "积累好评是核心资产", desc: "好评越多，排名越靠前" },
  { icon: "🎁", title: "捆绑赠品提升竞争力", desc: "同类商品中更容易被选中" },
];

interface QuickTool {
  href: string;
  icon: string;
  label: string;
  desc: string;
  bg: string;
  iconBg: string;
  disabled?: boolean;
}

// 首页常用工具（2×2 大卡片）
const quickTools: QuickTool[] = [
  {
    href: "/forbidden-words",
    icon: "🚫",
    label: "违禁词检测",
    desc: "规避限流风险",
    bg: "bg-red-500/20",
    iconBg: "bg-red-500",
  },
  {
    href: "/copywriting",
    icon: "✍️",
    label: "AI文案生成",
    desc: "AI智能优化",
    bg: "bg-orange-500/20",
    iconBg: "bg-orange-500",
  },
  {
    href: "/calculator",
    icon: "💰",
    label: "利润计算",
    desc: "精准核算利润",
    bg: "bg-green-500/20",
    iconBg: "bg-green-500",
  },
  {
    href: "/image-tools",
    icon: "🖼️",
    label: "图片工具箱",
    desc: "压缩裁剪增强",
    bg: "bg-blue-500/20",
    iconBg: "bg-blue-500",
  },
];

export default function HomePage() {
  const { phone } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }, []);

  // 今日展示的技巧（按日期轮转）
  const todayTips = useMemo(() => {
    const day = new Date().getDate();
    const startIdx = day % tips.length;
    return [...tips.slice(startIdx), ...tips.slice(0, startIdx)].slice(0, 5);
  }, []);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-sm text-muted">
          {greeting}
          {phone && `，${phone.slice(0, 3)}****${phone.slice(7)}`}
        </p>
        <h1 className="mt-0.5 text-xl font-bold">闲鱼运营助手</h1>
        <p className="mt-0.5 text-xs text-muted">让运营更简单高效</p>
      </div>

      {/* 运营小技巧（横向滚动） */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted flex items-center gap-1">
            💡 运营小技巧
          </h2>
          <span className="text-xs text-muted rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            每日更新
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {todayTips.map((tip, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-44 rounded-xl bg-card p-3 border border-border"
            >
              <span className="text-xl">{tip.icon}</span>
              <p className="mt-1.5 text-xs font-semibold leading-tight">{tip.title}</p>
              <p className="mt-1 text-xs text-muted leading-tight">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 常用工具（2×2 大卡片） */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted flex items-center gap-1">
            🔥 常用工具
          </h2>
          <Link href="/tools" className="text-xs text-primary">
            全部工具 ›
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickTools.map((tool) => {
            const inner = (
              <div
                className={`relative rounded-2xl p-4 ${tool.bg} ${
                  tool.disabled ? "opacity-60" : "active:scale-95 transition-transform"
                }`}
              >
                {tool.disabled && (
                  <span className="absolute right-3 top-3 rounded-full bg-border px-1.5 py-0.5 text-[9px] text-muted">
                    即将上线
                  </span>
                )}
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${tool.iconBg} text-white text-xl shadow-lg`}
                >
                  {tool.icon}
                </div>
                <p className="text-sm font-semibold">{tool.label}</p>
                <p className="mt-0.5 text-xs text-muted">{tool.desc}</p>
              </div>
            );

            return tool.disabled ? (
              <div key={tool.href}>{inner}</div>
            ) : (
              <Link key={tool.href} href={tool.href}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 新手提示 */}
      <div className="rounded-xl bg-card p-4 border border-border">
        <p className="mb-3 text-xs font-semibold text-muted flex items-center gap-1">
          💡 新手提示
        </p>
        <p className="text-xs text-muted leading-relaxed">
          建议先使用「<span className="text-foreground font-medium">违禁词检测</span>」检查文案安全性，
          再用「<span className="text-foreground font-medium">AI文案生成</span>」优化商品描述，
          最后用「<span className="text-foreground font-medium">利润计算</span>」精准定价。
        </p>
      </div>
    </div>
  );
}
