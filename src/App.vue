<template>
  <div class="app-layout">
    <SidebarNav />

    <div :class="['main-content', { 'sidebar-collapsed': uiStore.sidebarCollapsed }]">
      <AppHeader />
      <CommandBar />
      <Breadcrumbs />

      <div class="content-wrapper">
        <ProgressBar />
        <GuideContent />
        <NavigationFooter />
      </div>
    </div>

    <SaveToast />
    <CommandPalette />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGuideStore } from '@/stores/guide';
import { useProgressStore } from '@/stores/progress';
import { useUiStore } from '@/stores/ui';
import { useKeyboardStore } from '@/stores/keyboard';
import { useFilterStore } from '@/stores/filter';
import { useToast } from '@/composables/useToast';
import { useKeyboard } from '@/composables/useKeyboard';
import AppHeader from '@/components/AppHeader.vue';
import SidebarNav from '@/components/SidebarNav.vue';
import CommandBar from '@/components/CommandBar.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import GuideContent from '@/components/GuideContent.vue';
import NavigationFooter from '@/components/NavigationFooter.vue';
import SaveToast from '@/components/SaveToast.vue';
import CommandPalette from '@/components/CommandPalette.vue';

const guideStore = useGuideStore();
const progressStore = useProgressStore();
const uiStore = useUiStore();
const keyboardStore = useKeyboardStore();
const filterStore = useFilterStore();
const route = useRoute();
const { showToastMessage } = useToast();
const keyboard = useKeyboard();

// Register global keyboard shortcuts
keyboard.registerShortcuts([
  {
    key: 'k',
    meta: true,
    description: 'Open command palette',
    handler: () => keyboardStore.toggleCommandPalette(),
  },
  {
    key: 'k',
    ctrl: true,
    description: 'Open command palette',
    handler: () => keyboardStore.toggleCommandPalette(),
  },
  {
    key: '/',
    description: 'Focus search',
    handler: () => {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
      }
    },
    preventDefault: true,
  },
  {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    handler: () => keyboardStore.toggleShortcutsHelp(),
  },
  {
    key: 'z',
    meta: true,
    description: 'Undo last change',
    handler: () => {
      if (progressStore.canUndo()) {
        progressStore.undo();
        showToastMessage('Undone');
      }
    },
  },
  {
    key: 'z',
    ctrl: true,
    description: 'Undo last change',
    handler: () => {
      if (progressStore.canUndo()) {
        progressStore.undo();
        showToastMessage('Undone');
      }
    },
  },
  {
    key: 'z',
    meta: true,
    shift: true,
    description: 'Redo last change',
    handler: () => {
      if (progressStore.canRedo()) {
        progressStore.redo();
        showToastMessage('Redone');
      }
    },
  },
  {
    key: 'y',
    ctrl: true,
    description: 'Redo last change',
    handler: () => {
      if (progressStore.canRedo()) {
        progressStore.redo();
        showToastMessage('Redone');
      }
    },
  },
  {
    key: 'n',
    description: 'Next section',
    handler: () => {
      const chapterId = route.params.chapterId ? Number(route.params.chapterId) : null;
      const sectionId = route.params.sectionId as string | null;
      if (chapterId !== null && sectionId) {
        const adjacent = guideStore.getAdjacentSections(chapterId, sectionId);
        if (adjacent.next) {
          window.location.hash = `#/c/${adjacent.next.chapterId}/s/${adjacent.next.sectionId}`;
        }
      }
    },
  },
  {
    key: 'p',
    description: 'Previous section',
    handler: () => {
      const chapterId = route.params.chapterId ? Number(route.params.chapterId) : null;
      const sectionId = route.params.sectionId as string | null;
      if (chapterId !== null && sectionId) {
        const adjacent = guideStore.getAdjacentSections(chapterId, sectionId);
        if (adjacent.prev) {
          window.location.hash = `#/c/${adjacent.prev.chapterId}/s/${adjacent.prev.sectionId}`;
        }
      }
    },
  },
  {
    key: 'ArrowLeft',
    description: 'Previous search result',
    handler: (event) => {
      const searchInput = document.getElementById('searchInput');
      if (document.activeElement === searchInput && filterStore.hasResults) {
        filterStore.prevResult();
        event.preventDefault();
      }
    },
  },
  {
    key: 'ArrowRight',
    description: 'Next search result',
    handler: (event) => {
      const searchInput = document.getElementById('searchInput');
      if (document.activeElement === searchInput && filterStore.hasResults) {
        filterStore.nextResult();
        event.preventDefault();
      }
    },
  },
]);

