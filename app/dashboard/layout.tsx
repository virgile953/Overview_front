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
  // This must be done in a server component or via server actions
  // For now, we use a redirect in a client effect, but call a server action
  const router = useRouter();
  useEffect(() => {
    async function checkAuth() {
      // Use a server action to check authentication
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