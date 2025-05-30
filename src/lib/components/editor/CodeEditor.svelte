<script lang="ts">
  import { editorStore } from '$lib/stores/editor';
  import { onMount } from 'svelte';

  let textareaElement: HTMLTextAreaElement;

  $: ({ code } = $editorStore);

  onMount(() => {
    // Focus the editor on mount
    textareaElement?.focus();
  });

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    editorStore.setCode(target.value);
  }

  function handleKeydown(event: KeyboardEvent) {
    // Handle Tab key for indentation
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textareaElement.selectionStart;
      const end = textareaElement.selectionEnd;
      const value = textareaElement.value;

      // Insert spaces instead of tab
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      textareaElement.value = newValue;
      textareaElement.selectionStart = textareaElement.selectionEnd = start + 4;

      // Update store
      editorStore.setCode(newValue);
    }
  }
</script>

<div class="editor-panel">
  <div class="editor-header">
    <h3>📝 Mermaid Code</h3>
  </div>

  <div class="editor-content">
    <textarea
      bind:this={textareaElement}
      value={code}
      on:input={handleInput}
      on:keydown={handleKeydown}
      placeholder="Enter your Mermaid code here..."
      spellcheck="false"
      class="code-editor"
    ></textarea>
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

  .editor-content {
    flex: 1;
    position: relative;
  }

  .code-editor {
    width: 100%;
    height: 100%;
    padding: 1rem;
    border: none;
    background: var(--background);
    color: var(--foreground);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    outline: none;
    tab-size: 4;
  }

  .code-editor::placeholder {
    color: var(--muted-foreground);
  }

  .code-editor:focus {
    background: var(--background);
  }
</style>
