import GroupCard from "./GroupCard";
import CreateGroupButton from "./CreateGroupButton";
import GroupsClientWrapper from "./GroupsClientWrapper";
import { getGroups } from "@/lib/groups/groups";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Groups() {

  const session = await auth.api.getSession(
    {
      headers: await headers()
    }
  );
  if (!auth) {
    return <div>Unauthorized</div>;
  }

  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) {
    return <div>No active organization</div>;
  }

  const groups = await getGroups(organizationId);
  return (
    <GroupsClientWrapper>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Groups</h1>

        <CreateGroupButton />

        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {groups.map((group) => (
              <div key={group.id} className="">
                <GroupCard group={group} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            No groups found.
          </div>
        )}
      </div>
    </GroupsClientWrapper>
  );
}