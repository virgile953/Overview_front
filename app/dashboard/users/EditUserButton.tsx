"use client";
import { SquarePen } from "lucide-react";
import { useUsersContext } from "./UsersClientWrapper";
import { UserWithGroups } from "@/lib/db/schema";

interface EditUserButtonProps {
  user: UserWithGroups;
}

export default function EditUserButton({ user }: EditUserButtonProps) {
  const { editUser } = useUsersContext();

  return (
    <button
      onClick={() => editUser(user)}
      aria-label="Edit User"
      className="absolute bottom-2 right-2"
    >
      <SquarePen className="w-5 h-5 place-self-end text-gray-600 mt-2 cursor-pointer hover:text-gray-800" />
    </button>
  );
}
