<script>
  import { onMount } from 'svelte'
  import { invoke } from '@tauri-apps/api/core'
  import { open, save } from '@tauri-apps/plugin-dialog'
  import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
  
  // Type definitions
  /** @typedef {Object} DiagramResult
   * @property {boolean} success
   * @property {string} [output_path]
   * @property {string} [error_message]
   * @property {number} generation_time
   * @property {number} [file_size]
   */
  
  /** @typedef {Object} RecentFile
   * @property {string} path
   * @property {string} name
   */
  
  /** @typedef {Object} FileOperationResult
   * @property {boolean} success
   * @property {string} [message]
   */
  
  /** @typedef {Object} MermaidFile
   * @property {string} content
   * @property {string} path
   * @property {string} name
   */
  
  let mermaidCode = `graph TD
    A[Start] --> B(World)
    B --> C{Decision?}
    C -->|Yes| D[Result1]
    C -->|No| E[Result2]`
  
  let outputFormat = 'png'
  let outputWidth = '800'
  let outputHeight = '600'
  let backgroundColor = 'transparent'
  let isGenerating = false
  /** @type {DiagramResult | null} */
  let lastResult = null
  let mmdc_status = 'Kontrol ediliyor...'
  
  // File management variables
  /** @type {string | null} */
  let currentFilePath = null
  let hasUnsavedChanges = false
  /** @type {RecentFile[]} */
  let recentFiles = []
  
  /**
   * @returns {Promise<void>}
   */
  async function checkMmdc() {
    console.log('Checking mmdc...')
    try {
      const result = await invoke('check_mmdc')
      mmdc_status = /** @type {string} */ (result)
      console.log('mmdc status:', result)
    } catch (error) {
      mmdc_status = `❌ ${error}`
      console.error('mmdc error:', error)
    }
  }
  
  /**
   * @returns {Promise<void>}
   */
  async function generateDiagram() {
    if (!mermaidCode.trim()) {
      alert('Please enter Mermaid code!')
      return
    }
    
    isGenerating = true
    lastResult = null
    
    try {
      console.log('Calling generate_diagram with:', {
        code: mermaidCode,
        options: {
          format: outputFormat,
          width: outputWidth ? parseInt(outputWidth) : null,
          height: outputHeight ? parseInt(outputHeight) : null,
          background: backgroundColor
        }
      })
      
      const result = /** @type {DiagramResult} */ (await invoke('generate_diagram', {
        code: mermaidCode,
        options: {
          format: outputFormat,
          width: outputWidth ? parseInt(outputWidth) : null,
          height: outputHeight ? parseInt(outputHeight) : null,
          background: backgroundColor
        }
      }))
      
      console.log('Generate result:', result)
      lastResult = result
      
      if (result && result.success) {
        alert(`✅ Diagram generated successfully!\n📁 ${result.output_path}\n⏱️ ${result.generation_time}ms`)
      } else {
        alert(`❌ Error: ${result.error_message}`)
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert(`🚨 Unexpected error: ${error}`)
    } finally {
      isGenerating = false
    }
  }
  
  async function greet() {
    try {
      const result = await invoke('greet', { name: 'SvelteKit User' })
      alert(result)
    } catch (error) {
      alert(`Greet error: ${error}`)
    }
  }
  
  async function saveFile() {
    try {
      if (currentFilePath) {
        // Save to existing file
        const result = /** @type {FileOperationResult} */ (await invoke('write_mermaid_file', {
          path: currentFilePath,
          content: mermaidCode
        }))
        
        if (result.success) {
          hasUnsavedChanges = false
          alert(`💾 File saved: ${currentFilePath}`)
        } else {
          alert(`❌ Save error: ${result.message}`)
        }
      } else {
        // Save as new file
        await saveAsFile()
      }
    } catch (error) {
      alert(`❌ Save error: ${error}`)
    }
  }
  
  async function saveAsFile() {
    try {
      const filePath = await save({
        filters: [
          {
            name: 'Mermaid Files',
            extensions: ['mmd', 'mermaid']
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ],
        defaultPath: 'diagram.mmd'
      })
      
      if (filePath) {
        const result = /** @type {FileOperationResult} */ (await invoke('write_mermaid_file', {
          path: filePath,
          content: mermaidCode
        }))
        
        if (result.success) {
          currentFilePath = filePath
          hasUnsavedChanges = false
          await loadRecentFiles()
          alert(`💾 File saved: ${filePath}`)
        } else {
          alert(`❌ Save error: ${result.message}`)
        }
      }
    } catch (error) {
      alert(`❌ Save error: ${error}`)
    }
  }
  
  async function openFile() {
    try {
      const filePath = await open({
        filters: [
          {
            name: 'Mermaid Files',
            extensions: ['mmd', 'mermaid', 'md']
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ],
        multiple: false
      })
      
      if (filePath) {
        const fileData = /** @type {MermaidFile} */ (await invoke('read_mermaid_file', {
          path: filePath
        }))
        
        mermaidCode = fileData.content
        currentFilePath = filePath
        hasUnsavedChanges = false
        await loadRecentFiles()
        alert(`📂 File loaded: ${filePath}`)
      }
    } catch (error) {
      alert(`❌ Open error: ${error}`)
    }
  }
  
  async function newFile() {
    if (hasUnsavedChanges) {
      const shouldContinue = confirm('You have unsaved changes. Continue without saving?')
      if (!shouldContinue) return
    }
    
    mermaidCode = `graph TD
    A[Start] --> B(End)`
    currentFilePath = null
    hasUnsavedChanges = false
  }
  
  async function loadRecentFiles() {
    try {
      recentFiles = /** @type {RecentFile[]} */ (await invoke('get_recent_files'))
    } catch (error) {
      console.error('Failed to load recent files:', error)
    }
  }
  
  /**
   * @param {string} filePath
   */
  async function openRecentFile(filePath) {
    try {
      const fileData = /** @type {MermaidFile} */ (await invoke('read_mermaid_file', {
        path: filePath
      }))
      
      mermaidCode = fileData.content
      currentFilePath = filePath
      hasUnsavedChanges = false
      await loadRecentFiles()
    } catch (error) {
      alert(`❌ Error opening recent file: ${error}`)
      // Remove from recent files if it doesn't exist
      await loadRecentFiles()
    }
  }
  
  // Track changes
  function onCodeChange() {
    hasUnsavedChanges = true
  }
  
  /**
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault()
          newFile()
          break
        case 'o':
          event.preventDefault()
          openFile()
          break
        case 's':
          event.preventDefault()
          saveFile()
          break
        case 'e':
          event.preventDefault()
          generateDiagram()
          break
      }
    }
  }
  
  onMount(() => {
    console.log('Component mounted')
    checkMmdc()
    loadRecentFiles()
  })
</script>

<svelte:window on:keydown={handleKeydown} />

<main class="container">
  <!-- mmdc Status Section -->
  <section class="test-section">
    <h2>🧪 mmdc Status</h2>
    <div class="test-row">
      <span class="mmdc-status" class:success={mmdc_status.includes('✅')} class:error={mmdc_status.includes('❌')}>
        {mmdc_status}
      </span>
      <button on:click={checkMmdc}>🔄 Recheck</button>
      <button on:click={greet}>👋 Test Greet</button>
    </div>
  </section>
  
  <!-- Header -->
  <header class="header">
    <h1>🎨 Mermaid GUI v2.0</h1>
    <div class="file-info">
      {#if currentFilePath}
        <span class="file-path" title={currentFilePath}>
          📄 {currentFilePath.split('/').pop() || currentFilePath.split('\\').pop()}
          {#if hasUnsavedChanges}
            <span class="unsaved">*</span>
          {/if}
        </span>
      {:else}
        <span class="file-path">📄 Untitled{hasUnsavedChanges ? '*' : ''}</span>
      {/if}
    </div>
    <div class="status-info">
      SvelteKit + mmdc Integration ✅
    </div>
  </header>
  
  <!-- File Operations Bar -->
  <div class="file-bar">
    <div class="file-buttons">
      <button on:click={newFile} title="Ctrl+N">📄 New</button>
      <button on:click={openFile} title="Ctrl+O">📂 Open</button>
      <button on:click={saveFile} title="Ctrl+S" class:unsaved={hasUnsavedChanges}>💾 Save</button>
      <button on:click={saveAsFile}>💾 Save As</button>
    </div>
    
    {#if recentFiles.length > 0}
      <div class="recent-files">
        <label>Recent:</label>
        <select on:change={(e) => {
          const target = /** @type {HTMLSelectElement} */ (e.target)
          if (target.value) {
            openRecentFile(target.value)
            target.value = '' // Reset selection
          }
        }}>
          <option value="">Select recent file...</option>
          {#each recentFiles as file}
            <option value={file.path}>{file.name}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>
  
  <!-- Settings Bar -->
  <div class="settings-bar">
    <div class="setting-group">
      <label for="format">Format:</label>
      <select id="format" bind:value={outputFormat}>
        <option value="png">PNG</option>
        <option value="svg">SVG</option>
        <option value="pdf">PDF</option>
        <option value="jpg">JPG</option>
      </select>
    </div>
    
    <div class="setting-group">
      <label for="width">Genişlik:</label>
      <input id="width" type="number" bind:value={outputWidth} placeholder="800" />
    </div>
    
    <div class="setting-group">
      <label for="height">Yükseklik:</label>
      <input id="height" type="number" bind:value={outputHeight} placeholder="600" />
    </div>
    
    <div class="setting-group">
      <label for="bg">Arka Plan:</label>
      <input id="bg" type="text" bind:value={backgroundColor} placeholder="transparent" />
    </div>
    
    {#if lastResult}
      <div class="result-info">
        {#if lastResult && lastResult.success}
          <span class="success">✅ {lastResult.generation_time}ms</span>
        {:else}
          <span class="error">❌ Error</span>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Main Content -->
  <div class="main-content">
    <!-- Code Editor -->
    <div class="editor-panel">
      <h3>📝 Mermaid Code:</h3>
      <textarea 
        bind:value={mermaidCode}
        on:input={onCodeChange}
        placeholder="Enter your Mermaid code here..."
        spellcheck="false"
      ></textarea>
    </div>
    
    <!-- Preview Panel -->
    <div class="preview-panel">
      <h3>👁️ Test Results:</h3>
      <div class="preview-area">
        {#if lastResult}
          <div class="result-display">
            <h4>Last Result:</h4>
            <p><strong>Success:</strong> {lastResult.success ? 'Yes' : 'No'}</p>
            <p><strong>Time:</strong> {lastResult.generation_time}ms</p>
            {#if lastResult.output_path}
              <p><strong>Output:</strong> {lastResult.output_path}</p>
            {/if}
            {#if lastResult.error_message}
              <p class="error"><strong>Error:</strong> {lastResult.error_message}</p>
            {/if}
          </div>
        {:else}
          <div class="preview-placeholder">
            <p>🚀 Click 'Generate Diagram' to test</p>
            <p>mmdc Status: {mmdc_status}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Footer -->
  <footer class="footer">
    <button 
      class="generate-btn" 
      on:click={generateDiagram}
      disabled={isGenerating}
    >
              {isGenerating ? '⏳ Generating...' : '🚀 Generate Diagram'}
    </button>
    <span class="status">
      SvelteKit + Tauri v2.0 | Ctrl+N: New | Ctrl+O: Open | Ctrl+S: Save | Ctrl+E: Generate
    </span>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #1e1e1e;
    color: #ffffff;
    overflow: hidden;
  }
  
  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .test-section {
    padding: 1rem;
    background: #2d4a22;
    border-bottom: 1px solid #3e3e42;
  }
  
  .test-section h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }
  
  .test-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .mmdc-status {
    padding: 0.25rem 0.5rem;
    background: #3c3c3c;
    border-radius: 3px;
    font-family: monospace;
    min-width: 300px;
  }
  
  .test-row button {
    padding: 0.25rem 0.75rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .test-row button:hover {
    background: #34ce57;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #2d2d30;
    border-bottom: 1px solid #3e3e42;
  }
  
  .header h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .file-info {
    flex: 1;
    text-align: center;
  }
  
  .file-path {
    font-family: monospace;
    font-size: 0.9rem;
    color: #d4d4d4;
  }
  
  .unsaved {
    color: #ff6b6b;
    font-weight: bold;
  }
  
  .status-info {
    background: #28a745;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.9rem;
  }
  
  .file-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #3c3c3c;
    border-bottom: 1px solid #3e3e42;
    gap: 1rem;
  }
  
  .file-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .file-buttons button {
    padding: 0.4rem 0.8rem;
    background: #0e639c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
  }
  
  .file-buttons button:hover {
    background: #1177bb;
  }
  
  .file-buttons button.unsaved {
    background: #ff6b6b;
  }
  
  .file-buttons button.unsaved:hover {
    background: #ff5252;
  }
  
  .recent-files {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .recent-files label {
    font-size: 0.9rem;
    color: #d4d4d4;
  }
  
  .recent-files select {
    padding: 0.25rem 0.5rem;
    background: #2d2d30;
    color: white;
    border: 1px solid #464647;
    border-radius: 3px;
    min-width: 200px;
  }
  
  .settings-bar {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #252526;
    border-bottom: 1px solid #3e3e42;
    flex-wrap: wrap;
  }
  
  .setting-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .setting-group label {
    font-size: 0.9rem;
    min-width: 60px;
  }
  
  .setting-group select,
  .setting-group input {
    padding: 0.25rem 0.5rem;
    background: #3c3c3c;
    color: white;
    border: 1px solid #464647;
    border-radius: 3px;
    min-width: 80px;
  }
  
  .result-info {
    margin-left: auto;
  }
  
  .success {
    color: #28a745;
    font-weight: bold;
  }
  
  .error {
    color: #dc3545;
    font-weight: bold;
  }
  
  .main-content {
    flex: 1;
    display: flex;
    gap: 1px;
    min-height: 0;
  }
  
  .editor-panel,
  .preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
    min-width: 0;
  }
  
  .editor-panel h3,
  .preview-panel h3 {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #2d2d30;
    border-bottom: 1px solid #3e3e42;
    font-size: 1rem;
  }
  
  .editor-panel textarea {
    flex: 1;
    padding: 1rem;
    background: #1e1e1e;
    color: #d4d4d4;
    border: none;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    outline: none;
  }
  
  .preview-area {
    flex: 1;
    padding: 1rem;
    background: #1e1e1e;
    overflow: auto;
  }
  
  .result-display {
    background: #2d2d30;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #3e3e42;
  }
  
  .result-display h4 {
    margin: 0 0 0.5rem 0;
    color: #28a745;
  }
  
  .result-display p {
    margin: 0.25rem 0;
    word-break: break-all;
  }
  
  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    text-align: center;
  }
  
  .preview-placeholder p {
    margin: 0.5rem 0;
  }
  
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #007acc;
    color: white;
  }
  
  .generate-btn {
    padding: 0.5rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .generate-btn:hover:not(:disabled) {
    background: #34ce57;
  }
  
  .generate-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  .status {
    font-size: 0.9rem;
  }
</style>