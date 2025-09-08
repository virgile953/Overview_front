"use client";
import { User } from "@/models/server/users";
import { useEffect, useState } from "react";
import Select from "react-select";

interface UserSelectorProps {
  onChange?: (selected: User[]) => void;
}

export default function UserSelector({ onChange }: UserSelectorProps) {

  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h2 className="text-lg font-semibold mb-4">Select Users</h2>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <Select
        options={
          users ? users.map((user) => ({
            value: user.$id,
            label: user.name,
          })) : []
        }
        isMulti
        isLoading={loading}
        isDisabled={loading || !!error}
        loadingMessage={() => "Loading users..."}
        noOptionsMessage={() =>
          loading ? "Loading..." :
            error ? "Error loading users" :
              "No users available"
        }
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: "#1f2937", // Dark gray background
            borderColor: state.isDisabled ? "#4b5563" : state.isFocused ? "#10b981" : "#4b5563",
            color: "#f9fafb",
            opacity: state.isDisabled ? 0.6 : 1,
            cursor: state.isDisabled ? "not-allowed" : "default",
            "&:hover": {
              borderColor: state.isDisabled ? "#4b5563" : "#10b981",
            },
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: "#1f2937", // Dark background
            border: "1px solid #4b5563",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#374151" : "#1f2937", // Dark gray states
            color: "#f9fafb",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#374151",
            },
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#065f46", // Dark emerald
            borderRadius: "4px",
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: "#ecfdf5", // Light emerald text
            fontSize: "14px",
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: "#a7f3d0",
            "&:hover": {
              backgroundColor: "#047857",
              color: "#ecfdf5",
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#f9fafb",
          }),
          input: (provided) => ({
            ...provided,
            color: "#f9fafb",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
          }),
          loadingMessage: (provided) => ({
            ...provided,
            color: "#9ca3af",
          }),
          noOptionsMessage: (provided) => ({
            ...provided,
            color: "#9ca3af",
          }),
        }}
        className="basic-multi-select"
        classNamePrefix="select"
        isClearable
        isSearchable
        placeholder={loading ? "Loading users..." : "Choose users..."}
        onChange={(selected) => {
          if (onChange && users) {
            // Map selected options back to full User objects
            const selectedUsers = (selected as Array<{value: string, label: string}>)
              .map(option => users.find(user => user.$id === option.value))
              .filter((user): user is User => user !== undefined);
            
            onChange(selectedUsers);
          }
        }}
      />
    </div>
  );
}