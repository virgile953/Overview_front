"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Monitor,
  CheckCircle,
  Zap,
  Wifi,
  FileText,
  AlertTriangle,
  Settings,
  Group,
  BookUser,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export { SidebarProvider } from "@/components/ui/sidebar";
import UserProfile from "../Navbar/UserProfile";
import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";

import logo from '@/public/logo/logo.svg';

const navigation = [
  {
    title: "Home",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Overview",
        url: "/dashboard/overview",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        title: "Devices",
        url: "/dashboard/devices",
        icon: Monitor,
      },
      {
        title: "System Status",
        url: "/dashboard/system-status",
        icon: CheckCircle,
      },
      {
        title: "Performance",
        url: "/dashboard/performance",
        icon: Zap,
      },
      {
        title: "Network Status",
        url: "/dashboard/network",
        icon: Wifi,
      },
      {
        title: "Logs",
        url: "/dashboard/logs",
        icon: FileText,
      },
      {
        title: "Alerts",
        url: "/dashboard/alerts",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: BookUser,
      },
      {
        title: "Groups",
        url: "/dashboard/groups",
        icon: Group,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const sidebar = useSidebar();

  return (
    <Sidebar variant="floating" collapsible="icon" className="relative w-56">
      <SidebarHeader>
        <div className="flex flex-col gap-2 py-2 text-sidebar-foreground">
          <div className="flex items-center gap-2">
            <div className="relative flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
              <Image src={logo} alt="Logo" fill className="p-1 stroke-1" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Pi Overview</span>
              <span className="truncate text-xs">Raspberry Pi Monitor</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <Separator orientation="horizontal" className="my-2 h-px bg-border" />
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <Separator orientation="horizontal" className="my-2 h-px bg-border" />

      <SidebarFooter className="overflow-x-hidden">
        <div className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500" />
            {sidebar.open && <span className="text-sm text-sidebar-foreground w-full">System Online</span>}
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavbarContent({ user }: { user?: { name: string; email: string; emailVerified: boolean; } | null; }) {
  const path = usePathname();
  return (
    <>
      <h1 className="text-foreground text-lg font-semibold">
        {path && path.slice(1).split("/").map((segment, index) => (
          <Link key={index} className="text-foreground"
            href={`/${path.split("/").slice(1, index + 2).join("/")}`}>
            {segment}
            {index < path.split("/").length - 2 && " - "}
          </Link>
        ))}
      </h1>
      <div className="flex items-center space-x-4">
        <UserProfile
          name={user?.name || ""}
          email={user?.email || ""}
          emailVerification={user?.emailVerified || false}
        />
      </div>
    </>
  );
}

export function SidebarLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { name: string; email: string; emailVerified: boolean; } | null;
}) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <NavbarContent user={user} />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
