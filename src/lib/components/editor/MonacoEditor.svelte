<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { editorStore } from '$lib/stores/editor'
  import * as monaco from 'monaco-editor'
  
  let container: HTMLDivElement
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  
  $: ({ code } = $editorStore)
  
  onMount(async () => {
    // Monaco editor configuration
    monaco.editor.defineTheme('mermaid-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'comment', foreground: '6A9955' }
      ],
      colors: {
        'editor.background': '#0f0f23',
        'editor.foreground': '#ffffff'
      }
    })
    
    // Create editor
    editor = monaco.editor.create(container, {
      value: code,
      language: 'markdown', // Mermaid syntax benzer
      theme: 'mermaid-dark',
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      wordWrap: 'on',
      autoIndent: 'advanced',
      formatOnPaste: true,
      renderLineHighlight: 'all',
      scrollBeyondLastLine: false,
      automaticLayout: true
    })
    
    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const newValue = editor?.getValue() || ''
      editorStore.setCode(newValue)
    })
    
    // Keyboard shortcuts
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        // Trigger save
        window.dispatchEvent(new CustomEvent('editor-save'))
      }
    )
  })
  
  onDestroy(() => {
    editor?.dispose()
  })
  
  // Update editor content when store changes (external changes)
  $: if (editor && editor.getValue() !== code) {
    editor.setValue(code)
  }
</script>

<div class="monaco-container" bind:this={container}></div>

<style>
  .monaco-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
  }
</style>