"use client";
import { useState } from "react";
import { User } from "../types";
import { useRouter } from "next/navigation";

interface UserPreferencesProps {
  user: User;
}

export default function UserPreferences({ user }: UserPreferencesProps) {
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [editedPrefs, setEditedPrefs] = useState<Record<string, string>>(user.prefs || {});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleEditPrefs = () => {
    setIsEditingPrefs(true);
    setEditedPrefs(user.prefs || {});
  };

  const handleCancelEdit = () => {
    setIsEditingPrefs(false);
    setEditedPrefs(user.prefs || {});
  };

  const handleSavePrefs = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefs: editedPrefs }),
      });

      if (response.ok) {
        setIsEditingPrefs(false);
        router.refresh(); // Refresh the page to get updated data
      } else {
        console.error("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrefChange = (key: string, value: string) => {
    setEditedPrefs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddPref = () => {
    const key = prompt("Enter preference key:");
    if (key && !editedPrefs.hasOwnProperty(key)) {
      setEditedPrefs(prev => ({
        ...prev,
        [key]: ""
      }));
    }
  };

  const handleRemovePref = (key: string) => {
    setEditedPrefs(prev => {
      const newPrefs = { ...prev };
      delete newPrefs[key];
      return newPrefs;
    });
  };

  return (
    <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">User Preferences</h2>
        {!isEditingPrefs ? (
          <button
            onClick={handleEditPrefs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Edit Preferences
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePrefs}
              disabled={isSaving}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
      
      {user.prefs && Object.keys(user.prefs).length > 0 ? (
        <div className="space-y-3">
          {!isEditingPrefs ? (
            // Display mode
            Object.entries(user.prefs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-foreground capitalize">{key}</span>
                <span className="text-muted-foreground">{String(value)}</span>
              </div>
            ))
          ) : (
            // Edit mode
            <div className="space-y-3">
              {Object.entries(editedPrefs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="font-medium text-foreground capitalize min-w-20">{key}:</label>
                  <input
                    type="text"
                    value={String(value)}
                    onChange={(e) => handlePrefChange(key, e.target.value)}
                    className="flex-1 px-3 py-1 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => handleRemovePref(key)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddPref}
                className="w-full py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                + Add New Preference
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No preferences set</p>
          {!isEditingPrefs ? (
            <button
              onClick={handleEditPrefs}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Add Preferences
            </button>
          ) : (
            <button
              onClick={handleAddPref}
              className="px-4 py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + Add New Preference
            </button>
          )}
        </div>
      )}
    </div>
  );
}
