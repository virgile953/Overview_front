import { getUsers } from "@/models/server/users";
import UserCard from "./UserCard";
import CreateUserButton from "./CreateUserButton";
import UsersClientWrapper from "./UsersClientWrapper";

export default async function Users() {
  const users = await getUsers();

  return (
    <UsersClientWrapper>
      <div className="relative">
        <div className="border-b border-border pb-4 mb-6">
          <p>List of users:</p>
        </div>
        
        <CreateUserButton />

        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {users.map((user) => (
              <div key={user.$id} className="">
                <UserCard user={user} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">No users found.</div>
        )}
      </div>
    </UsersClientWrapper>
  );
}