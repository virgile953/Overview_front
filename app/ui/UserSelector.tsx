"use client";
import { Users } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import Select from "react-select";

interface UserSelectorProps {
  onChange?: (selected: Users[]) => void;
  initialValue?: Users[];
}

export default function UserSelector({ onChange, initialValue }: UserSelectorProps) {

  const [users, setUsers] = useState<Users[] | null>(null);
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
    <div className="p-4 border border-border rounded">
      <h2 className="text-lg font-semibold mb-4">Select Users</h2>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <Select
        options={
          users ? users.map((user) => ({
            value: user.id,
            label: user.name,
          })) : []
        }
        value={
          initialValue ? initialValue.map(user => ({
            value: user.id,
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
            backgroundColor: "var(--card)",
            borderColor: state.isDisabled
              ? "var(--border)"
              : state.isFocused
                ? "var(--ring)"
                : "var(--border)",
            color: "var(--foreground)",
            cursor: state.isDisabled ? "not-allowed" : "default",
            "&:hover": {
              borderColor: state.isDisabled ? "var(--border)" : "var(--ring)",
            },
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 9999,
          }),
          menuList: (provided) => ({
            ...provided,
            backgroundColor: "var(--card)",
            borderRadius: "6px",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? "var(--sidebar-accent)"
              : state.isFocused
                ? "var(--accent)"
                : "var(--card)",
            color: state.isSelected
              ? "var(--sidebar-accent-foreground)"
              : state.isFocused
                ? "var(--accent-foreground)"
                : "var(--card-foreground)",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: state.isSelected
                ? "var(--sidebar-accent)"
                : "var(--accent)",
              color: state.isSelected
                ? "var(--sidebar-accent-foreground)"
                : "var(--accent-foreground)",
            },
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: "var(--sidebar-accent)",
            border: "1px solid var(--sidebar-border)",
            borderRadius: "4px",
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: "var(--sidebar-accent-foreground)",
            fontSize: "14px",
            backgroundColor: "transparent",
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: "var(--sidebar-accent-foreground)",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "var(--destructive)",
              color: "var(--primary-foreground)",
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "var(--foreground)",
          }),
          input: (provided) => ({
            ...provided,
            color: "var(--foreground)",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "var(--muted-foreground)",
          }),
          loadingMessage: (provided) => ({
            ...provided,
            color: "var(--muted-foreground)",
            backgroundColor: "var(--card)",
          }),
          noOptionsMessage: (provided) => ({
            ...provided,
            color: "var(--muted-foreground)",
            backgroundColor: "var(--card)",
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
            const selectedUsers = (selected as Array<{ value: string, label: string }>)
              .map(option => users.find(user => user.id === option.value))
              .filter((user): user is Users => user !== undefined);

            onChange(selectedUsers);
          }
        }}
      />
    </div>
  );
}