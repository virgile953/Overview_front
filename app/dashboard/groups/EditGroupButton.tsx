"use client";
import { SquarePen } from "lucide-react";
import { Group } from "@/models/server/groups";
import { useGroupsContext } from "./GroupsClientWrapper";

interface EditGroupButtonProps {
  group: Group;
}

export default function EditGroupButton({ group }: EditGroupButtonProps) {
  const { editGroup } = useGroupsContext();

  return (
    <button 
      onClick={() => editGroup(group)} 
      aria-label="Edit Group"
      className="absolute bottom-2 right-2"
    >
      <SquarePen className="w-5 h-5 place-self-end text-gray-600 mt-2 cursor-pointer hover:text-gray-800" />
    </button>
  );
}
