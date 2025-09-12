import { User } from "../types";

interface PersonalInformationProps {
  user: User;
}

export default function PersonalInformation({ user }: PersonalInformationProps) {
  return (
    <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
          <p className="text-foreground">{user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">User ID</label>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{user.$id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
          <p className="text-foreground">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
          <p className="text-foreground">{user.phone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}
