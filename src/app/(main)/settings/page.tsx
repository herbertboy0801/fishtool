"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/ui/toast";

const PLAN_CONFIG = {
  free:     { label: "免费版",  quota: 50,   used: 0,   color: "text-muted",   bg: "bg-muted/20" },
  basic:    { label: "基础版",  quota: 200,  used: 0,   color: "text-blue-400", bg: "bg-blue-400/20" },
  standard: { label: "标准版",  quota: 700,  used: 0,   color: "text-purple-400", bg: "bg-purple-400/20" },
  premium:  { label: "高级版",  quota: 3000, used: 0,   color: "text-primary", bg: "bg-primary/20" },
} as const;

export default function SettingsPage() {
  const router = useRouter();
  const { phone, plan, logout } = useAuth();

  const planKey = (plan in PLAN_CONFIG ? plan : "free") as keyof typeof PLAN_CONFIG;
  const planInfo = PLAN_CONFIG[planKey];
  const quotaPercent = Math.round((planInfo.used / planInfo.quota) * 100);

  function handleLogout() {
    logout();
    showToast("已退出登录", "info");
    router.replace("/login");
  }

  return (
    <div className="px-4 pt-6">
      {/* User Card */}
      <div className="mb-4 rounded-2xl bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl">
              🐟
            </div>
            <div>
              <p className="text-sm font-semibold">
                {phone ? `${phone.slice(0, 3)}****${phone.slice(7)}` : "未登录"}
              </p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${planInfo.color} ${planInfo.bg}`}
              >
                {planInfo.label}
              </span>
            </div>
          </div>
          {/* Credits */}
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">50</p>
            <p className="text-[10px] text-muted">积分</p>
          </div>
        </div>

        {/* Quota progress */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
            <span>本月额度</span>
            <span>
              {planInfo.used} / {planInfo.quota}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(quotaPercent, 2)}%` }}
            />
          </div>
          {planKey === "free" && (
            <p className="mt-1.5 text-[10px] text-muted">
              升级会员获得更多额度
            </p>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <MenuItem icon="💳" label="卡密兑换" description="兑换会员或额度" disabled />
        <MenuItem icon="📊" label="额度明细" description="查看AI额度使用情况" disabled />
        <MenuItem icon="📥" label="下载记录" description="查看图片工具的处理记录" disabled />
        <MenuItem icon="⚙️" label="API 设置" description="自定义AI模型配置" disabled />
        <MenuItem icon="📖" label="使用说明" description="新手入门指南" disabled />
        <MenuItem icon="💬" label="意见反馈" description="帮助我们改进" disabled />
        <MenuItem icon="ℹ️" label="关于我们" description="版本 v0.1.0" disabled />
      </div>

      {/* Membership plans */}
      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="mb-3 text-xs font-semibold text-primary">升级会员解锁更多功能</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { price: "¥9.9/月", name: "基础版", quota: "200额度" },
            { price: "¥29/季", name: "标准版", quota: "700额度" },
            { price: "¥99/年", name: "高级版", quota: "3000额度" },
          ].map((p) => (
            <div key={p.name} className="rounded-xl bg-card p-2.5">
              <p className="font-semibold text-primary">{p.price}</p>
              <p className="mt-0.5 text-muted">{p.name}</p>
              <p className="mt-0.5 text-[10px] text-muted">{p.quota}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-5 w-full rounded-xl border border-danger/30 py-3 text-sm text-danger transition-colors hover:bg-danger/10 touch-feedback"
      >
        退出登录
      </button>

      <p className="mt-4 pb-4 text-center text-[11px] text-muted/40">
        闲鱼运营助手 v0.1.0 · Made with ❤️ by 张老板团队
      </p>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  description,
  disabled,
}: {
  icon: string;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-card p-4 ${
        disabled ? "opacity-50" : "hover:bg-card-hover touch-feedback cursor-pointer"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {!disabled && <span className="text-muted">›</span>}
    </div>
  );
}
