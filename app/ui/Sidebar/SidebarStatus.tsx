interface SidebarStatusProps {
  status: "online" | "offline" | "warning";
  label: string;
}

export default function SidebarStatus({ status, label }: SidebarStatusProps) {
  const statusColors = {
    online: "bg-green-400",
    offline: "bg-red-400",
    warning: "bg-yellow-400"
  };

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg mt-auto">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 ${statusColors[status]} rounded-full`}></div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
}
