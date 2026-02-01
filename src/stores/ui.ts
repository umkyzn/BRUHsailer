import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const darkMode = ref(false);
  const sidebarCollapsed = ref(false);
  const currentChapterId = ref<number | null>(null);
  const currentSectionId = ref<string | null>(null);
  const expandedChapters = ref<Set<number>>(new Set());
  const expandedSections = ref<Set<string>>(new Set());

  // Computed properties to expose the Set values for reactivity
  const expandedChaptersSet = computed(() => expandedChapters.value);
  const expandedSectionsSet = computed(() => expandedSections.value);

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    if (darkMode.value) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }

  function applyDarkMode() {
    if (darkMode.value) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleChapter(chapterIndex: number) {
    const newSet = new Set(expandedChapters.value);
    if (newSet.has(chapterIndex)) {
      newSet.delete(chapterIndex);
    } else {
      newSet.add(chapterIndex);
    }
    expandedChapters.value = newSet;
  }

  function toggleSection(sectionId: string) {
    const newSet = new Set(expandedSections.value);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    expandedSections.value = newSet;
  }

  function expandSection(sectionId: string) {
    const newSet = new Set(expandedSections.value);
    newSet.add(sectionId);
    expandedSections.value = newSet;
  }

  function collapseSection(sectionId: string) {
    const newSet = new Set(expandedSections.value);
    newSet.delete(sectionId);
    expandedSections.value = newSet;
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setCurrentLocation(chapterId: number | null, sectionId: string | null) {
    currentChapterId.value = chapterId;
    currentSectionId.value = sectionId;
  }

  return {
    darkMode,
    sidebarCollapsed,
    currentChapterId,
    currentSectionId,
    expandedChapters: expandedChaptersSet,
    expandedSections: expandedSectionsSet,
    toggleDarkMode,
    applyDarkMode,
    toggleChapter,
    toggleSection,
    expandSection,
    collapseSection,
    toggleSidebar,
    setCurrentLocation
  };
}, {
  persist: {
    key: 'guideUi',
    storage: localStorage,
    paths: ['darkMode', 'sidebarCollapsed'], // Persist darkMode and sidebar state
  }
});
