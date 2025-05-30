<script lang="ts">
  import { editorStore } from '$lib/stores/editor';

  $: ({ previewSvg, isGenerating, lastError } = $editorStore);
</script>

<div class="preview-panel">
  <div class="preview-header">
    <h3>👁️ Preview</h3>
    <div class="preview-controls">
      <!-- TODO: Add zoom controls -->
      <button class="control-btn" title="Zoom in">🔍+</button>
      <button class="control-btn" title="Zoom out">🔍-</button>
      <button class="control-btn" title="Reset zoom">↺</button>
    </div>
  </div>

  <div class="preview-content">
    {#if isGenerating}
      <div class="preview-loading">
        <div class="spinner"></div>
        <p>Generating preview...</p>
      </div>
    {:else if lastError}
      <div class="preview-error">
        <h4>❌ Preview Error</h4>
        <p>{lastError}</p>
      </div>
    {:else if previewSvg}
      <div class="preview-svg">
        {@html previewSvg}
      </div>
    {:else}
      <div class="preview-empty">
        <p>Enter Mermaid code to see preview</p>
        <p class="hint">Live preview will appear here</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .preview-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--secondary);
    border-bottom: 1px solid var(--border);
  }

  .preview-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--foreground);
  }

  .preview-controls {
    display: flex;
    gap: 0.25rem;
  }

  .control-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.75rem;
  }

  .control-btn:hover {
    background: var(--accent);
  }

  .preview-content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }

  .preview-loading,
  .preview-error,
  .preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--muted-foreground);
  }

  .preview-loading .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .preview-error {
    color: var(--destructive);
  }

  .preview-error h4 {
    margin: 0 0 0.5rem;
  }

  .preview-error p {
    margin: 0;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .preview-empty .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .preview-svg {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
  }

  .preview-svg :global(svg) {
    max-width: 100%;
    height: auto;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
