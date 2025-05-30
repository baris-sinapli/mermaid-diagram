<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  let className = '';
  export { className as class };
</script>

<button class="btn btn-{variant} btn-{size} {className}" class:loading {disabled} {type} on:click>
  {#if loading}
    <span class="spinner" />
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .btn:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .btn-secondary {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--secondary-hover);
  }

  .btn-danger {
    background: var(--destructive);
    color: var(--destructive-foreground);
  }

  .btn-danger:hover:not(:disabled) {
    background: var(--destructive-hover);
  }

  .btn-ghost {
    background: transparent;
    color: var(--foreground);
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .btn-sm {
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }

  .btn-md {
    height: 2.5rem;
    padding: 0 1rem;
  }

  .btn-lg {
    height: 3rem;
    padding: 0 1.5rem;
    font-size: 1.125rem;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
