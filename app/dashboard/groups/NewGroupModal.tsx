import Modal from "@/app/ui/Modal/Modal";
import InputField from "@/app/ui/InputField";
import { useEffect, useState } from "react";
import { Group } from "@/models/server/groups";
import UserSelector from "@/app/ui/UserSelector";
import DeviceSelector from "@/app/ui/DeviceSelector";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state with string arrays for easier form handling
  const [formData, setFormData] = useState<Partial<Group>>({
    name: "",
    localisation: "",
    description: "",
    users: [],
    devices: [],
  });

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      // Convert form data to proper Group format for API
      const groupData = {
        name: formData.name,
        localisation: formData.localisation,
        description: formData.description,
        users: (formData.users ?? []).map(user => user && user.$id ? user.$id.trim() : "").filter(Boolean),
        devices: (formData.devices ?? []).map(device => device && device.id ? device.id.trim() : "").filter(Boolean),
      };

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData),
      });
      if (!res.ok) throw new Error("Failed to create group");
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
          onChange={(selected) => setFormData({ ...formData, devices: selected })}
          initialValue={formData.devices}
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
