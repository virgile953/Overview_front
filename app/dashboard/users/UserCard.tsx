"use client";
import { User } from "@/models/server/users";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="border relative border-gray-300 rounded p-4 h-full w-full">
      <div className="flex-1">
        User Card:
        <div>{user.name}</div>
        <div>Email: {user.email}</div>
        <div>Role: {user.function}</div>
      </div>
    </div>
  );
}