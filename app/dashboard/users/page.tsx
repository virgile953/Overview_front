import { getUsers as getUsersOld } from "@/models/server/users";
import UserCard from "./UserCard";
import CreateUserButton from "./CreateUserButton";
import UsersClientWrapper from "./UsersClientWrapper";
import { getUsers } from "@/lib/users/users";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Users() {

  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!auth) {
    return <div>Unauthorized</div>;
  }

  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) {
    return <div>No active organization</div>;
  }


  const users = await getUsersOld();
  const coucou = await getUsers(organizationId);
  return (
    <UsersClientWrapper>

      {coucou.map(user => (user.email))}
      <div className="relative">
        <h1 className="text-2xl font-bold text-foreground mb-4">Users</h1>

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