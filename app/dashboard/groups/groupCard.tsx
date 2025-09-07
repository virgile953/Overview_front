import { Device } from "@/models/server/devices";
import { Group } from "@/models/server/groups";
import { SquarePen } from "lucide-react";


interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
}

export default function GroupCard({ group, onEdit }: GroupCardProps) {
  return (
    <div className="border relative border-gray-300 rounded p-4">
      <h3 className="text-lg font-semibold">{group.name}</h3>
      <p className="text-sm text-gray-500">{group.localisation}</p>
      <p className="text-sm">{group.description}</p>
      <div className="mt-2">
        <span className="text-sm font-semibold">Users:</span>
        <ul className="list-disc list-inside">
          {group.users.map((user: string) => (
            <li key={user}>{user}</li>
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
      <button onClick={() => onEdit(group)} aria-label="Edit Group"
        className="absolute bottom-2 right-2">
        <SquarePen className="w-5 h-5 place-self-end text-gray-600 mt-2 cursor-pointer hover:text-gray-800" />
      </button> 
    </div>
  );
}