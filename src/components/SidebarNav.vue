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
  width: 320px;
  background: var(--card-bg);
  border-right: 1px solid var(--section-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.sidebar-nav.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--section-border);
  min-height: 64px;
  background: var(--card-bg);
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: var(--foreground-muted, var(--text-muted));
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.sidebar-toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle:hover::before {
  opacity: 0.08;
}

.sidebar-toggle:active::before {
  opacity: 0.12;
}

.sidebar-toggle:hover {
  color: var(--foreground, var(--text-color));
}

.sidebar-toggle svg {
  position: relative;
  z-index: 1;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--foreground, var(--text-color));
  margin: 0;
  letter-spacing: -0.01em;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

.chapter-list {
  padding: 4px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  color: var(--foreground, var(--text-color));
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.chapter-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chapter-button:hover::before {
  opacity: 0.08;
}

.chapter-button:active::before {
  opacity: 0.12;
}

.chapter-button.active {
  background: var(--primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.chapter-button.active::before {
  opacity: 0;
}

.chapter-name {
  flex: 1;
  min-width: 0;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: relative;
  z-index: 1;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.chevron-icon {
  flex-shrink: 0;
  opacity: 0.5;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
}

.chapter-button:hover .chevron-icon {
  opacity: 0.7;
  transform: translateX(2px);
}

.chapter-button.active .chevron-icon {
  opacity: 0.9;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 0 12px 12px;
  background: transparent;
  border: 1px solid var(--section-border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--foreground, var(--text-color));
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.back-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.back-button:hover::before {
  opacity: 0.04;
}

.back-button svg {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover svg {
  transform: translateX(-2px);
}

.back-button span {
  position: relative;
  z-index: 1;
}

.chapter-title-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  margin: 0 12px 12px;
  background: linear-gradient(135deg, var(--primary) 0%, rgba(var(--primary-rgb, 59, 130, 246), 0.85) 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-title-display h3 {
  flex: 1;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: white;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.section-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-list {
  padding: 0 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.section-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--foreground-muted, var(--text-muted));
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.section-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-item:hover {
  color: var(--foreground, var(--text-color));
}

.section-item:hover::before {
  opacity: 0.06;
}

.section-item:active::before {
  opacity: 0.1;
}

.section-item.active {
  background: var(--primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.section-item.active::before {
  opacity: 0;
}

.section-name {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: relative;
  z-index: 1;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: var(--active-btn);
  color: white;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.section-item.active .result-badge {
  background: white;
  color: var(--primary);
}

.completion-text {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    width: 280px;
  }

  .sidebar-nav:not(.collapsed) {
    transform: translateX(0);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

/* Custom scrollbar with Material Design style */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: background 0.2s;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.section-list::-webkit-scrollbar {
  width: 8px;
}

.section-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.section-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: background 0.2s;
}

.section-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
