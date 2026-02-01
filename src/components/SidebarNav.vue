<template>
  <aside
    :class="['sidebar-nav', { collapsed: uiStore.sidebarCollapsed, pinned: uiStore.sidebarPinned }]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="sidebar-header">
      <h2 v-if="!uiStore.sidebarCollapsed" class="osrs-text">Guide</h2>
      <button
        class="pin-button osrs-button"
        @click="uiStore.toggleSidebarPin"
        :title="uiStore.sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'"
      >
        <span v-if="!uiStore.sidebarCollapsed">{{ uiStore.sidebarPinned ? '📌' : '📍' }}</span>
      </button>
    </div>

    <nav class="chapters-nav">
      <div
        v-for="(chapter, index) in guideStore.guideData?.chapters"
        :key="`chapter-${index}`"
        class="chapter-item"
        :class="{ active: isChapterActive(index) }"
      >
        <button
          class="chapter-button"
          @click="handleChapterClick(index)"
        >
          <div class="chapter-icon-wrapper">
            <ProgressRing
              :percentage="getChapterProgress(index)"
              :size="40"
            />
            <span class="chapter-number osrs-text">{{ index + 1 }}</span>
          </div>
          <span v-if="!uiStore.sidebarCollapsed" class="chapter-title">
            {{ chapter.title }}
          </span>
        </button>

        <div
          v-if="!uiStore.sidebarCollapsed && isChapterExpanded(index)"
          class="sections-list"
        >
          <button
            v-for="(section, sectionIndex) in chapter.sections"
            :key="`section-${index}-${sectionIndex}`"
            class="section-button"
            :class="{ active: isSectionActive(index, sectionIndex) }"
            @click="handleSectionClick(index, sectionIndex)"
          >
            <span class="section-title">{{ section.title }}</span>
            <span class="section-progress">
              {{ getSectionProgress(index, sectionIndex) }}
            </span>
          </button>
        </div>
      </div>
    </nav>

    <button
      class="collapse-toggle osrs-button"
      @click="uiStore.toggleSidebar"
      :title="uiStore.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    >
      {{ uiStore.sidebarCollapsed ? '→' : '←' }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGuideStore } from '@/stores/guide'
import { useProgressStore } from '@/stores/progress'
import { useUiStore } from '@/stores/ui'
import ProgressRing from './ProgressRing.vue'

const router = useRouter()
const guideStore = useGuideStore()
const progressStore = useProgressStore()
const uiStore = useUiStore()

let hoverTimeout: number | null = null

function handleMouseEnter() {
  if (!uiStore.sidebarPinned) {
    hoverTimeout = window.setTimeout(() => {
      uiStore.setSidebarCollapsed(false)
    }, 200)
  }
}

function handleMouseLeave() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  if (!uiStore.sidebarPinned) {
    uiStore.setSidebarCollapsed(true)
  }
}

function isChapterActive(chapterIndex: number): boolean {
  return uiStore.currentChapterId === chapterIndex
}

function isChapterExpanded(chapterIndex: number): boolean {
  return uiStore.expandedChapters.has(chapterIndex)
}

function isSectionActive(chapterIndex: number, sectionIndex: number): boolean {
  const sectionId = `section-${chapterIndex}-${sectionIndex}`
  return uiStore.currentSectionId === sectionId
}

function getChapterProgress(chapterIndex: number): number {
  const chapters = guideStore.guideData?.chapters
  if (!chapters) return 0
  const chapter = chapters[chapterIndex]
  if (!chapter) return 0

  let total = 0
  let completed = 0

  chapter.sections.forEach((section: any, sectionIndex: number) => {
    section.steps.forEach((_: any, stepIndex: number) => {
      total++
      const stepKey = `check-${chapterIndex}-${sectionIndex}-${stepIndex}`
      if (progressStore.checkboxStates[stepKey]) {
        completed++
      }
    })
  })

  return total > 0 ? Math.round((completed / total) * 100) : 0
}

