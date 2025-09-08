"use client";
import { Group } from "@/models/server/groups";
import { useEffect, useState } from "react";
import Select from "react-select";

interface GroupSelectorProps {
  onChange?: (selected: Group[]) => void;
  initialValue?: Group[]; // Added initialValue prop to set selected groups from outside
}

export default function GroupSelector({ onChange, initialValue }: GroupSelectorProps) {

  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/groups");
        if (!res.ok) throw new Error("Failed to fetch groups");
        const data = await res.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h2 className="text-lg font-semibold mb-4">Select Group</h2>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <Select
        options={
          groups ? groups.map((group) => ({
            value: group.$id,
            label: group.name,
          })) : []
        }
        value={
          initialValue ? initialValue.map(group => ({
            value: group.$id,
            label: group.name,
          })) : null
        }
        onChange={(selectedOptions) => {
          if (onChange) {
            const selectedGroups = (selectedOptions as { value: string; label: string }[]).map(option => {
              const group = groups?.find(g => g.$id === option.value);
              return group!;
            });
            onChange(selectedGroups);
          }
        }}
        isMulti
        isLoading={loading}
        isDisabled={loading || !!error}
        loadingMessage={() => "Loading groups..."}
        noOptionsMessage={() =>
          loading ? "Loading..." :
            error ? "Error loading groups" :
              "No groups available"
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
        placeholder={loading ? "Loading groups..." : "Choose groups..."}
      />
    </div>
  );
}