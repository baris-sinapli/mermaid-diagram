import { writable } from 'svelte/store';
import { debounce } from '$lib/utils/debounce';
import { DEFAULT_MERMAID_CODE, DEBOUNCE_DELAY } from '$lib/utils/constants';
import type { EditorState } from '$lib/types';

function createEditorStore() {
  const { subscribe, set, update } = writable<EditorState>({
    code: DEFAULT_MERMAID_CODE,
    hasUnsavedChanges: false,
    currentFile: null,
    previewSvg: '',
    isGenerating: false,
    lastError: null,
  });

  // Debounced code change handler
  const debouncedCodeChange = debounce(() => {
    update((state) => ({ ...state, hasUnsavedChanges: true }));
    // TODO: Trigger preview generation here
  }, DEBOUNCE_DELAY);

  return {
    subscribe,
    setCode: (code: string) => {
      update((state) => ({ ...state, code }));
      debouncedCodeChange();
    },
    setFile: (filePath: string | null) =>
      update((state) => ({ ...state, currentFile: filePath, hasUnsavedChanges: false })),
    setPreview: (svg: string) =>
      update((state) => ({ ...state, previewSvg: svg, isGenerating: false })),
    setGenerating: (generating: boolean) =>
      update((state) => ({ ...state, isGenerating: generating })),
    setError: (error: string | null) => update((state) => ({ ...state, lastError: error })),
    markSaved: () => update((state) => ({ ...state, hasUnsavedChanges: false })),
    reset: () =>
      set({
        code: DEFAULT_MERMAID_CODE,
        hasUnsavedChanges: false,
        currentFile: null,
        previewSvg: '',
        isGenerating: false,
        lastError: null,
      }),
  };
}

export const editorStore = createEditorStore();
