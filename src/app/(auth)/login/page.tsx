"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/ui/toast";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();
  const login = useAuth((s) => s.login);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      showToast("请输入手机号", "warning");
      return;
    }
    if (!password.trim()) {
      showToast("请输入密码", "warning");
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      showToast("手机号格式不正确", "error");
      return;
    }

    login(phone);
    showToast("登录成功", "success");
    router.push("/");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🐟</div>
          <h1 className="text-2xl font-bold">闲鱼运营助手</h1>
          <p className="mt-1 text-sm text-muted">登录您的账号</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-muted">手机号</label>
            <input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">密码</label>
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            记住密码，下次自动登录
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
          >
            登录
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          还没有账号？{" "}
          <Link href="/register" className="text-primary">
            立即注册
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted">
          忘记密码？请联系管理员
        </p>
        <p className="mt-6 text-center text-xs text-muted/50">张老板团队 出品</p>
      </div>
    </main>
  );
}
