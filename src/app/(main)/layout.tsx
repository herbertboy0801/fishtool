"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastContainer } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoggedIn) {
      const phone = localStorage.getItem("xianyu_userPhone");
      if (!phone || phone === "null") {
        router.replace("/login");
      }
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-dvh pb-16">
      {children}
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
