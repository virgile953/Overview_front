import { User } from "@/models/server/users";
import EditUserButton from "./EditUserButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="border relative border-border bg-sidebar-accent rounded-lg p-4 h-full w-full">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      {user.last_name && (
        <p className="text-sm text-muted-foreground">{user.last_name}</p>
      )}
      <p className="text-sm text-muted-foreground">{user.email}</p>

      {user.title && (
        <p className="text-sm mt-1">{user.title}</p>
      )}
      
      <div className="mt-2 space-y-1">
        {user.service && (
          <div className="text-xs">
            <span className="font-semibold">Service:</span> {user.service}
          </div>
        )}
        {user.function && (
          <div className="text-xs">
            <span className="font-semibold">Role:</span> {user.function}
          </div>
        )}
      </div>
      
      {user.groups && user.groups.length > 0 && (
        <div className="mt-2">
          <span className="text-sm font-semibold">Groups:</span>
          <ul className="list-disc list-inside text-xs">
            {user.groups.slice(0, 3).map((group, index) => (
              <li key={typeof group === 'string' ? group : group.id || index}>
                {typeof group === 'string' ? group : group.name}
              </li>
            ))}
            {user.groups.length > 3 && (
              <Tooltip>
                <TooltipTrigger>
                  <li className="text-muted-foreground cursor-pointer">...and {user.groups.length - 3} more</li>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <ul className="list-disc list-inside">
                    {user.groups.slice(3).map((group, index) => (
                      <li key={typeof group === 'string' ? group : group.id || index}>
                        {typeof group === 'string' ? group : group.name}
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </ul>
        </div>
      )}
      
      <EditUserButton user={user} />
    </div>
  );
}