"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";

const announcements = [
  { icon: "📌", text: "标题前5个字最重要" },
  { icon: "🐟", text: "下午4-6点发布曝光高" },
  { icon: "📸", text: "主图用白底背景点击率更高" },
  { icon: "🔄", text: "每3天刷新商品保持排名" },
  { icon: "💬", text: "15分钟内回复买家提升成交率" },
  { icon: "🏷️", text: "价格尾数定9比整数成交率高" },
  { icon: "⭐", text: "好评数量直接影响搜索排名" },
];

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

const discoverTools = [
  {
    href: "/forbidden-words",
    icon: "🚫",
    label: "违禁词",
    bg: "bg-red-500/15",
    border: "border-red-500/25",
  },
  {
    href: "/calculator",
    icon: "💰",
    label: "利润算",
    bg: "bg-green-500/15",
    border: "border-green-500/25",
  },
  {
    href: "/image-tools",
    icon: "🖼️",
    label: "图片",
    bg: "bg-blue-500/15",
    border: "border-blue-500/25",
  },
  {
    href: "/tools",
    icon: "🔧",
    label: "更多",
    bg: "bg-purple-500/15",
    border: "border-purple-500/25",
  },
];

function SettingsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

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
      <div
        className="mb-5 flex items-start justify-between animate-in"
        style={{ animationDelay: "0ms" }}
      >
        <div>
          <p className="text-sm text-muted">
            {greeting}，{phone ? `${phone.slice(0, 3)}****${phone.slice(7)}` : "👋"}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold">闲鱼运营助手</h1>
          <p className="mt-0.5 text-xs text-muted">让闲鱼运营更简单</p>
        </div>
        <Link
          href="/settings"
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border text-muted hover:text-foreground hover:border-primary/40 transition-all touch-feedback"
        >
          <SettingsIcon />
        </Link>
      </div>

      {/* 公告区 */}
      <div
        className="mb-5 rounded-xl bg-card overflow-hidden animate-in"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-black">
            公告
          </span>
          <span className="text-xs text-muted">上下滑动</span>
        </div>
        <div className="max-h-24 overflow-y-auto scrollbar-hide divide-y divide-border">
          {announcements.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
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
      <div
        className="mb-5 animate-in"
        style={{ animationDelay: "160ms" }}
      >
        <p className="mb-3 text-sm font-semibold">核心工具</p>
        <div className="grid grid-cols-2 gap-3">
          {coreTools.map((tool) => {
            const card = (
              <div
                className={`relative h-[112px] rounded-2xl bg-gradient-to-br ${tool.gradient} p-4 overflow-hidden ${
                  tool.disabled
                    ? "opacity-60"
                    : "active:scale-[0.97] active:brightness-110 transition-all duration-150"
                }`}
              >
                {/* Top edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                {/* Shine sweep */}
                {!tool.disabled && (
                  <div className="card-shine absolute inset-0" />
                )}

                {tool.disabled && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/25 px-1.5 py-0.5 text-[9px] text-white/45 border border-white/10">
                    即将上线
                  </span>
                )}

                {/* Icon in frosted container */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 text-xl leading-none">
                  {tool.icon}
                </div>
                <p className="mt-2.5 text-[13px] font-semibold text-white leading-tight">
                  {tool.label}
                </p>
                <p className="mt-0.5 text-[11px] text-white/55 leading-tight">
                  {tool.desc}
                </p>
              </div>
            );

            return tool.disabled ? (
              <div key={tool.href}>{card}</div>
            ) : (
              <Link key={tool.href} href={tool.href}>
                {card}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 发现更多 */}
      <div
        className="mb-6 animate-in"
        style={{ animationDelay: "240ms" }}
      >
        <p className="mb-3 text-sm font-semibold">发现更多</p>
        <div className="flex justify-around">
          {discoverTools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-center gap-1.5 touch-feedback"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${t.bg} text-2xl border ${t.border}`}
              >
                {t.icon}
              </div>
              <span className="text-xs text-muted">{t.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-auto pt-2 text-center animate-in"
        style={{ animationDelay: "300ms" }}
      >
        <p className="text-xs text-muted/40">张老板团队 · 闲鱼实战派</p>
      </div>
    </div>
  );
}
