"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";

export default function ToolsLayout({
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
    <div className="min-h-dvh">
      {children}
      <ToastContainer />
    </div>
  );
}
