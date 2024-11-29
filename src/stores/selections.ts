import { writable } from "svelte/store";

type SelectionState = {
  [id: string]: {
    name: string;
    zIndex: number;
  };
};

function createSelectionsStore() {
  const { subscribe, set, update } = writable<SelectionState>({});

  return {
    subscribe,
    initialize: (selections: Array<{ id: string; name: string }>) => {
      const state: SelectionState = {};
      selections.forEach((sel) => {
        state[sel.id] = { name: sel.name, zIndex: 0 };
      });
      set(state);
    },
    updateZIndex: (id: string, zIndex: number) => {
      update((state) => ({
        ...state,
        [id]: { ...state[id], zIndex },
      }));
    },
    clear: () => set({}),
  };
}

export const selectionsStore = createSelectionsStore();
