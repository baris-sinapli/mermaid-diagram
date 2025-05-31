<script lang="ts">
  export let value = '';
  export let placeholder = '';
  export let type = 'text';
  export let disabled = false;
  export let readonly = false;
  export let required = false;

  let className = '';
  export { className as class };
</script>

<input
  class="input {className}"
  bind:value
  {placeholder}
  {type}
  {disabled}
  {readonly}
  {required}
  on:input
  on:change
  on:focus
  on:blur
  on:keydown
/>

<style>
  .input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    color: var(--foreground);
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }

  .input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-alpha);
  }

  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input::placeholder {
    color: var(--muted-foreground);
  }
</style>
