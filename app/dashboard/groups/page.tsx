import { getGroups } from "@/models/server/groups";
import GroupCard from "./GroupCard";
import CreateGroupButton from "./CreateGroupButton";
import GroupsClientWrapper from "./GroupsClientWrapper";

export default async function Groups() {
  // Fetch groups data on the server
  const groups = await getGroups();

  return (
    <GroupsClientWrapper>
      <div>
        <div className="border-b border-gray-300 pb-4 mb-6">
          <p>List of user groups:</p>
        </div>
        
        <CreateGroupButton />

        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {groups.map((group) => (
              <div key={group.$id} className="">
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