"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../ui/Layout/DashboardLayout";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side authentication check
  const router = useRouter();
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/check", { method: "POST" });
      const { authenticated } = await res.json();
      if (!authenticated) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}