<template>
  <div class="breadcrumbs">
    <nav class="breadcrumb-nav">
      <div v-if="currentChapter" class="breadcrumb-item">
        <div class="breadcrumb-wrapper">
          <router-link 
            :to="`/c/${chapterId}/s/${chapterId}-0`" 
            class="breadcrumb-link"
          >
            {{ currentChapter.title }}
          </router-link>
          <button class="breadcrumb-dropdown-btn" @click.stop="showChapterMenu = !showChapterMenu">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
        <Transition name="dropdown">
          <div v-if="showChapterMenu" v-click-outside="() => showChapterMenu = false" class="dropdown-menu">
            <router-link
              v-for="(chapter, index) in guideStore.guideData?.chapters"
              :key="index"
              :to="`/c/${index}/s/${index}-0`"
              class="dropdown-item"
              @click="showChapterMenu = false"
            >
              <span>{{ chapter.title }}</span>
              <CircularProgress :percentage="guideStore.getChapterProgress(index).percentage" />
            </router-link>
          </div>
        </Transition>
      </div>

      <svg v-if="currentChapter && currentSection" class="separator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>

      <div v-if="currentSection" class="breadcrumb-item">
        <div class="breadcrumb-wrapper">
          <router-link 
            :to="`/c/${chapterId}/s/${sectionId}`" 
            class="breadcrumb-link"
          >
            {{ currentSection.title }}
          </router-link>
          <button class="breadcrumb-dropdown-btn" @click.stop="showSectionMenu = !showSectionMenu">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
        <Transition name="dropdown">
          <div v-if="showSectionMenu" v-click-outside="() => showSectionMenu = false" class="dropdown-menu">
            <router-link
              v-for="(section, sectionIndex) in currentChapter?.sections"
              :key="sectionIndex"
              :to="`/c/${chapterId}/s/${chapterId}-${sectionIndex}`"
              class="dropdown-item"
              @click="showSectionMenu = false"
            >
              <span>{{ section.title }}</span>
              <span v-if="chapterId !== null" class="completion-badge">{{ guideStore.getSectionProgress(chapterId, `${chapterId}-${sectionIndex}`).percentage }}%</span>
            </router-link>
          </div>
        </Transition>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGuideStore } from '@/stores/guide';
import CircularProgress from './CircularProgress.vue';

const route = useRoute();
const guideStore = useGuideStore();

const showChapterMenu = ref(false);
const showSectionMenu = ref(false);

const chapterId = computed(() => {
  return route.params.chapterId ? Number(route.params.chapterId) : null;
});

const sectionId = computed(() => {
  return route.params.sectionId as string | null;
});

const currentChapter = computed(() => {
  if (chapterId.value === null || !guideStore.guideData) return null;
  return guideStore.guideData.chapters[chapterId.value];
});

const currentSection = computed(() => {
  if (chapterId.value === null || !sectionId.value) return null;
  return guideStore.getCurrentSection(chapterId.value, sectionId.value);
});

// Close menus when route changes
watch(() => route.path, () => {
  showChapterMenu.value = false;
  showSectionMenu.value = false;
});

// Simple click outside directive
interface ExtendedHTMLElement extends HTMLElement {
  _clickOutside?: (event: MouseEvent) => void;
}

const vClickOutside = {
  mounted(el: ExtendedHTMLElement, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el: ExtendedHTMLElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside);
    }
  }
};
</script>

<style scoped>
.breadcrumbs {
  background: var(--bg-color);
  border-bottom: 1px solid var(--section-border);
  padding: var(--spacing-md) var(--spacing-xl);
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  max-width: 1400px;
  margin: 0 auto;
}

.breadcrumb-item {
  position: relative;
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
  background: transparent;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.breadcrumb-wrapper:hover {
  background: var(--hover-bg);
}

.breadcrumb-link {
  display: inline-block;
  color: var(--foreground, var(--text-color));
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  padding-right: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--foreground, var(--text-color));
  cursor: pointer;
  padding: var(--spacing-xs);
  padding-left: 0;
  padding-right: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.breadcrumb-dropdown-btn:hover {
  opacity: 0.7;
}

.separator {
  color: var(--foreground-muted, var(--text-muted));
  flex-shrink: 0;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  background: var(--card-bg);
  border: 1px solid var(--section-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 250px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  padding: var(--spacing-xs);
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--hover-bg);
}

.dropdown-item.router-link-active {
  background: var(--primary);
  color: white;
}

.completion-badge {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 500;
}

.dropdown-item.router-link-active .completion-badge {
  color: rgba(255, 255, 255, 0.8);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Custom scrollbar for dropdown */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: var(--radius-full);
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: var(--text-color);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .breadcrumbs {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .breadcrumb-link {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-menu {
    min-width: 200px;
  }
}
</style>
