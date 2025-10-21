export interface DeviceCacheSettings {
  offlineThresholdMs: number; // Time before marking device as offline
  removeThresholdMs: number; // Time before removing cache-only devices
  checkIntervalMs: number; // How often to run cleanup checks
}

// Default settings
const defaultSettings: DeviceCacheSettings = {
  offlineThresholdMs: 1 * 60 * 1000, // 1 minute
  removeThresholdMs: 5 * 60 * 1000, // 5 minutes
  checkIntervalMs: 60 * 1000, // 1 minute
};

let currentSettings = { ...defaultSettings };

export const DeviceCacheSettingsManager = {
  getSettings(): DeviceCacheSettings {
    return { ...currentSettings };
  },

  updateSettings(settings: Partial<DeviceCacheSettings>): void {
    currentSettings = { ...currentSettings, ...settings };
  },

  resetToDefaults(): void {
    currentSettings = { ...defaultSettings };
  },

  // Convenience methods for individual settings
  setOfflineThreshold(ms: number): void {
    currentSettings.offlineThresholdMs = ms;
  },

  setRemoveThreshold(ms: number): void {
    currentSettings.removeThresholdMs = ms;
  },

  setCheckInterval(ms: number): void {
    currentSettings.checkIntervalMs = ms;
  },
};
