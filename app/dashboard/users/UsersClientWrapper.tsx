"use client";
import { useState, createContext, useContext } from "react";
import NewUserModal from "./NewUserModal";
import UserModal from "./UserModal";
import { useRouter } from "next/navigation";
import { UserWithGroups } from "@/lib/db/schema";

interface UsersContextType {
  openNewUserModal: () => void;
  editUser: (user: UserWithGroups) => void;
}

const UsersContext = createContext<UsersContextType | null>(null);

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsersContext must be used within UsersClientWrapper');
  }
  return context;
};

interface UsersClientWrapperProps {
  children: React.ReactNode;
}

export default function UsersClientWrapper({ children }: UsersClientWrapperProps) {
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithGroups | null>(null);
  const router = useRouter();

  const handleUserCreated = () => {
    setIsNewUserModalOpen(false);
    router.refresh(); // Refresh server component data
  };

  const handleUserUpdated = () => {
    setSelectedUser(null);
    router.refresh(); // Refresh server component data
  };
  // const handleUserDeleted = () => {
  //   setSelectedUser(null);
  //   router.refresh(); // Refresh server component data
  // };

  const openNewUserModal = () => {
    setIsNewUserModalOpen(true);
  };

  const editUser = (user: UserWithGroups) => {
    setSelectedUser(user);
  };

  const contextValue = {
    openNewUserModal,
    editUser
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          onSave={handleUserUpdated}
        />
      )}
    </UsersContext.Provider>
  );
}
