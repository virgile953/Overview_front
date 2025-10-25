"use client";
import { useState, createContext, useContext } from "react";
import NewGroupModal from "./NewGroupModal";
import GroupModal from "./GroupModal";
import { useRouter } from "next/navigation";
import { Group } from "@/lib/groups/groups";

interface GroupsContextType {
  openNewGroupModal: () => void;
  editGroup: (group: Group) => void;
}

const GroupsContext = createContext<GroupsContextType | null>(null);

export const useGroupsContext = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroupsContext must be used within GroupsClientWrapper');
  }
  return context;
};

interface GroupsClientWrapperProps {
  children: React.ReactNode;
}

export default function GroupsClientWrapper({ children }: GroupsClientWrapperProps) {
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const router = useRouter();

  const handleGroupCreated = () => {
    setIsNewGroupModalOpen(false);
    router.refresh(); // Refresh server component data
  };

  const handleGroupUpdated = () => {
    setSelectedGroup(null);
    router.refresh(); // Refresh server component data
  };

  const openNewGroupModal = () => {
    setIsNewGroupModalOpen(true);
  };

  const editGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  const contextValue = {
    openNewGroupModal,
    editGroup
  };

  return (
    <GroupsContext.Provider value={contextValue}>
      {children}
      
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
      
      {selectedGroup && (
        <GroupModal
          group={selectedGroup}
          isOpen={selectedGroup !== null}
          onClose={() => setSelectedGroup(null)}
          onSave={handleGroupUpdated}
        />
      )}
    </GroupsContext.Provider>
  );
}
