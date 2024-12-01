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
  }[] | undefined>(undefined);

  let sceneComponent = $state<ReturnType<typeof Scene['prototype']['getComponent']> | undefined>(undefined);
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
        if (sceneComponent && event.data.exports) {
          //sceneComponent.clearScene();
          sceneComponent.displayMultipleImages(event.data.exports);
          isLoading = false;
        }
        break;
    }
  }

  function handleExport() {
    isLoading = true;
    window.parent.postMessage({ type: "export-selection" }, "*");
  }

  async function handleCapture() {
    if (sceneComponent) {
      const imageData = await sceneComponent.captureView();
      window.parent.postMessage({ 
        type: "add-capture", 
        imageData: imageData 
      }, "*");
    }
  }

  function handleSceneMount(component: any) {
    sceneComponent = component.getComponent();
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
  <div class="button-container">
    {#if selection && selection.length > 0}
      <button 
        on:click={handleExport} 
        disabled={isLoading}
        class:loading={isLoading}
        class="preview-button"
      >
        {#if isLoading}
          Loading Preview...
        {:else}
          Load Preview ({selection.length} items)
        {/if}
      </button>
    {/if}
    <button 
      on:click={handleCapture}
      class="capture-button"
      disabled={!sceneComponent?.hasLoadedElements() || isLoading}
    >
      Capture View
    </button>
  </div>
  <Scene 
    bind:this={sceneComponent} 
    {selection} 
    {isLoading} 
    on:mount={({ detail }) => handleSceneMount(detail)}
  />
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

  .button-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  }

  .capture-button {
    background-color: var(--button-secondary-color, #4a5568);
  }

  .capture-button:hover:not(:disabled) {
    background-color: var(--button-secondary-hover-color, #2d3748);
  }

  .preview-button {
    background-color: var(--button-primary-color, #2c5282);
    min-width: 200px;
  }

  .preview-button:hover:not(:disabled) {
    background-color: var(--button-primary-hover-color, #2b6cb0);
  }
</style>



