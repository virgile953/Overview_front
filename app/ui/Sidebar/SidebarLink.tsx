import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}

export default function SidebarLink({ href, icon: Icon, label, isActive = false }: SidebarLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
          isActive
            ? "bg-emerald-600 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </Link>
    </li>
  );
}
