"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../ui/Layout/DashboardLayout";
import { account } from "../Appwrite";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    account.get().then(
      () => {
        // User is authenticated, stay on the dashboard
        console.log("User is authenticated");
      },
      () => {
        // No session, redirect to login
        router.push("/login");
      }
    );
  }, [router]);

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}