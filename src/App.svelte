<script lang="ts">
  import { onMount } from "svelte";
  import Scene from './Scene.svelte';
  import { theme, updateTheme } from './stores/theme';
  
  let selection = $state<{
    name: string;
    width: number;
    height: number;
    type: string;
    id: string;
  } | undefined>(undefined);

  let sceneComponent: any;

  function handleMessage(event: MessageEvent) {
    switch(true) {
      case event.data.type === "selectionchange":
        selection = event.data.selection;
        break;
      case event.data.type === "themechange":
        updateTheme(event.data.theme);
        break;
      case event.data.type === "export-result":
        if (sceneComponent) {
          sceneComponent.displayImageData(
            event.data.imageData,
            selection?.width || 0,
            selection?.height || 0
          );
        }
        break;
    }
  }

  function handleExport() {
    window.parent.postMessage({ type: "export-selection" }, "*");
  }

  onMount(() => {
    window.parent.postMessage({
      type: "ready",
    }, "*");
  });
</script>

<svelte:window on:message={handleMessage} />

<main data-theme={$theme}>
  <h1>Selection Viewer</h1>
  {#if selection}
    <button on:click={handleExport}>Load Preview</button>
  {/if}
  <Scene bind:this={sceneComponent} {selection} />
</main>

<style>
  main {
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  button {
    width: 100%;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    background-color: var(--button-primary-color, #2c5282);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: var(--button-primary-hover-color, #2b6cb0);
  }
</style>



