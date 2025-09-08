"use client";
import { Device } from "@/models/server/devices";
import { useEffect, useState } from "react";
import Select from "react-select";

interface DeviceSelectorProps {
  onChange?: (selected: Device[]) => void;
}


export default function DeviceSelector({ onChange }: DeviceSelectorProps) {

  const [devices, setDevices] = useState<Device[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/devices");
        if (!res.ok) throw new Error("Failed to fetch devices");
        const data = await res.json();
        setDevices(data);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h2 className="text-lg font-semibold mb-4">Select Device</h2>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <Select
        options={
          devices ? devices.map((device) => ({
            value: device.$id,
            label: device.name,
          })) : []
        }
        isMulti
        isLoading={loading}
        isDisabled={loading || !!error}
        loadingMessage={() => "Loading devices..."}
        noOptionsMessage={() =>
          loading ? "Loading..." :
            error ? "Error loading devices" :
              "No devices available"
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
        placeholder={loading ? "Loading devices..." : "Choose devices..."}
        onChange={(selected) => {
          if (onChange && devices) {
            // Map selected options back to full Device objects
            const selectedDevices = (selected as Array<{ value: string, label: string }>)
              .map(option => devices.find(user => user.$id === option.value))
              .filter((user): user is Device => user !== undefined);

            onChange(selectedDevices);
          }
        }}
      />
    </div>
  );
}