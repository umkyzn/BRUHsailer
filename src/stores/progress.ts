import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUndo } from '@/composables/useUndo';

export const useProgressStore = defineStore('progress', () => {
  const checkboxStates = ref<Record<string, boolean>>({});
  const stepMetadata = ref<Record<string, { totalTime?: string }>>({});
  const undoRedo = useUndo<Record<string, boolean>>();

  const totalSteps = computed(() => Object.keys(checkboxStates.value).length);

  const completedSteps = computed(() =>
    Object.values(checkboxStates.value).filter(Boolean).length
  );

  const progressPercent = computed(() =>
    totalSteps.value ? Math.round((completedSteps.value / totalSteps.value) * 100) : 0
  );

  const lastCompletedStepId = computed(() => {
    const entries = Object.entries(checkboxStates.value);
    const completed = entries.filter(([_, checked]) => checked);
    return completed[completed.length - 1]?.[0] || null;
  });

  // Optimistic update - happens instantly before any persistence
  function toggleStep(stepId: string) {
    // Save current state to undo history
    undoRedo.pushState(checkboxStates.value);

    // Instant optimistic update
    checkboxStates.value[stepId] = !checkboxStates.value[stepId];
  }

  function initializeStep(stepId: string, totalTime?: string) {
    if (!(stepId in checkboxStates.value)) {
      checkboxStates.value[stepId] = false;
    }
    if (totalTime) {
      stepMetadata.value[stepId] = { totalTime };
    }
  }

  function undo() {
    const previousState = undoRedo.undo();
    if (previousState) {
      checkboxStates.value = previousState;
    }
  }

  function redo() {
    const nextState = undoRedo.redo();
    if (nextState) {
      checkboxStates.value = nextState;
    }
  }

  function canUndo() {
    return undoRedo.canUndo();
  }

  function canRedo() {
    return undoRedo.canRedo();
  }

  function reset() {
    if (confirm('Reset all progress? This cannot be undone.')) {
      undoRedo.clear();
      checkboxStates.value = {};
      return true;
    }
    return false;
  }

  return {
    checkboxStates,
    stepMetadata,
    totalSteps,
    completedSteps,
    progressPercent,
    lastCompletedStepId,
    toggleStep,
    initializeStep,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  };
}, {
  persist: {
    key: 'guideProgress',
    storage: localStorage,
  }
});
