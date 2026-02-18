"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";

// 公告/运营技巧列表（模拟上下滑动）
const announcements = [
  { icon: "📌", text: "标题前5个字最重要" },
  { icon: "🐟", text: "下午4-6点发布曝光高" },
  { icon: "📸", text: "主图用白底背景点击率更高" },
  { icon: "🔄", text: "每3天刷新商品保持排名" },
  { icon: "💬", text: "15分钟内回复买家提升成交率" },
  { icon: "🏷️", text: "价格尾数定9比整数成交率高" },
  { icon: "⭐", text: "好评数量直接影响搜索排名" },
];

// 核心工具（2×2 深色渐变大卡片）
const coreTools = [
  {
    href: "/copywriting",
    icon: "✍️",
    label: "文案生成",
    desc: "AI 智能生成标题描述",
    gradient: "from-[#3d2b1f] to-[#5c3a20]",
    disabled: false,
  },
  {
    href: "/qa-assistant",
    icon: "🤖",
    label: "答疑 AI",
    desc: "闲鱼运营问题随时问",
    gradient: "from-[#1a1a3e] to-[#2d2060]",
    disabled: true,
  },
  {
    href: "/smart-reply",
    icon: "💬",
    label: "话术助手",
    desc: "AI 模拟卖家回复",
    gradient: "from-[#1a3028] to-[#0f4a35]",
    disabled: true,
  },
  {
    href: "/boom",
    icon: "🚀",
    label: "爆款打造",
    desc: "数据驱动商品运营",
    gradient: "from-[#3a1a1a] to-[#5c2020]",
    disabled: true,
  },
];

// 发现更多（底部小图标）
const discoverTools = [
  { href: "/forbidden-words", icon: "🚫", label: "违禁词" },
  { href: "/calculator",      icon: "💰", label: "利润算" },
  { href: "/image-tools",     icon: "🖼️", label: "图片" },
  { href: "/tools",           icon: "🤖", label: "更多" },
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

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-4 pt-5 pb-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-sm text-muted">
          Hey {phone ? `${phone.slice(0, 3)}****${phone.slice(7)}` : "👋"}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold">闲鱼运营助手</h1>
        <p className="mt-0.5 text-xs text-muted">让闲鱼运营更简单</p>
      </div>

      {/* 公告区 — 上下滑动列表 */}
      <div className="mb-5 rounded-xl bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-black">
            公告
          </span>
          <span className="text-xs text-muted">上下滑动</span>
        </div>
        <div className="max-h-24 overflow-y-auto scrollbar-hide divide-y divide-border">
          {announcements.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span>{a.icon}</span>
                <span>{a.text}</span>
              </div>
              <span className="text-[10px] text-muted flex-shrink-0 ml-2">
                {i === 0 ? "今天" : `${i * 2}小时前`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心工具 2×2 */}
      <div className="mb-5">
        <p className="mb-3 text-sm font-semibold">核心工具</p>
        <div className="grid grid-cols-2 gap-3">
          {coreTools.map((tool) => {
            const card = (
              <div
                className={`relative h-28 rounded-2xl bg-gradient-to-br ${tool.gradient} p-4 ${
                  tool.disabled ? "opacity-70" : "active:scale-95 transition-transform"
                }`}
              >
                {tool.disabled && (
                  <span className="absolute right-3 top-3 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-white/60">
                    即将上线
                  </span>
                )}
                <span className="text-2xl">{tool.icon}</span>
                <p className="mt-2 text-sm font-semibold text-white">{tool.label}</p>
                <p className="mt-0.5 text-xs text-white/60">{tool.desc}</p>
              </div>
            );

            return tool.disabled ? (
              <div key={tool.href}>{card}</div>
            ) : (
              <Link key={tool.href} href={tool.href}>{card}</Link>
            );
          })}
        </div>
      </div>

      {/* 发现更多 */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold">发现更多</p>
        <div className="flex justify-around">
          {discoverTools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-center gap-1.5 touch-feedback"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-2xl border border-border">
                {t.icon}
              </div>
              <span className="text-xs text-muted">{t.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 text-center">
        <p className="text-xs text-muted/40">张老板团队 · 闲鱼实战派</p>
      </div>
    </div>
  );
}
