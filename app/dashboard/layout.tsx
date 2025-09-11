"use client";

import { SidebarLayout, SidebarProvider } from "../ui/Sidebar/ShadcnSidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}