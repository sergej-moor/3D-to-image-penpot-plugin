<script lang="ts">
  import { theme, updateTheme } from './stores/theme';
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'theme') {
      updateTheme(event.data.content);
    }
  }
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={$theme}>
  <h1>Plugin Template</h1>
  <!-- Add your plugin UI components here -->
</main>

<style>
  main {
    padding: var(--spacing-8);
  }
</style>



