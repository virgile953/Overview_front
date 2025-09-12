"use client";
import { useState, useEffect } from "react";

interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  mfa: boolean;
  status: boolean;
  registration: string;
  passwordUpdate: string;
  accessedAt: string;
  labels: string[];
  prefs: Record<string, string>;
  targets: Array<{
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    userId: string;
    providerId: string | null;
    providerType: string;
    identifier: string;
    expired: boolean;
  }>;
}

export default function ProfilePage() {
  const [data, setData] = useState<User | null>(null);
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [editedPrefs, setEditedPrefs] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/auth/user");
      const result = await response.json();
      setData(result.user);
      setEditedPrefs(result.user?.prefs || {});
    }
    fetchData();
  }, []);

  const handleEditPrefs = () => {
    setIsEditingPrefs(true);
    setEditedPrefs(data?.prefs || {});
  };

  const handleCancelEdit = () => {
    setIsEditingPrefs(false);
    setEditedPrefs(data?.prefs || {});
  };

  const handleSavePrefs = async () => {
    if (!data) return;
    
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
        const result = await response.json();
        setData(result.user);
        setIsEditingPrefs(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: boolean, label: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}>
      {status ? '✓' : '✗'} {label}
    </span>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information and settings</p>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                <p className="text-foreground">{data.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">User ID</label>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{data.$id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                <p className="text-foreground">{data.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                <p className="text-foreground">{data.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Security & Verification Card */}
          <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Security & Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Account Status</label>
                {getStatusBadge(data.status, data.status ? 'Active' : 'Inactive')}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Multi-Factor Authentication</label>
                {getStatusBadge(data.mfa, data.mfa ? 'Enabled' : 'Disabled')}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Verification</label>
                {getStatusBadge(data.emailVerification, data.emailVerification ? 'Verified' : 'Unverified')}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Verification</label>
                {getStatusBadge(data.phoneVerification, data.phoneVerification ? 'Verified' : 'Unverified')}
              </div>
            </div>
          </div>

          {/* Account Timeline Card */}
          <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Registration Date</label>
                <p className="text-foreground">{formatDate(data.registration)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Password Update</label>
                <p className="text-foreground">{formatDate(data.passwordUpdate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Profile Last Updated</label>
                <p className="text-foreground">{formatDate(data.$updatedAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Access</label>
                <p className="text-foreground">{formatDate(data.accessedAt)}</p>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
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
            
            {data?.prefs && Object.keys(data.prefs).length > 0 ? (
              <div className="space-y-3">
                {!isEditingPrefs ? (
                  // Display mode
                  Object.entries(data.prefs).map(([key, value]) => (
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

          {/* Authentication Targets Card */}
          {data.targets && data.targets.length > 0 && (
            <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Authentication Methods</h2>
              <div className="space-y-3">
                {data.targets.map((target) => (
                  <div key={target.$id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {target.providerType}
                        </span>
                        {!target.expired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{target.identifier}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Added {formatDate(target.$createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labels Card - if any exist */}
          {data.labels && data.labels.length > 0 && (
            <div className="bg-sidebar-accent rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Account Labels</h2>
              <div className="flex flex-wrap gap-2">
                {data.labels.map((label, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile information...</p>
          </div>
        </div>
      )}
    </div>
  );
}