<template>
  <div class="utility-buttons">
    <button class="utility-btn" id="jumpToLastBtn" @click="jumpToLast">
      Jump to Last Completed Step
    </button>
    <button
      class="utility-btn"
      id="minimizeCompletedToggle"
      :class="{ active: filterStore.minimizeCompleted }"
      @click="filterStore.toggleMinimize()"
    >
      Minimize Completed
    </button>
  </div>
</template>

<script setup lang="ts">
import { useProgressStore } from '@/stores/progress';
import { useFilterStore } from '@/stores/filter';
import { useUiStore } from '@/stores/ui';

const progressStore = useProgressStore();
const filterStore = useFilterStore();
const uiStore = useUiStore();

function jumpToLast() {
  const lastStepId = progressStore.lastCompletedStepId;
  if (!lastStepId) return;

  // Parse the step ID to get chapter and section indices
  const parts = lastStepId.split('-');
  if (parts.length >= 3) {
    const chapterIndex = parseInt(parts[1]);
    const sectionIndex = parseInt(parts[2]);

    // Expand the chapter and section
    uiStore.expandedChapters.add(chapterIndex);
    const sectionId = `${chapterIndex}-${sectionIndex}`;
    uiStore.expandSection(sectionId);
  }

  // Scroll to element
  setTimeout(() => {
    const element = document.getElementById(lastStepId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}
</script>
