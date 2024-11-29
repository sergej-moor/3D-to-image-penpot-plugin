<script lang="ts">
  import { selectionsStore } from './stores/selections';

  export let selection: {
    id: string;
    name: string;
    x: number;
    y: number;
  };

  let zIndex = 0;
  let x = selection.x;
  let y = selection.y;

  function handleZIndexChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    selectionsStore.updateZIndex(selection.id, value);
  }

  function handlePositionChange(axis: 'x' | 'y', event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    selectionsStore.updatePosition(selection.id, axis, value);
  }
</script>

<div class="selection-control">
  <span class="name" title={selection.name}>
    {selection.name}
  </span>
  <div class="controls">
    <label>
      X:
      <input 
        type="number" 
        value={x}
        on:input={(e) => handlePositionChange('x', e)}
      />
    </label>
    <label>
      Y:
      <input 
        type="number" 
        value={y}
        on:input={(e) => handlePositionChange('y', e)}
      />
    </label>
    <label>
      Z:
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
</div>

<style>
  .selection-control {
    background: var(--background-color, white);
    border: 1px solid var(--border-color, #ccc);
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .name {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  input {
    width: 100%;
    padding: 0.25rem;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    font-size: 0.8rem;
  }
</style> 