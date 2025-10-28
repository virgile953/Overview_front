"use client";
import Modal from "@/app/ui/Modal/Modal";
import InputField from "@/app/ui/InputField";
import DeviceSelector from "@/app/ui/DeviceSelector";
import UserSelector from "@/app/ui/UserSelector";
import { useEffect, useState } from "react";
import { GroupWithRelations } from "@/lib/db/schema";
import { updateGroup } from "@/lib/groups/groups";
import { ApiDevice } from "@/lib/devices/devices";

interface groupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: GroupWithRelations) => void;
  group: GroupWithRelations;
}

export default function GroupModal({ isOpen, onClose, onSave, group }: groupModalProps) {

  const [localGroup, setLocalGroup] = useState<GroupWithRelations>(group);

  async function saveGroup() {
    const updatedGroup = await updateGroup(localGroup.id, {
      name: localGroup.name,
      localisation: localGroup.localisation,
      description: localGroup.description,
    }
      , localGroup.users?.map(u => u.id), localGroup.devices?.map(d => d.id));
    if (updatedGroup == null) {
      console.error("Failed to save group");
      return;
    }
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
          initialValue={localGroup.devices as unknown as ApiDevice[]}

          onChange={selected => setLocalGroup({ ...localGroup, devices: selected as unknown as GroupWithRelations["devices"] })}
        />
        {/* <DeviceSelector
                  onChange={(selected) =>
                    setFormData({ ...localGroup, devices: selected.filter(device => device.id !== undefined) as any })}
                  initialValue={formData.devices as unknown as ApiDevice[]}
                /> */}

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