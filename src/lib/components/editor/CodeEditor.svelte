<!-- src/lib/components/editor/CodeEditor.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import MonacoEditor from './MonacoEditor.svelte'
  import { registerMermaidLanguage } from '$lib/utils/monaco-mermaid'
  
  onMount(() => {
    registerMermaidLanguage()
    
    // Listen for save events from Monaco
    window.addEventListener('editor-save', () => {
      // Trigger save from parent
      const event = new CustomEvent('save-requested')
      window.dispatchEvent(event)
    })
  })
</script>

<div class="editor-panel">
  <div class="editor-header">
    <h3>📝 Mermaid Code</h3>
    <div class="editor-controls">
      <button title="Format Code">🎨</button>
      <button title="Find & Replace">🔍</button>
    </div>
  </div>
  
  <div class="editor-content">
    <MonacoEditor />
  </div>
</div>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background);
  }
  
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--secondary);
    border-bottom: 1px solid var(--border);
  }
  
  .editor-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--foreground);
  }
  
  .editor-controls {
    display: flex;
    gap: 0.5rem;
  }
  
  .editor-controls button {
    background: none;
    border: 1px solid var(--border);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.75rem;
  }
  
  .editor-content {
    flex: 1;
    position: relative;
  }
</style>