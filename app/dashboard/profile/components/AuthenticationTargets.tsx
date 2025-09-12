import { User, formatDate } from "../types";

interface AuthenticationTargetsProps {
  user: User;
}

export default function AuthenticationTargets({ user }: AuthenticationTargetsProps) {
  if (!user.targets || user.targets.length === 0) {
    return null;
  }

  return (
    <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Authentication Methods</h2>
      <div className="space-y-3">
        {user.targets.map((target) => (
          <div key={target.$id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground capitalize">
                  {target.providerType}
                </span>
                {!target.expired && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{target.identifier}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Added {formatDate(target.$createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
