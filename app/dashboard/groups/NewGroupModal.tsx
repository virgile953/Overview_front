import Modal from "@/app/ui/Modal/Modal";
import InputField from "@/app/ui/InputField";
import { useEffect, useState } from "react";
import UserSelector from "@/app/ui/UserSelector";
import DeviceSelector from "@/app/ui/DeviceSelector";
import { createGroup } from "@/lib/groups/groups";
import { useSession } from "@/lib/auth-client";
import { GroupWithRelations } from "@/lib/db/schema";
import { ApiDevice } from "@/lib/devices/devices";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  // Form state with string arrays for easier form handling
  const [formData, setFormData] = useState<Partial<GroupWithRelations>>({
    name: "",
    localisation: "",
    description: "",
    users: [],
    devices: [],
  });

  async function handleCreate() {
    setLoading(true);
    setError(null);
    if (!session?.data?.session.activeOrganizationId) {
      setError("No active organization");
      setLoading(false);
      return;
    }
    try {
      // Convert form data to proper Group format for API
      const groupData = {
        name: formData.name || "",
        localisation: formData.localisation || "",
        description: formData.description || "",
        users: formData.users ?? [],
        devices: formData.devices ?? [],
      };
      const newGroup = await createGroup({
        name: groupData.name,
        localisation: groupData.localisation,
        description: groupData.description,
        organizationId: session?.data?.session.activeOrganizationId,
        devices: groupData.devices,
        users: groupData.users,
      });
      console.log("Created group:", newGroup);
      // const res = await fetch("/api/groups", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(groupData),
      // });
      // if (!res.ok) throw new Error("Failed to create group");
      if (!newGroup) throw new Error("Failed to create group");
      onGroupCreated();
      onClose();
      // Reset form
      setFormData({
        name: "",
        localisation: "",
        description: "",
        users: [],
        devices: [],
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("Form data changed:", formData);
  }, [formData]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group">
      <div className="flex flex-col gap-4">
        <InputField
          type="text"
          placeholder="Group Name *"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <InputField
          type="text"
          placeholder="Location"
          value={formData.localisation}
          onChange={e => setFormData({ ...formData, localisation: e.target.value })}
        />

        <InputField
          type="textarea"
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
        <UserSelector
          onChange={(selected) => setFormData({ ...formData, users: selected })}
          initialValue={formData.users}
        />
        <DeviceSelector
          onChange={(selected) =>
            setFormData({ ...formData, devices: selected.filter(device => device.id !== undefined) as any })}
          initialValue={formData.devices as unknown as ApiDevice[]}
        />
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
            onClick={handleCreate}
            disabled={loading || !formData.name?.trim()}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
