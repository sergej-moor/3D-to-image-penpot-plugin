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
  let isLoading = $state(false);

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
          isLoading = false;
        }
        break;
    }
  }

  function handleExport() {
    isLoading = true;
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
    <button 
      on:click={handleExport} 
      disabled={isLoading}
      class:loading={isLoading}
    >
      {#if isLoading}
        Loading Preview...
      {:else}
        Load Preview
      {/if}
    </button>
  {/if}
  <Scene bind:this={sceneComponent} {selection} {isLoading} />
</main>

<style>
  main {
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
  }

  h1 {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }

  button {
    max-width: 800px;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    background-color: var(--button-primary-color, #2c5282);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s, background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: var(--button-primary-hover-color, #2b6cb0);
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  button.loading {
    position: relative;
    overflow: hidden;
  }

  button.loading::after {
    content: "";
    position: absolute;
    left: -100%;
    top: 0;
    height: 100%;
    width: 200%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }
</style>



