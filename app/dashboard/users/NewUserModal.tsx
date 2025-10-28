import InputField from "@/app/ui/InputField";
import Modal from "@/app/ui/Modal/Modal";
import { useState } from "react";
import GroupSelector from "../../ui/GroupSelector";
import { NewUsers } from "@/lib/db/schema";
import { createUser } from "@/lib/users/users";
import { useSession } from "@/lib/auth-client";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function NewUserModal({ isOpen, onClose, onUserCreated }: NewUserModalProps) {
  const { data } = useSession();
  const [newUser, setNewUser] = useState<NewUsers>({
    name: "",
    lastName: "",
    email: "",
    service: "",
    function: "",
    title: "",
    organizationId: "",
  });

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = data?.session.activeOrganizationId;
    if (!orgId) {
      console.error("No active organization ID found in session");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await createUser({
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        service: newUser.service,
        function: newUser.function,
        organizationId: orgId,
      }, orgId);
      if (res == null) {
        throw new Error("Failed to create user");
      }
      onUserCreated();
      onClose();
      setNewUser({
        name: "",
        lastName: "",
        email: "",
        service: "",
        function: "",
        title: "",
        organizationId: "",
      });
      setSelectedGroupIds([]);
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
      lastName: "",
      email: "",
      service: "",
      function: "",
      title: "",
      organizationId: "",
    });
    setSelectedGroupIds([]);
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
            placeholder="Last Name *"
            value={newUser.lastName}
            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
            required
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
            placeholder="Service/Department *"
            value={newUser.service}
            onChange={(e) => setNewUser({ ...newUser, service: e.target.value })}
            required
          />

          <InputField
            type="text"
            placeholder="Function/Role *"
            value={newUser.function}
            onChange={(e) => setNewUser({ ...newUser, function: e.target.value })}
            required
          />
        </div>

        <InputField
          type="text"
          placeholder="Job Title (Optional)"
          value={newUser.title || ""}
          onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
        />

        <GroupSelector
          selectedGroupIds={selectedGroupIds}
          onChange={setSelectedGroupIds}
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
            disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.service || !newUser.function}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}