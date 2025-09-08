import Modal from "@/app/ui/Modal/Modal";
import InputField from "@/app/ui/InputField";
import { User } from "@/models/server/users";
import { useEffect, useState } from "react";
import GroupSelector from "@/app/ui/GroupSelector";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User;
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {

  const [localUser, setLocalUser] = useState<User>(user);

  async function handleSave() {
    const ret = await fetch(`/api/users/${localUser.$id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localUser),
    });
    if (ret.ok) {
      const data = await ret.json();
      onSave(data);
      onClose();
    } else {
      console.error("Failed to save user");
    }
  }


  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  if (!isOpen) return null;
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            type="text"
            placeholder="First Name"
            value={localUser.name}
            onChange={(e) => setLocalUser({ ...localUser, name: e.target.value })}
          />

          <InputField
            type="text"
            placeholder="Last Name"
            value={localUser.last_name || ""}
            onChange={(e) => setLocalUser({ ...localUser, last_name: e.target.value })}
          />
        </div>

        <InputField
          type="email"
          placeholder="Email Address"
          value={localUser.email}
          onChange={(e) => setLocalUser({ ...localUser, email: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            type="text"
            placeholder="Service/Department"
            value={localUser.service || ""}
            onChange={(e) => setLocalUser({ ...localUser, service: e.target.value })}
          />

          <InputField
            type="text"
            placeholder="Function/Role"
            value={localUser.function || ""}
            onChange={(e) => setLocalUser({ ...localUser, function: e.target.value })}
          />
        </div>

        <InputField
          type="text"
          placeholder="Job Title"
          value={localUser.title || ""}
          onChange={(e) => setLocalUser({ ...localUser, title: e.target.value })}
        />

        <GroupSelector
          initialValue={localUser.groups}
          onChange={(groups) => setLocalUser({ ...localUser, groups })}
        />

        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          {/* Future edit functionality can be added here */}
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
