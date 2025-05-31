<script lang="ts">
  import { notificationStore } from '$lib/stores/notifications';
  import { fly } from 'svelte/transition';

  function getIcon(type: string) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  }
</script>

<div class="toast-container">
  {#each $notificationStore as notification (notification.id)}
    <div class="toast toast-{notification.type}" transition:fly={{ y: -50, duration: 300 }}>
      <div class="toast-header">
        <span class="toast-icon">{getIcon(notification.type)}</span>
        <h4 class="toast-title">{notification.title}</h4>
        <button
          class="toast-close"
          on:click={() => notificationStore.remove(notification.id)}
          aria-label="Close notification">×</button
        >
      </div>

      <div class="toast-content">
        <p class="toast-message">{notification.message}</p>

        {#if notification.actions && notification.actions.length > 0}
          <div class="toast-actions">
            {#each notification.actions as action}
              <button class="toast-action" on:click={action.action}>
                {action.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 24rem;
  }

  .toast {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .toast-success {
    border-left: 4px solid var(--success);
  }

  .toast-error {
    border-left: 4px solid var(--destructive);
  }

  .toast-warning {
    border-left: 4px solid var(--warning);
  }

  .toast-info {
    border-left: 4px solid var(--primary);
  }

  .toast-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem 0.5rem;
  }

  .toast-icon {
    flex-shrink: 0;
  }

  .toast-title {
    flex: 1;
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--muted-foreground);
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-close:hover {
    color: var(--foreground);
  }

  .toast-content {
    padding: 0 1rem 0.75rem;
  }

  .toast-message {
    margin: 0;
    font-size: 0.875rem;
    color: var(--muted-foreground);
    white-space: pre-line;
  }

  .toast-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .toast-action {
    padding: 0.25rem 0.75rem;
    background: var(--primary);
    color: var(--primary-foreground);
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .toast-action:hover {
    background: var(--primary-hover);
  }
</style>
