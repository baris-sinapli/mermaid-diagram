<script lang="ts">
  export let split: 'horizontal' | 'vertical' = 'vertical';
  export let minSize = 200;
  export let defaultSize = 50; // percentage

  let container: HTMLDivElement;
  let isDragging = false;
  let currentSize = defaultSize;

  function startDrag(event: MouseEvent) {
    isDragging = true;
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    event.preventDefault();
  }

  function handleDrag(event: MouseEvent) {
    if (!isDragging || !container) return;

    const rect = container.getBoundingClientRect();
    let percentage: number;

    if (split === 'vertical') {
      const x = event.clientX - rect.left;
      percentage = (x / rect.width) * 100;
    } else {
      const y = event.clientY - rect.top;
      percentage = (y / rect.height) * 100;
    }

    // Apply min/max constraints
    const minPercentage = (minSize / (split === 'vertical' ? rect.width : rect.height)) * 100;
    const maxPercentage = 100 - minPercentage;

    currentSize = Math.max(minPercentage, Math.min(maxPercentage, percentage));
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  }
</script>

<div class="split-pane split-{split}" class:dragging={isDragging} bind:this={container}>
  <div class="split-pane-left" style="{split === 'vertical' ? 'width' : 'height'}: {currentSize}%">
    <slot name="left" />
  </div>

  <div class="split-pane-divider" on:mousedown={startDrag} role="separator" tabindex="0" />

  <div
    class="split-pane-right"
    style="{split === 'vertical' ? 'width' : 'height'}: {100 - currentSize}%"
  >
    <slot name="right" />
  </div>
</div>

<style>
  .split-pane {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .split-vertical {
    flex-direction: row;
  }

  .split-horizontal {
    flex-direction: column;
  }

  .split-pane-left,
  .split-pane-right {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .split-pane-divider {
    background: var(--border);
    flex-shrink: 0;
    transition: background 0.2s;
  }

  .split-vertical .split-pane-divider {
    width: 1px;
    cursor: ew-resize;
  }

  .split-horizontal .split-pane-divider {
    height: 1px;
    cursor: ns-resize;
  }

  .split-pane-divider:hover,
  .dragging .split-pane-divider {
    background: var(--primary);
  }

  .dragging {
    user-select: none;
  }

  .dragging * {
    cursor: inherit !important;
  }
</style>
