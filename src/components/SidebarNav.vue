<template>
  <aside :class="['sidebar-nav', { collapsed: uiStore.sidebarCollapsed }]">
    <div class="sidebar-header">
      <button class="sidebar-toggle" @click="uiStore.toggleSidebar" aria-label="Toggle sidebar">
        <svg v-if="!uiStore.sidebarCollapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <h2 v-if="!uiStore.sidebarCollapsed" class="sidebar-title">Contents</h2>
    </div>

    <div v-if="!uiStore.sidebarCollapsed" class="sidebar-content">
      <!-- Show chapter list -->
      <Transition name="slide" mode="out-in">
        <nav v-if="selectedChapter === null" key="chapters" class="chapter-list">
          <button
            v-for="(chapter, chapterIndex) in guideStore.guideData?.chapters"
            :key="chapterIndex"
            :class="['chapter-button', {
              active: uiStore.currentChapterId === chapterIndex
            }]"
            @click="selectChapter(chapterIndex)"
          >
            <span class="chapter-name" :title="chapter.title">{{ chapter.title }}</span>
            <div class="chapter-meta">
              <CircularProgress :percentage="getChapterProgress(chapterIndex)" />
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </button>
        </nav>

        <!-- Show section list for selected chapter -->
        <nav v-else key="sections" class="section-view">
          <button class="back-button" @click="selectedChapter = null">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>All Chapters</span>
          </button>

          <div class="chapter-title-display">
            <h3>{{ guideStore.guideData?.chapters[selectedChapter]?.title }}</h3>
            <CircularProgress :percentage="getChapterProgress(selectedChapter)" />
          </div>

          <div class="section-list">
            <router-link
              v-for="(section, sectionIndex) in guideStore.guideData?.chapters[selectedChapter]?.sections"
              :key="`${selectedChapter}-${sectionIndex}`"
              :to="`/c/${selectedChapter}/s/${selectedChapter}-${sectionIndex}`"
              :class="['section-item', {
                active: uiStore.currentSectionId === `${selectedChapter}-${sectionIndex}`
              }]"
              @click="setCurrentSection(selectedChapter, `${selectedChapter}-${sectionIndex}`)"
            >
              <span class="section-name" :title="section.title">{{ section.title }}</span>
              <div class="section-meta">
                <span v-if="getSectionResultCount(selectedChapter, `${selectedChapter}-${sectionIndex}`) > 0" class="result-badge">
                  {{ getSectionResultCount(selectedChapter, `${selectedChapter}-${sectionIndex}`) }}
                </span>
                <span class="completion-text">{{ getSectionProgress(selectedChapter, `${selectedChapter}-${sectionIndex}`) }}%</span>
              </div>
            </router-link>
          </div>
        </nav>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/stores/ui';
import { useGuideStore } from '@/stores/guide';
import { useFilterStore } from '@/stores/filter';
import CircularProgress from './CircularProgress.vue';

const uiStore = useUiStore();
const guideStore = useGuideStore();
const filterStore = useFilterStore();
const route = useRoute();

const selectedChapter = ref<number | null>(null);

function selectChapter(chapterIndex: number) {
  selectedChapter.value = chapterIndex;
}

function setCurrentSection(chapterId: number, sectionId: string) {
  uiStore.setCurrentLocation(chapterId, sectionId);
}

function getChapterProgress(chapterId: number): number {
  return guideStore.getChapterProgress(chapterId).percentage;
}

function getSectionProgress(chapterId: number, sectionId: string): number {
  return guideStore.getSectionProgress(chapterId, sectionId).percentage;
}

function getSectionResultCount(chapterId: number, sectionId: string): number {
  return filterStore.searchResults.filter(
    (r: any) => r.chapterId === chapterId && r.sectionId === sectionId
  ).length;
}

// Auto-select chapter based on route
watch(() => route.params, (params) => {
  if (params.chapterId) {
    const chapterId = Number(params.chapterId);
    selectedChapter.value = chapterId;
    if (params.sectionId) {
      uiStore.setCurrentLocation(chapterId, params.sectionId as string);
    }
  }
}, { immediate: true });
</script>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 380px;
  background: var(--card-bg);
  border-right: 1px solid var(--section-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition-base), transform var(--transition-base);
}

.sidebar-nav.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--section-border);
  min-height: 60px;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: var(--foreground-muted, var(--text-muted));
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.sidebar-toggle:hover {
  background: var(--hover-bg);
  color: var(--foreground, var(--text-color));
  transform: scale(1.05);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--foreground, var(--text-color));
  margin: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.chapter-list {
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.chapter-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  color: var(--foreground, var(--text-color));
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
}

.chapter-button:hover {
  background: var(--hover-bg);
}

.chapter-button.active {
  background: var(--primary);
  color: var(--text-light);
}

.chapter-name {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.chevron-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  margin: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  background: transparent;
  border: 1px solid var(--section-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--foreground, var(--text-color));
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  width: calc(100% - var(--spacing-md) * 2);
}

.back-button:hover {
  background: var(--hover-bg);
  border-color: var(--primary);
}

.chapter-title-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0 var(--spacing-sm) var(--spacing-md);
  background: var(--hover-bg);
  border-radius: var(--radius-md);
}

.chapter-title-display h3 {
  flex: 1;
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--foreground, var(--text-color));
  line-height: 1.4;
}

.section-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-list {
  padding: 0 var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  overflow-y: auto;
}

.section-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--foreground-muted, var(--text-muted));
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.section-item:hover {
  background: var(--hover-bg);
  color: var(--foreground, var(--text-color));
}

.section-item.active {
  background: var(--primary);
  color: var(--text-light);
  font-weight: 500;
}

.section-name {
  flex: 1;
  min-width: 0;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--spacing-xs);
  background: var(--active-btn);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.completion-text {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-base);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Expand transition - kept for compatibility */
.expand-enter-active,
.expand-leave-active {
  transition: all var(--transition-base);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sidebar-nav {
    transform: translateX(-100%);
  }

  .sidebar-nav:not(.collapsed) {
    transform: translateX(0);
    box-shadow: var(--shadow-xl);
  }
}

/* Custom scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: var(--radius-full);
  opacity: 0.5;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}
</style>
