import { auth } from "@/lib/auth";
import { SidebarLayout, SidebarProvider } from "../ui/Sidebar/ShadcnSidebar";
import { headers } from "next/headers";


export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <>{children}</>;
  }
  return (
    <SidebarProvider>
      <SidebarLayout user={session.user}>
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}