onMounted(() => {
  guideStore.loadGuideData();
  uiStore.applyDarkMode();
});

// Watch route params and expand sections accordingly
watch(
  () => route.params,
  (params) => {
    if (params.chapterId) {
      const chapterId = parseInt(params.chapterId as string);
      if (!isNaN(chapterId) && !uiStore.expandedChapters.has(chapterId)) {
        uiStore.toggleChapter(chapterId);
      }
    }

    if (params.sectionId && params.chapterId) {
      uiStore.setCurrentLocation(
        parseInt(params.chapterId as string),
        params.sectionId as string
      );
    }
  },
  { immediate: true }
);

// Helper function to parse time strings and calculate step duration
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  let totalMinutes = 0;
  const timeStrClean = timeStr.toLowerCase().replace(/\s+/g, '');

  // Match patterns like: "2d10h", "5h48m", "35 minutes", "1 hr 23 minutes"
  const daysMatch = timeStrClean.match(/(\d+)d(?:ays?)?/);
  const hoursMatch = timeStrClean.match(/(\d+)h(?:rs?|ours?)?/);
  const minutesMatch = timeStrClean.match(/(\d+)m(?:inutes?)?/);

  if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60;
  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
  if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);

  return totalMinutes;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

function getPreviousStepId(currentStepId: string): string | null {
  const allStepIds = Object.keys(progressStore.stepMetadata);
  const currentIndex = allStepIds.indexOf(currentStepId);
  if (currentIndex > 0) {
    return allStepIds[currentIndex - 1];
  }
  return null;
}

// Watch for progress changes and show toast with step completion time
let progressChangeTimeout: number | null = null;
let previousStates = { ...progressStore.checkboxStates };

watch(
  () => progressStore.checkboxStates,
  (newStates) => {
    if (progressChangeTimeout) {
      clearTimeout(progressChangeTimeout);
    }

    // Find which step changed
    let changedStepId: string | null = null;
    let wasChecked = false;

    for (const stepId in newStates) {
      if (newStates[stepId] !== previousStates[stepId]) {
        changedStepId = stepId;
        wasChecked = newStates[stepId];
        break;
      }
    }

    previousStates = { ...newStates };

    progressChangeTimeout = window.setTimeout(() => {
      if (changedStepId && wasChecked) {
        // Step was checked - calculate and show duration
        const currentMeta = progressStore.stepMetadata[changedStepId];
        const prevStepId = getPreviousStepId(changedStepId);

        if (currentMeta?.totalTime) {
          const currentTime = parseTimeToMinutes(currentMeta.totalTime);
          let stepDuration = 0;

          if (prevStepId) {
            const prevMeta = progressStore.stepMetadata[prevStepId];
            if (prevMeta?.totalTime) {
              const prevTime = parseTimeToMinutes(prevMeta.totalTime);
              stepDuration = currentTime - prevTime;
            } else {
              stepDuration = currentTime;
            }
          } else {
            stepDuration = currentTime;
          }

          if (stepDuration > 0) {
            showToastMessage(`Step completed (+${formatDuration(stepDuration)})`);
          } else {
            showToastMessage('Progress saved');
          }
        } else {
          showToastMessage('Progress saved');
        }
      } else {
        showToastMessage('Progress saved');
      }
    }, 300);
  },
  { deep: true }
);
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
}

.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-base);
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>
