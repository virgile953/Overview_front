import Modal from "@/app/ui/Modal/Modal";
import { useState } from "react";
import { Group } from "@/models/server/groups";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState<Partial<Group>>({
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
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });
      if (!res.ok) throw new Error("Failed to create group");
      onGroupCreated();
      onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Group name"
          value={newGroup.name}
          onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Localisation"
          value={newGroup.localisation}
          onChange={e => setNewGroup({ ...newGroup, localisation: e.target.value })}
        />
        <textarea
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Description"
          value={newGroup.description}
          onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
        />
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="User IDs (comma separated)"
          value={newGroup.users?.join(",")}
          onChange={e => setNewGroup({ ...newGroup, users: e.target.value.split(",").map(id => id.trim()).filter(Boolean) })}
        />
        <input
          readOnly
          type="text"
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Device IDs (comma separated)"
          value={newGroup.devices?.join(",")}
        // onChange={e => setNewGroup({ ...newGroup, devices: e.target.value.split(",").map(id => id.trim()).filter(Boolean) })}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          onClick={handleCreate}
          disabled={loading || !newGroup.name?.trim()}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </Modal>
  );
}
