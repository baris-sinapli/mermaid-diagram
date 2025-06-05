<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { editorStore } from '$lib/stores/editor';
  import { appStore } from '$lib/stores/app';

  export let onNew: () => void;
  export let onOpen: () => void;
  export let onSave: () => void;
  export let onGenerate: () => void;

  $: ({ hasUnsavedChanges, isGenerating } = $editorStore);
  $: ({ mmdcStatus } = $appStore);
</script>

<div class="toolbar">
  <div class="toolbar-group">
    <Button variant="ghost" size="sm" on:click={onNew} title="New file (Ctrl+N)">📄 New</Button>
    <Button variant="ghost" size="sm" on:click={onOpen} title="Open file (Ctrl+O)">📂 Open</Button>
    <Button
      variant="ghost"
      size="sm"
      class={hasUnsavedChanges ? 'unsaved' : ''}
      on:click={onSave}
      title="Save file (Ctrl+S)"
    >
      💾 Save
    </Button>
  </div>

  <div class="toolbar-group">
    <div class="mmdc-status status-{mmdcStatus}">
      <span class="status-indicator"></span>
      mmdc: {mmdcStatus}
    </div>
  </div>

  <div class="toolbar-group">
    <Button
      variant="primary"
      size="sm"
      disabled={mmdcStatus !== 'available' || isGenerating}
      loading={isGenerating}
      on:click={onGenerate}
      title="Generate diagram (Ctrl+E)"
    >
      🚀 Generate
    </Button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--secondary);
    border-bottom: 1px solid var(--border);
    gap: 1rem;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.toolbar .unsaved) {
    background: var(--warning) !important;
    color: var(--warning-foreground) !important;
  }

  .mmdc-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-family: monospace;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background: var(--background);
  }

  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-checking .status-indicator {
    background: var(--warning);
    animation: pulse 2s infinite;
  }

  .status-available .status-indicator {
    background: var(--success);
  }

  .status-unavailable .status-indicator {
    background: var(--destructive);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  :global(.toolbar button) {
    transition: background-color 0.2s ease, transform 0.15s ease;
    cursor: pointer;
  }

  :global(.toolbar button:hover:not(:disabled)) {
    background-color: var(--accent);
    transform: translateY(-1px);
    color: var(--accent-foreground);
  }

  :global(.toolbar button.unsaved:hover:not(:disabled)) {
    background-color: var(--warning);
    color: var(--warning-foreground);
    transform: translateY(-1px);
  }

  :global(.toolbar button:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none !important;
  }
</style>