function getSectionProgress(chapterIndex: number, sectionIndex: number): string {
  const chapters = guideStore.guideData?.chapters
  if (!chapters) return '0/0'
  const chapter = chapters[chapterIndex]
  if (!chapter) return '0/0'

  const section = chapter.sections[sectionIndex]
  if (!section) return '0/0'

  let completed = 0
  section.steps.forEach((_: any, stepIndex: number) => {
    const stepKey = `check-${chapterIndex}-${sectionIndex}-${stepIndex}`
    if (progressStore.checkboxStates[stepKey]) {
      completed++
    }
  })

  return `${completed}/${section.steps.length}`
}

function handleChapterClick(chapterIndex: number) {
  uiStore.toggleChapter(chapterIndex)

  // Navigate to first incomplete section or first section
  const chapters = guideStore.guideData?.chapters
  if (!chapters) return
  const chapter = chapters[chapterIndex]
  if (chapter && chapter.sections.length > 0) {
    const firstIncompleteSection = chapter.sections.findIndex((section: any, sectionIndex: number) => {
      return section.steps.some((_: any, stepIndex: number) => {
        const stepKey = `check-${chapterIndex}-${sectionIndex}-${stepIndex}`
        return !progressStore.checkboxStates[stepKey]
      })
    })

    const targetSection = firstIncompleteSection >= 0 ? firstIncompleteSection : 0
    const sectionId = `section-${chapterIndex}-${targetSection}`
    router.push(`/c/${chapterIndex}/s/${sectionId}`)
  }
}

function handleSectionClick(chapterIndex: number, sectionIndex: number) {
  const sectionId = `section-${chapterIndex}-${sectionIndex}`
  router.push(`/c/${chapterIndex}/s/${sectionId}`)

  if (!uiStore.sidebarPinned) {
    setTimeout(() => {
      uiStore.setSidebarCollapsed(true)
    }, 300)
  }
}
</script>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: var(--osrs-panel-bg);
  border-right: 3px solid var(--osrs-border);
  display: flex;
  flex-direction: column;
  transition: width 200ms ease-out, transform 200ms ease-out;
  z-index: 100;
  overflow: hidden;
}

.sidebar-nav.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 2px solid var(--osrs-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
}

.chapters-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.chapter-item {
  margin-bottom: var(--spacing-md);
}

.chapter-button {
  width: 100%;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  border-radius: 4px;
  transition: background 150ms ease;
}

.chapter-button:hover {
  background: var(--osrs-stone-medium);
}

.chapter-item.active .chapter-button {
  background: var(--osrs-button-active);
}

.chapter-icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.chapter-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-lg);
  pointer-events: none;
}

.chapter-title {
  font-family: var(--font-osrs);
  color: var(--osrs-gold);
  font-size: var(--font-size-sm);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sections-list {
  margin-top: var(--spacing-sm);
  margin-left: var(--spacing-2xl);
  border-left: 2px solid var(--osrs-stone-dark);
  padding-left: var(--spacing-md);
}

.section-button {
  width: 100%;
  background: transparent;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  transition: background 150ms ease;
  margin-bottom: var(--spacing-xs);
}

.section-button:hover {
  background: var(--osrs-stone-dark);
}

.section-button.active {
  background: var(--osrs-gold);
  color: var(--osrs-stone-dark);
}

.section-title {
  font-family: var(--font-osrs);
  font-size: var(--font-size-xs);
  color: var(--osrs-parchment);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-button.active .section-title {
  color: var(--osrs-stone-dark);
}

.section-progress {
  font-family: var(--font-osrs);
  font-size: var(--font-size-xs);
  color: var(--osrs-gold-dark);
  flex-shrink: 0;
  margin-left: var(--spacing-sm);
}

.collapse-toggle {
  margin: var(--spacing-md);
  padding: var(--spacing-sm);
}

.pin-button {
  padding: var(--spacing-xs) var(--spacing-sm);
}

.sidebar-nav.collapsed .sidebar-header h2,
.sidebar-nav.collapsed .chapter-title,
.sidebar-nav.collapsed .sections-list,
.sidebar-nav.collapsed .pin-button span {
  display: none;
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar-nav {
    transform: translateX(-100%);
  }

  .sidebar-nav.collapsed:not(.pinned) {
    transform: translateX(-100%);
  }

  .sidebar-nav:not(.collapsed),
  .sidebar-nav.pinned {
    transform: translateX(0);
  }
}
</style>
