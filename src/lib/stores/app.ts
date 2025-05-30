import { writable } from 'svelte/store';
import type { AppState } from '$lib/types';

function createAppStore() {
  const { subscribe, set, update } = writable<AppState>({
    isLoading: false,
    mmdcStatus: 'checking',
    currentTheme: 'dark',
  });

  return {
    subscribe,
    setLoading: (loading: boolean) => update((state) => ({ ...state, isLoading: loading })),
    setMmdcStatus: (status: AppState['mmdcStatus']) =>
      update((state) => ({ ...state, mmdcStatus: status })),
    setTheme: (theme: AppState['currentTheme']) => {
      update((state) => ({ ...state, currentTheme: theme }));
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);
    },
    reset: () => set({ isLoading: false, mmdcStatus: 'checking', currentTheme: 'dark' }),
  };
}

export const appStore = createAppStore();
