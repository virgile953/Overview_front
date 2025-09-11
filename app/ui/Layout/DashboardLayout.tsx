import { cookies } from "next/headers";
import { SidebarLayout, SidebarProvider } from "../Sidebar/ShadcnSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}
