<script lang="ts">
  import { selectionsStore } from './stores/selections';

  export let selection: {
    id: string;
    name: string;
    x: number;
    y: number;
  };

  let zIndex = 0;

  function handleZIndexChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    selectionsStore.updateZIndex(selection.id, value);
  }
</script>

<div class="selection-control">
  <span class="name" title={selection.name}>
    {selection.name}
  </span>
  <label>
    Z-Index:
    <input 
      type="number" 
      value={zIndex}
      on:input={handleZIndexChange}
      min="-100"
      max="100"
      step="1"
    />
  </label>
</div>

<style>
  .selection-control {
    background: var(--background-color, white);
    border: 1px solid var(--border-color, #ccc);
    padding: 0.5rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .name {
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  input {
    width: 80px;
    padding: 0.25rem;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
</style> 