"use client";
import { User } from "@/models/server/users";
import { SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import NewUserModal from "./NewUserModal";
import UserModal from "./UserModal";

export default function Users() {

  const [users, setUsers] = useState<User[] | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  async function fetchUsers() {
    const response = await fetch('/api/users');
    const data = await response.json();
    console.log(data);
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="relative">
      <div className="border-b border-gray-300 pb-4 mb-6">
        <p>List of users:</p>
      </div>
      <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        onClick={() => setIsNewUserModalOpen(true)}
      >
        <SquarePlus className="w-5 h-5 inline-block mr-2" />
        Create User
      </button>

      {users ?
        users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user.$id} className="">
                <UserCard user={user} onEdit={setSelectedUser} /> {/* onUserUpdated={fetchUsers} */}
              </div>
            ))}

          </div>
        ) : (
          <div>No users found.</div>
        ) : (
          <div>Loading...</div>
        )}
      {/* NewUserModal component would go here */}
      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onUserCreated={fetchUsers} />
      {selectedUser && (
        <UserModal
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          onSave={fetchUsers}
          user={selectedUser!} />
      )}
    </div>
  );
}