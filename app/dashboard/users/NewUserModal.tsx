import InputField from "@/app/ui/InputField";
import Modal from "@/app/ui/Modal/Modal";
import { useState } from "react";
import { User } from "@/models/server/users";
import GroupSelector from "../../ui/GroupSelector";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function NewUserModal({ isOpen, onClose, onUserCreated }: NewUserModalProps) {

  const [newUser, setNewUser] = useState<Omit<User, '$id'>>({
    name: "",
    last_name: "",
    email: "",
    service: "",
    function: "",
    title: "",
    groups: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        throw new Error("Failed to create user");
      }
      onUserCreated();
      onClose();
      // Reset form
      setNewUser({
        name: "",
        last_name: "",
        email: "",
        service: "",
        function: "",
        title: "",
        groups: [],
      });
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
    // Reset form
    setNewUser({
      name: "",
      last_name: "",
      email: "",
      service: "",
      function: "",
      title: "",
      groups: [],
    });
  };

  return (
    <Modal title="Create New User" onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            type="text"
            placeholder="First Name *"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />

          <InputField
            type="text"
            placeholder="Last Name"
            value={newUser.last_name}
            onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
          />
        </div>

        <InputField
          type="email"
          placeholder="Email Address *"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            type="text"
            placeholder="Service/Department"
            value={newUser.service}
            onChange={(e) => setNewUser({ ...newUser, service: e.target.value })}
          />

          <InputField
            type="text"
            placeholder="Function/Role"
            value={newUser.function}
            onChange={(e) => setNewUser({ ...newUser, function: e.target.value })}
          />
        </div>

        <InputField
          type="text"
          placeholder="Job Title"
          value={newUser.title}
          onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
        />

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Groups (comma-separated)
          </label>
          <InputField
            type="text"
            placeholder="group1, group2, group3"
            value={newUser.groups.join(", ")}
            onChange={(e) => {
              const groupsArray = e.target.value
                .split(",")
                .map(group => group.trim())
                .filter(group => group.length > 0);
              setNewUser({ ...newUser, groups: groupsArray });
            }}
          />
        </div> */}

        <GroupSelector 
          initialValue={newUser.groups}
          onChange={(groups) => setNewUser({ ...newUser, groups })}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
            disabled={isSubmitting || !newUser.name || !newUser.email}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}