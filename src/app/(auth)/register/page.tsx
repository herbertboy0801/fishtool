"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      showToast("请填写完整信息", "warning");
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      showToast("手机号格式不正确", "error");
      return;
    }
    if (password.length < 6) {
      showToast("密码至少6位", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("两次密码不一致", "error");
      return;
    }

    showToast("注册成功，请登录", "success");
    router.push("/login");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🐟</div>
          <h1 className="text-2xl font-bold">注册账号</h1>
          <p className="mt-1 text-sm text-muted">创建您的闲鱼运营助手账号</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
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
              placeholder="至少6位密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">确认密码</label>
            <input
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
          >
            注册
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          已有账号？{" "}
          <Link href="/login" className="text-primary">
            去登录
          </Link>
        </p>
      </div>
    </main>
  );
}
