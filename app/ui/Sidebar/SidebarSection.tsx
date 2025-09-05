import { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

export default function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div>
      <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <ul className="space-y-1">
        {children}
      </ul>
    </div>
  );
}
