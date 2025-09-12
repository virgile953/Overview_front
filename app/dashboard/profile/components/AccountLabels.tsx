import { User } from "../types";

interface AccountLabelsProps {
  user: User;
}

export default function AccountLabels({ user }: AccountLabelsProps) {
  if (!user.labels || user.labels.length === 0) {
    return null;
  }

  return (
    <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Account Labels</h2>
      <div className="flex flex-wrap gap-2">
        {user.labels.map((label, index) => (
          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
