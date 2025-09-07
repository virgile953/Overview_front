import Modal from "@/app/ui/Modal/Modal";
import { Group } from "@/models/server/groups";

interface groupModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave: (group: { name: string; localisation: string; description: string; users: string[]; devices: string[] }) => void;
  onSave: (group: { name: string; localisation: string; description: string; users: string[]; devices: string[] }) => void;
  group: Group;
}

export default function GroupModal({ isOpen, onClose, onSave, group }: groupModalProps) {
  if (!isOpen) return null;
  if (!group) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Details">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Group name"
          value={group.name}
          readOnly
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Localisation"
          value={group.localisation}
          readOnly
        />
        <textarea
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Description"
          value={group.description}
          readOnly
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="User IDs (comma separated)"
          value={group.users.join(",")}
          readOnly
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Device IDs (comma separated)"
          value={group.devices.map(device => device.$id).join(",")}
          readOnly
        />
        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => onSave(group)}
            >
              Save
            </button> */}
        </div>
      </div>
    </Modal>
  );
}