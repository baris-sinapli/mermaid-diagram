<script lang="ts">
  export let open = false;
  export let title = '';
  export let description = '';

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      open = false;
    }
  }
</script>

{#if open}
  <div
    class="dialog-overlay"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <div class="dialog-content">
      {#if title}
        <div class="dialog-header">
          <h2 id="dialog-title" class="dialog-title">{title}</h2>
          {#if description}
            <p id="dialog-description" class="dialog-description">{description}</p>
          {/if}
        </div>
      {/if}

      <div class="dialog-body">
        <slot />
      </div>

      <div class="dialog-footer">
        <slot name="actions" />
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }

  .dialog-content {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-width: 32rem;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
  }

  .dialog-header {
    padding: 1.5rem 1.5rem 0;
  }

  .dialog-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .dialog-description {
    margin: 0.5rem 0 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  .dialog-body {
    padding: 1.5rem;
  }

  .dialog-footer {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
