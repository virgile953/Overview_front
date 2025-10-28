"use client";
import Modal from "@/app/ui/Modal/Modal";
import InputField from "@/app/ui/InputField";
import DeviceSelector from "@/app/ui/DeviceSelector";
import UserSelector from "@/app/ui/UserSelector";
import { useEffect, useState } from "react";
import { GroupWithRelations } from "@/lib/db/schema";

interface groupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: GroupWithRelations) => void;
  group: GroupWithRelations;
}

export default function GroupModal({ isOpen, onClose, onSave, group }: groupModalProps) {

  const [localGroup, setLocalGroup] = useState<GroupWithRelations>(group);

  async function saveGroup() {
    const res = await fetch(`/api/groups/${localGroup.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localGroup),
    });
    if (!res.ok) {
      console.error("Failed to save group");
      return;
    }
    const updatedGroup = await res.json();
    onSave(updatedGroup);
    onClose();
  }

  useEffect(() => {
    setLocalGroup(group);
  }, [group]);

  if (!isOpen) return null;
  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Details">
      <div className="flex flex-col gap-4">
        <InputField
          type="text"
          placeholder="Group Name"
          value={localGroup.name}
          onChange={e => setLocalGroup({ ...localGroup, name: e.target.value })}
        />

        <InputField
          type="text"
          placeholder="Location"
          value={localGroup.localisation}
          onChange={e => setLocalGroup({ ...localGroup, localisation: e.target.value })}
        />

        <InputField
          type="textarea"
          placeholder="Description"
          value={localGroup.description}
          rows={4}
          onChange={e => setLocalGroup({ ...localGroup, description: e.target.value })}
        />

        <UserSelector
          initialValue={localGroup.users}
          onChange={selected => setLocalGroup({ ...localGroup, users: selected })}
        />

        <DeviceSelector
          initialValue={localGroup.devices}
          onChange={selected => setLocalGroup({ ...localGroup, devices: selected })}
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
            onClick={saveGroup}
          >
            Save
          </button>
        </div>
      </div>
    </Modal >
  );
}