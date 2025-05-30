<script>
  import '../lib/styles/variables.css';
  import '../lib/styles/components.css';
  import { onMount } from 'svelte';
  import { appStore } from '$lib/stores/app';

  onMount(() => {
    // Apply initial theme
    const { currentTheme } = $appStore;
    document.documentElement.setAttribute('data-theme', currentTheme);
  });
</script>

<slot />
