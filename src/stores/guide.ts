import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GuideData, Chapter, Section } from '@/types/guide';
import { useProgressStore } from './progress';

export const useGuideStore = defineStore('guide', () => {
  const guideData = ref<GuideData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const allSections = computed(() => {
    if (!guideData.value) return [];
    const sections: Array<{ chapterId: number; chapterName: string; section: Section; sectionId: string }> = [];
    guideData.value.chapters.forEach((chapter, chapterIndex) => {
      chapter.sections.forEach((section, sectionIndex) => {
        sections.push({
          chapterId: chapterIndex,
          chapterName: chapter.name,
          section,
          sectionId: `${chapterIndex}-${sectionIndex}`
        });
      });
    });
    return sections;
  });

  async function loadGuideData() {
    loading.value = true;
    error.value = null;

    try {
      // Use relative path that works both in dev and production
      const basePath = import.meta.env.BASE_URL || '/';
      const dataPath = basePath.endsWith('/')
        ? `${basePath}data/guide_data.json`
        : `${basePath}/data/guide_data.json`;

      const response = await fetch(dataPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      guideData.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load guide data';
      console.error('Error loading guide data:', e);
    } finally {
      loading.value = false;
    }
  }

  function getCurrentSection(chapterId: number, sectionId: string) {
    if (!guideData.value) return null;
    const chapter = guideData.value.chapters[chapterId];
    if (!chapter) return null;
    const [, sectionIndex] = sectionId.split('-').map(Number);
    return chapter.sections[sectionIndex];
  }

  function getAdjacentSections(chapterId: number, sectionId: string) {
    const sections = allSections.value;
    const currentIndex = sections.findIndex(
      s => s.chapterId === chapterId && s.sectionId === sectionId
    );
    
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }

    return {
      prev: currentIndex > 0 ? sections[currentIndex - 1] : null,
      next: currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null
    };
  }

  function getSectionProgress(chapterId: number, sectionId: string) {
    if (!guideData.value) return { total: 0, completed: 0, percentage: 0 };
    
    const section = getCurrentSection(chapterId, sectionId);
    if (!section || !section.steps) return { total: 0, completed: 0, percentage: 0 };

    const progressStore = useProgressStore();
    const total = section.steps.length;
    let completed = 0;

    section.steps.forEach((step, stepIndex) => {
      const stepKey = `check-${chapterId}-${sectionId.split('-')[1]}-${stepIndex}`;
      if (progressStore.checkboxStates[stepKey]) {
        completed++;
      }
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  function getChapterProgress(chapterId: number) {
    if (!guideData.value) return { total: 0, completed: 0, percentage: 0 };
    
    const chapter = guideData.value.chapters[chapterId];
    if (!chapter) return { total: 0, completed: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    chapter.sections.forEach((_, sectionIndex) => {
      const sectionId = `${chapterId}-${sectionIndex}`;
      const progress = getSectionProgress(chapterId, sectionId);
      total += progress.total;
      completed += progress.completed;
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  return {
    guideData,
    loading,
    error,
    allSections,
    loadGuideData,
    getCurrentSection,
    getAdjacentSections,
    getSectionProgress,
    getChapterProgress
  };
});
