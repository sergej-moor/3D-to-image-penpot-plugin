import { writable } from "svelte/store";

type SelectionState = {
  [id: string]: {
    name: string;
    zIndex: number;
    x: number;
    y: number;
  };
};

function createSelectionsStore() {
  const { subscribe, set, update } = writable<SelectionState>({});

  return {
    subscribe,
    initialize: (
      selections: Array<{ id: string; name: string; x: number; y: number }>
    ) => {
      const state: SelectionState = {};
      selections.forEach((sel) => {
        state[sel.id] = {
          name: sel.name,
          zIndex: 0,
          x: sel.x,
          y: sel.y,
        };
      });
      set(state);
    },
    updateZIndex: (id: string, zIndex: number) => {
      update((state) => ({
        ...state,
        [id]: { ...state[id], zIndex },
      }));
    },
    updatePosition: (id: string, axis: "x" | "y", value: number) => {
      update((state) => ({
        ...state,
        [id]: { ...state[id], [axis]: value },
      }));
    },
    clear: () => set({}),
  };
}

export const selectionsStore = createSelectionsStore();
