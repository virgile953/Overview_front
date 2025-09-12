"use client";
import { SquarePlus } from "lucide-react";
import { useUsersContext } from "./UsersClientWrapper";

export default function CreateUserButton() {
  const { openNewUserModal } = useUsersContext();

  return (
    <button 
      className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
      onClick={openNewUserModal}
    >
      <SquarePlus className="w-5 h-5 inline-block mr-2" />
      Create User
    </button>
  );
}
