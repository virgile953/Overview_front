import { cookies } from "next/headers";
import { SidebarLayout, SidebarProvider } from "../ui/Sidebar/ShadcnSidebar";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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