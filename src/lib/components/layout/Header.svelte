<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { editorStore } from '$lib/stores/editor';
  import { APP_NAME } from '$lib/utils/constants';

  $: ({ currentTheme } = $appStore);
  $: ({ currentFile, hasUnsavedChanges } = $editorStore);

  function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    appStore.setTheme(newTheme);
  }

  function getFileName(path: string | null): string {
    if (!path) return 'Untitled';
    return path.split('/').pop() || path.split('\\').pop() || path;
  }
</script>

<header class="header">
  <div class="header-left">
    <h1 class="app-title">{APP_NAME}</h1>
  </div>

  <div class="header-center">
    <div class="file-info">
      <span class="file-name">
        📄 {getFileName(currentFile)}
        {#if hasUnsavedChanges}
          <span class="unsaved-indicator">*</span>
        {/if}
      </span>
      {#if currentFile}
        <span class="file-path" title={currentFile}>{currentFile}</span>
      {/if}
    </div>
  </div>

  <div class="header-right">
    <button class="theme-toggle" on:click={toggleTheme} title="Toggle theme">
      {currentTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    min-height: 3rem;
  }

  .header-left,
  .header-right {
    flex: 0 0 auto;
    min-width: 200px;
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .app-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .file-info {
    text-align: center;
  }

  .file-name {
    display: block;
    font-weight: 500;
    color: var(--foreground);
  }

  .unsaved-indicator {
    color: var(--warning);
    font-weight: bold;
  }

  .file-path {
    display: block;
    font-size: 0.75rem;
    color: var(--muted-foreground);
    font-family: monospace;
    margin-top: 0.25rem;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
  }

  .theme-toggle {
    background: none;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
  }

  .theme-toggle:hover {
    background: var(--accent);
  }
</style>
