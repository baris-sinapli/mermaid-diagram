import { writable } from 'svelte/store';
import type { SettingsState } from '$lib/types';

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'dark',
  autoSave: true,
  autoSaveInterval: 30000,
  defaultOutputFormat: 'png',
  fontSize: 14,
};

function createSettingsStore() {
  // Load from localStorage if available
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem('mermaid-gui-settings') : null;
  const initial = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;

  const { subscribe, set, update } = writable<SettingsState>(initial);

  return {
    subscribe,
    update: (updater: (settings: SettingsState) => SettingsState) => {
      update((settings) => {
        const newSettings = updater(settings);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('mermaid-gui-settings', JSON.stringify(newSettings));
        }
        return newSettings;
      });
    },
    set: (settings: SettingsState) => {
      set(settings);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mermaid-gui-settings', JSON.stringify(settings));
      }
    },
    reset: () => {
      set(DEFAULT_SETTINGS);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mermaid-gui-settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    },
  };
}

export const settingsStore = createSettingsStore();
