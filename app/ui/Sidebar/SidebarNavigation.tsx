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
  BookUser
} from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarLink from "./SidebarLink";

export default function SidebarNavigation() {
  return (
    <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto sidebar-scrollbar" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Home Section */}
      <SidebarSection title="Home">
        <SidebarLink
          href="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />
        <SidebarLink
          href="/dashboard/overview"
          icon={BarChart3}
          label="Overview"
        />
      </SidebarSection>

      {/* Raspberry Pi Monitoring */}
      <SidebarSection title="Monitoring">
        <SidebarLink
          href="/dashboard/devices"
          icon={Monitor}
          label="Devices"
        />
        <SidebarLink
          href="/dashboard/system-status"
          icon={CheckCircle}
          label="System Status"
        />
        <SidebarLink
          href="/dashboard/performance"
          icon={Zap}
          label="Performance"
        />
        <SidebarLink
          href="/dashboard/network"
          icon={Wifi}
          label="Network Status"
        />
        <SidebarLink
          href="/dashboard/logs"
          icon={FileText}
          label="Logs"
        />
        <SidebarLink
          href="/dashboard/alerts"
          icon={AlertTriangle}
          label="Alerts"
        />
      </SidebarSection>

      {/* Settings Section */}
      <SidebarSection title="Settings">
        <SidebarLink
          href="/dashboard/settings"
          icon={Settings}
          label="Settings"
        />
        <SidebarLink
          href="/dashboard/users"
          icon={BookUser}
          label="Users"
        />
        <SidebarLink
          href="/dashboard/groups"
          icon={Group}
          label="Groups"
        />
      </SidebarSection>

    </nav>
  );
}
