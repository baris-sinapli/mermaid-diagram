<script lang="ts">
  import { editorStore } from '$lib/stores/editor'
  import { onMount } from 'svelte'
  import { previewService } from '$lib/services/preview-service';
  
  $: ({ previewSvg, isGenerating, lastError } = $editorStore)
  
  let previewContainer: HTMLDivElement
  let zoomLevel = 1
  let panX = 0
  let panY = 0
  let isDragging = false
  
  function handleManualRefresh() {
    previewService.triggerPreview()
  }

  function handleZoomIn() {
    zoomLevel = Math.min(zoomLevel * 1.2, 3)
    updateTransform()
  }
  
  function handleZoomOut() {
    zoomLevel = Math.max(zoomLevel / 1.2, 0.1)
    updateTransform()
  }
  
  function handleResetZoom() {
    zoomLevel = 1
    panX = 0
    panY = 0
    updateTransform()
  }
  
  function updateTransform() {
    if (previewContainer) {
      const svg = previewContainer.querySelector('svg')
      if (svg) {
        svg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`
      }
    }
  }
  
  function handleMouseDown(event: MouseEvent) {
    if (event.button === 0) { // Left click
      isDragging = true
      const startX = event.clientX - panX
      const startY = event.clientY - panY
      
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          panX = e.clientX - startX
          panY = e.clientY - startY
          updateTransform()
        }
      }
      
      const handleMouseUp = () => {
        isDragging = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }
  
  function handleWheel(event: WheelEvent) {
    event.preventDefault()
    if (event.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }
  
  onMount(() => {
    updateTransform()
  })
  
  $: if (previewSvg) {
    // SVG yüklendiğinde transform'u güncelle
    setTimeout(updateTransform, 10)
  }
</script>

<div class="preview-panel">
  <div class="preview-header">
    <h3>👁️ Live Preview</h3>
    <div class="preview-controls">
      <button class="control-btn" on:click={handleManualRefresh} title="Refresh preview">🔃</button>
      <button class="control-btn" on:click={handleZoomIn} title="Zoom in">🔍+</button>
      <button class="control-btn" on:click={handleZoomOut} title="Zoom out">🔍-</button>
      <button class="control-btn" on:click={handleResetZoom} title="Reset zoom">🔄</button>
      <span class="zoom-level">{Math.round(zoomLevel * 100)}%</span>
    </div>
  </div>
  
  <div class="preview-content" 
       role="button"
       tabindex="0"
       on:mousedown={handleMouseDown}
       on:wheel={handleWheel}
       class:dragging={isDragging}>
    
    {#if isGenerating}
      <div class="preview-loading">
        <div class="spinner"></div>
        <p>Generating preview...</p>
      </div>
      
    {:else if lastError}
      <div class="preview-error">
        <h4>❌ Syntax Error</h4>
        <pre class="error-details">{lastError}</pre>
        <p class="error-hint">💡 Check your Mermaid syntax</p>
      </div>
      
    {:else if previewSvg}
      <div class="preview-svg" bind:this={previewContainer}>
        {@html previewSvg}
      </div>
      
    {:else}
      <div class="preview-empty">
        <div class="empty-icon">📊</div>
        <p>Enter Mermaid code to see live preview</p>
        <p class="hint">Changes will appear here in real-time</p>
      </div>
    {/if}
  </div>
  
  <div class="preview-footer">
    <span class="status-text">
      {#if isGenerating}
        ⏳ Generating...
      {:else if lastError}
        ❌ Error
      {:else if previewSvg}
        ✅ Ready
      {:else}
        ⌛ Waiting for input
      {/if}
    </span>
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
    align-items: center;
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
    color: var(--foreground);
  }
  
  .control-btn:hover {
    background: var(--accent);
  }
  
  .zoom-level {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-left: 0.5rem;
    font-family: monospace;
  }
  
  .preview-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    cursor: grab;
  }
  
  .preview-content.dragging {
    cursor: grabbing;
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
    padding: 2rem;
  }
  
  .preview-loading {
    color: var(--muted-foreground);
  }
  
  .spinner {
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
    margin: 0 0 1rem;
    color: var(--destructive);
  }
  
  .error-details {
    background: var(--muted);
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
    font-size: 0.875rem;
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  
  .error-hint {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
  }
  
  .preview-empty {
    color: var(--muted-foreground);
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    opacity: 0.7;
  }
  
  .preview-svg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .preview-svg :global(svg) {
    max-width: none;
    max-height: none;
    transition: transform 0.1s ease;
    transform-origin: center;
  }
  
  .preview-footer {
    padding: 0.5rem 1rem;
    background: var(--muted);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-text {
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>