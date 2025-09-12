import { Device } from "@/models/server/devices";
import { Group } from "@/models/server/groups";
import { User } from "@/models/server/users";
import EditGroupButton from "./EditGroupButton";

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <div className="border relative border-gray-300 rounded p-4 h-full w-full">
      <h3 className="text-lg font-semibold">{group.name}</h3>
      <p className="text-sm text-gray-500">{group.localisation}</p>
      <p className="text-sm">{group.description}</p>
      <div className="mt-2">
        <span className="text-sm font-semibold">Users:</span>
        <ul className="list-disc list-inside">
          {group.users.map((user: User) => (
            <li key={user.$id}>{user.name}</li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <span className="text-sm font-semibold">Devices:</span>
        <ul className="list-disc list-inside">
          {group.devices.map((device: Device) => (
            <li key={device.$id}>{device.name}</li>
          ))}
        </ul>
      </div>
      <EditGroupButton group={group} />
    </div>
  );
}