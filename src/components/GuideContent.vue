<template>
  <div class="guide-content">
    <div v-if="guideStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading guide data...</p>
    </div>
    <div v-else-if="guideStore.error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4m0 4h.01"/>
      </svg>
      <p>Error loading guide: {{ guideStore.error }}</p>
    </div>
    <div v-else-if="currentSection" class="section-view">
      <div class="section-header">
        <h1 class="section-title">{{ currentSection.title }}</h1>
        <div class="section-stats">
          <div class="stat-item">
            <span class="stat-label">Progress</span>
            <span class="stat-value">{{ sectionProgress.percentage }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Steps</span>
            <span class="stat-value">{{ sectionProgress.completed }}/{{ sectionProgress.total }}</span>
          </div>
        </div>
      </div>

      <div class="steps-container">
        <GuideStep
          v-for="(step, stepIndex) in visibleSteps"
          :key="`step-${chapterId}-${sectionIndex}-${stepIndex}`"
          :step="step"
          :stepIndex="stepIndex"
          :stepId="`check-${chapterId}-${sectionIndex}-${stepIndex}`"
          :chapterIndex="chapterId"
          :sectionIndex="sectionIndex"
        />
      </div>

      <div v-if="visibleSteps.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4m0-4h.01"/>
        </svg>
        <h3>No steps match your current filters</h3>
        <p>Try adjusting your filter settings or search terms</p>
      </div>
    </div>
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <h3>Select a section to view</h3>
      <p>Choose a chapter and section from the sidebar to get started</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGuideStore } from '@/stores/guide';
import { useFilterStore } from '@/stores/filter';
import { useProgressStore } from '@/stores/progress';
import { useUiStore } from '@/stores/ui';
import GuideStep from './GuideStep.vue';

const route = useRoute();
const guideStore = useGuideStore();
const filterStore = useFilterStore();
const progressStore = useProgressStore();
const uiStore = useUiStore();

const chapterId = computed(() => {
  return route.params.chapterId ? Number(route.params.chapterId) : null;
});

const sectionId = computed(() => {
  return route.params.sectionId as string | null;
});

const sectionIndex = computed(() => {
  if (!sectionId.value) return null;
  const parts = sectionId.value.split('-');
  return parts.length > 1 ? Number(parts[1]) : null;
});

const currentSection = computed(() => {
  if (chapterId.value === null || !sectionId.value) return null;
  return guideStore.getCurrentSection(chapterId.value, sectionId.value);
});

const sectionProgress = computed(() => {
  if (chapterId.value === null || !sectionId.value) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  return guideStore.getSectionProgress(chapterId.value, sectionId.value);
});

const visibleSteps = computed(() => {
  if (!currentSection.value) return [];

  let steps = currentSection.value.steps;

  // Apply filter
  if (filterStore.activeFilter !== 'all') {
    steps = steps.filter((step, stepIndex) => {
      const stepKey = `check-${chapterId.value}-${sectionIndex.value}-${stepIndex}`;
      const isCompleted = progressStore.checkboxStates[stepKey] || false;

      if (filterStore.activeFilter === 'completed') {
        return isCompleted;
      } else if (filterStore.activeFilter === 'incomplete') {
        return !isCompleted;
      }
      return true;
    });
  }

  // Apply search filter
  if (filterStore.searchTerm.trim()) {
    const searchLower = filterStore.searchTerm.toLowerCase();
    steps = steps.filter(step => {
      const textContent = step.content
        .map(c => c.text)
        .join(' ')
        .toLowerCase();
      return textContent.includes(searchLower);
    });
  }

  return steps;
});

// Update UI store with current location
watch([chapterId, sectionId], ([newChapterId, newSectionId]) => {
  if (newChapterId !== null && newSectionId) {
    uiStore.setCurrentLocation(newChapterId, newSectionId);
  }
}, { immediate: true });
</script>

<style scoped>
.guide-content {
  flex: 1;
  min-height: 100vh;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-3xl);
  text-align: center;
  min-height: 400px;
  color: var(--foreground-muted, var(--text-muted));
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--section-border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg,
.empty-state svg {
  color: var(--foreground-muted, var(--text-muted));
  opacity: 0.5;
}

.error-state p,
.empty-state p {
  max-width: 400px;
  font-size: var(--font-size-base);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--foreground, var(--text-color));
  margin: 0;
}

.section-view {
  animation: fadeIn var(--transition-base);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  padding: var(--spacing-2xl) var(--spacing-xl);
  border-bottom: 1px solid var(--section-border);
  background: var(--card-bg);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-semibold);
  color: var(--foreground, var(--text-color));
  margin: 0 0 var(--spacing-lg) 0;
  line-height: var(--line-height-tight);
}

.section-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--foreground-muted, var(--text-muted));
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  font-weight: var(--font-semibold);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-semibold);
  color: var(--primary);
}

.steps-container {
  padding: var(--spacing-xl);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .section-header {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .section-title {
    font-size: var(--font-size-2xl);
  }

  .section-stats {
    gap: var(--spacing-md);
  }

  .stat-value {
    font-size: var(--font-size-lg);
  }

  .steps-container {
    padding: var(--spacing-md);
  }
}
</style>
