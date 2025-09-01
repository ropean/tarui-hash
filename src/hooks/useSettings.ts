import { useState, useCallback, useEffect } from 'react';

interface Settings {
  uppercase: boolean;
  autoHash: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  uppercase: false,
  autoHash: true,
};

const SETTINGS_KEY = 'tauri-hash256-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K, 
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}
