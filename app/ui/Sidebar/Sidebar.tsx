"use client";
import SidebarHeader from "./SidebarHeader";
import SidebarNavigation from "./SidebarNavigation";
import SidebarStatus from "./SidebarStatus";

export default function Sidebar() {
  return (
    <div className="fixed left-2 top-2 bottom-2 w-64 bg-gray-900 border border-gray-700 rounded-lg z-10 flex flex-col">
      <SidebarHeader
        title="Pi Overview"
        subtitle="Raspberry Pi Monitor"
      />

      <SidebarNavigation />

      <SidebarStatus
        status="online"
        label="System Online"
      />
    </div>
  );
}