interface SidebarHeaderProps {
  title: string;
  subtitle: string;
}

export default function SidebarHeader({ title, subtitle }: SidebarHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-700">
      <h1 className="text-xl font-bold text-emerald-400">{title}</h1>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}
