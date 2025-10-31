import { auth } from "@/lib/auth";
import { SidebarLayout, SidebarProvider } from "../ui/Sidebar/ShadcnSidebar";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner"


export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const orgs = await auth.api.listOrganizations({
    headers: await headers(),
  });

  if (!session) {
    return <>{children}</>;
  }
  return (
    <SidebarProvider>
      <SidebarLayout
        user={session.user}
        session={{
          ...session.session,
          ipAddress: session.session.ipAddress ?? null,
          userAgent: session.session.userAgent ?? null,
          activeOrganizationId: session.session.activeOrganizationId ?? null
        }}
        orgs={orgs.map(org => ({
          ...org,
          metadata: org.metadata ?? null,
          logo: org.logo ?? null
        }))}
      >
        {children}
        <Toaster />

      </SidebarLayout>
    </SidebarProvider>
  );
}