import { writable } from 'svelte/store';
import type { FileState, RecentFile } from '$lib/types';

function createFileStore() {
  const { subscribe, set, update } = writable<FileState>({
    recentFiles: [],
    currentDirectory: null,
  });

  return {
    subscribe,
    setRecentFiles: (files: RecentFile[]) => update((state) => ({ ...state, recentFiles: files })),
    addRecentFile: (file: RecentFile) =>
      update((state) => ({
        ...state,
        recentFiles: [file, ...state.recentFiles.filter((f) => f.path !== file.path)].slice(0, 10),
      })),
    setCurrentDirectory: (directory: string | null) =>
      update((state) => ({ ...state, currentDirectory: directory })),
    clearRecentFiles: () => update((state) => ({ ...state, recentFiles: [] })),
  };
}

export const fileStore = createFileStore();
