"use client";
import { User } from "@/models/server/users";
import { SquarePen } from "lucide-react";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export default function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="border relative border-gray-300 rounded p-4 h-full w-full">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      {user.last_name && (
        <p className="text-sm text-gray-500">{user.last_name}</p>
      )}
      <p className="text-sm text-gray-600">{user.email}</p>
      
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
            {user.groups.map((group, index) => (
              <li key={typeof group === 'string' ? group : group.$id || index}>
                {typeof group === 'string' ? group : group.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        onClick={() => onEdit(user)} 
        aria-label="Edit User"
        className="absolute bottom-2 right-2"
      >
        <SquarePen className="w-5 h-5 place-self-end text-gray-600 mt-2 cursor-pointer hover:text-gray-800" />
      </button> 
    </div>
  );
}