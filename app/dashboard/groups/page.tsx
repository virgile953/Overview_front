"use client";
import { useEffect, useState } from "react";
import { Group } from "@/models/server/groups";
import NewGroupModal from "./NewGroupModal";
import GroupCard from "./GroupCard";
import { SquarePlus } from "lucide-react";
import GroupModal from "./GroupModal";


export default function Groups() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  async function fetchGroups() {
    const response = await fetch('/api/groups');
    const data = await response.json();
    setGroups(data);
  }
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div>
      <div className="border-b border-gray-300 pb-4 mb-6">
        <p>List of user groups:</p>
      </div>
      <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        onClick={() => setIsNewGroupModalOpen(true)}
      >
        <SquarePlus className="w-5 h-5 inline-block mr-2" />
        Create Group
      </button>

      {groups ?
        groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group.$id} className="">
                <GroupCard group={group} onEdit={setSelectedGroup} />
              </div>
            ))}
    
          </div>
        ) : (
          <div>No groups found.


          </div>
        ) : (
          <div>Loading...</div>
        )}
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        onGroupCreated={fetchGroups}
      />
      {selectedGroup && (
        <GroupModal
          group={selectedGroup}
          isOpen={selectedGroup !== null}
          onClose={() => setSelectedGroup(null)}
          onSave={fetchGroups}
        />
      )}
    </div>
  );
}