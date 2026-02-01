import { ref } from 'vue';

interface UndoState<T> {
  state: T;
  timestamp: number;
}

export function useUndo<T>() {
  const history = ref<UndoState<T>[]>([]);
  const currentIndex = ref(-1);
  const maxHistory = 50; // Limit history to prevent memory issues

  function pushState(state: T) {
    // Remove any states after current index (redo history)
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1);
    }

    // Add new state
    history.value.push({
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      timestamp: Date.now(),
    });

    // Limit history size
    if (history.value.length > maxHistory) {
      history.value.shift();
    } else {
      currentIndex.value++;
    }
  }

  function undo(): T | null {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      return history.value[currentIndex.value].state;
    }
    return null;
  }

  function redo(): T | null {
    if (currentIndex.value < history.value.length - 1) {
      currentIndex.value++;
      return history.value[currentIndex.value].state;
    }
    return null;
  }

  function canUndo(): boolean {
    return currentIndex.value > 0;
  }

  function canRedo(): boolean {
    return currentIndex.value < history.value.length - 1;
  }

  function clear() {
    history.value = [];
    currentIndex.value = -1;
  }

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
