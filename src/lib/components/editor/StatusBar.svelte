<script lang="ts">
  import { editorStore } from '$lib/stores/editor';
  import { appStore } from '$lib/stores/app';
  import { formatTimeAgo } from '$lib/utils/formatting';

  $: ({ code, currentFile } = $editorStore);
  $: ({ mmdcStatus } = $appStore);

  // Calculate document stats
  $: lines = code.split('\n').length;
  $: characters = code.length;
  $: words = code
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
</script>

<div class="status-bar">
  <div class="status-section">
    <span class="status-item">
      <span class="status-indicator status-{mmdcStatus}"></span>
      mmdc: {mmdcStatus}
    </span>
  </div>

  <div class="status-section">
    <span class="status-item">📊 Ln {lines}, Ch {characters}</span>
    <span class="status-item">📝 {words} words</span>
  </div>

  <div class="status-section"></div>
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.875rem;
    border-top: 1px solid var(--border);
  }

  .status-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }

  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-checking {
    background: var(--warning);
    animation: pulse 2s infinite;
  }

  .status-available {
    background: var(--success);
  }

  .status-unavailable {
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
</style>
