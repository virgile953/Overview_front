import { User, formatDate } from "../types";

interface AccountTimelineProps {
  user: User;
}

export default function AccountTimeline({ user }: AccountTimelineProps) {
  return (
    <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Account Timeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Registration Date</label>
          <p className="text-foreground">{formatDate(user.registration)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Last Password Update</label>
          <p className="text-foreground">{formatDate(user.passwordUpdate)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Profile Last Updated</label>
          <p className="text-foreground">{formatDate(user.$updatedAt)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Last Access</label>
          <p className="text-foreground">{formatDate(user.accessedAt)}</p>
        </div>
      </div>
    </div>
  );
}
