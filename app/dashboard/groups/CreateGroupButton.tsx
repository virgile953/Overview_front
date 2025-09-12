"use client";
import { SquarePlus } from "lucide-react";
import { useGroupsContext } from "./GroupsClientWrapper";

export default function CreateGroupButton() {
  const { openNewGroupModal } = useGroupsContext();

  return (
    <button 
      className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
      onClick={openNewGroupModal}
    >
      <SquarePlus className="w-5 h-5 inline-block mr-2" />
      Create Group
    </button>
  );
}
