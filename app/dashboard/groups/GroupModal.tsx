import Modal from "@/app/ui/Modal/Modal";
import InputField from "@/app/ui/InputField";
import { Group } from "@/models/server/groups";
import DeviceSelector from "@/app/ui/DeviceSelector";
import UserSelector from "@/app/ui/UserSelector";

interface groupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Group) => void;
  group: Group;
}

export default function GroupModal({ isOpen, onClose, onSave, group }: groupModalProps) {
  if (!isOpen) return null;
  if (!group) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Details">
      <div className="flex flex-col gap-4">
        <InputField
          type="text"
          placeholder="Group Name"
          value={group.name}
          readOnly
        />

        <InputField
          type="text"
          placeholder="Location"
          value={group.localisation}
          readOnly
        />

        <InputField
          type="textarea"
          placeholder="Description"
          value={group.description}
          rows={4}
          readOnly
        />

        <UserSelector
          initialValue={group.users}
          onChange={selected => onSave({ ...group, users: selected })}
        />

        <DeviceSelector
          initialValue={group.devices}
          onChange={selected => onSave({ ...group, devices: selected })}
        />

        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => onSave(group)}
          >
            Save
          </button>
        </div>
      </div>
    </Modal >
  );
}