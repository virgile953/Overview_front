import { User } from "../types";
import StatusBadge from "./StatusBadge";

interface SecurityVerificationProps {
  user: User;
}

export default function SecurityVerification({ user }: SecurityVerificationProps) {
  return (
    <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Security & Verification</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Account Status</label>
          <StatusBadge status={user.status} label={user.status ? 'Active' : 'Inactive'} />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Multi-Factor Authentication</label>
          <StatusBadge status={user.mfa} label={user.mfa ? 'Enabled' : 'Disabled'} />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Email Verification</label>
          <StatusBadge status={user.emailVerification} label={user.emailVerification ? 'Verified' : 'Unverified'} />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Verification</label>
          <StatusBadge status={user.phoneVerification} label={user.phoneVerification ? 'Verified' : 'Unverified'} />
        </div>
      </div>
    </div>
  );
}
