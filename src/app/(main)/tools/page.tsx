"use client";

import Link from "next/link";

interface ToolCategory {
  title: string;
  icon: string;
  tools: ToolItem[];
}

interface ToolItem {
  href: string;
  emoji: string;
  color: string;      // icon background color
  label: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

const categories: ToolCategory[] = [
  {
    title: "安全工具",
    icon: "🛡️",
    tools: [
      {
        href: "/forbidden-words",
        emoji: "🚫",
        color: "bg-red-500",
        label: "违禁词检测",
        description: "检测文案敏感词，避免限流",
      },
      {
        href: "/violation-records",
        emoji: "📋",
        color: "bg-red-400",
        label: "违规记录库",
        description: "社区共建的违规案例，帮你避坑",
      },
    ],
  },
  {
    title: "AI 工具",
    icon: "🤖",
    tools: [
      {
        href: "/copywriting",
        emoji: "✍️",
        color: "bg-orange-500",
        label: "文案生成",
        description: "AI智能优化商品描述",
        badge: "Hot",
      },
      {
        href: "/keyword-seo",
        emoji: "🏷️",
        color: "bg-purple-500",
        label: "关键词优化",
        description: "分析爆款文案提取关键词",
        disabled: true,
      },
      {
        href: "/image-creative",
        emoji: "📸",
        color: "bg-pink-500",
        label: "图片创意方案",
        description: "AI分析同行图片，生成拍摄优化建议",
        disabled: true,
      },
      {
        href: "/smart-reply",
        emoji: "💬",
        color: "bg-cyan-500",
        label: "智能话术助手",
        description: "AI模拟卖家回复买家咨询",
        disabled: true,
      },
      {
        href: "/qa-assistant",
        emoji: "🤖",
        color: "bg-indigo-500",
        label: "答疑助手",
        description: "闲鱼运营问题随时问",
        badge: "Hot",
        disabled: true,
      },
    ],
  },
  {
    title: "数据分析",
    icon: "📊",
    tools: [
      {
        href: "/boom",
        emoji: "🚀",
        color: "bg-yellow-500",
        label: "爆款打造",
        description: "数据驱动的商品运营工具",
        badge: "New",
        disabled: true,
      },
      {
        href: "/competitor-analytics",
        emoji: "👀",
        color: "bg-teal-500",
        label: "同行监控",
        description: "追踪竞品数据与策略",
        disabled: true,
      },
    ],
  },
  {
    title: "内容工具",
    icon: "📚",
    tools: [
      {
        href: "/resource-library",
        emoji: "📚",
        color: "bg-emerald-500",
        label: "运营宝库",
        description: "精选干货与选品内容合集",
        disabled: true,
      },
      {
        href: "/user-sharing",
        emoji: "✍️",
        color: "bg-lime-500",
        label: "用户分享",
        description: "社区回答和经验分享",
        disabled: true,
      },
    ],
  },
  {
    title: "运营工具",
    icon: "🛠️",
    tools: [
      {
        href: "/calculator",
        emoji: "💰",
        color: "bg-green-500",
        label: "利润计算器",
        description: "快速计算商品利润，精准定价",
      },
      {
        href: "/image-tools",
        emoji: "🖼️",
        color: "bg-blue-500",
        label: "图片处理",
        description: "压缩、裁剪、高清与滤镜处理",
      },
      {
        href: "/operation-log",
        emoji: "📒",
        color: "bg-slate-500",
        label: "操作日志",
        description: "记录每日运营与动作复盘",
      },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-xl font-bold">运营工具</h1>
      <p className="mb-6 text-xs text-muted">15款工具助力闲鱼运营</p>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.title}>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span>{category.icon}</span>
              {category.title}
            </h2>
            <div className="space-y-2">
              {category.tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolItem }) {
  const content = (
    <div
      className={`flex items-center gap-3 rounded-xl bg-card p-4 transition-colors touch-feedback ${
        tool.disabled ? "opacity-50" : "hover:bg-card-hover"
      }`}
    >
      {/* Colored icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tool.color} text-lg shadow-sm`}
      >
        {tool.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{tool.label}</span>
          {tool.badge && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] text-white ${
                tool.badge === "New" ? "bg-success" : "bg-danger"
              }`}
            >
              {tool.badge}
            </span>
          )}
          {tool.disabled && (
            <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] text-muted">
              开发中
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted truncate">{tool.description}</p>
      </div>
      <span className="text-muted flex-shrink-0">›</span>
    </div>
  );

  if (tool.disabled) {
    return <div>{content}</div>;
  }

  return <Link href={tool.href}>{content}</Link>;
}
