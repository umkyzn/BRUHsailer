<template>
  <div v-show="hasVisibleSections" class="guide-chapter">
    <ChapterHeader :chapter="chapter" :chapterIndex="chapterIndex" />
    <ChapterContent
      :class="{ active: isExpanded }"
      :chapter="chapter"
      :chapterIndex="chapterIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Chapter } from '@/types/guide';
import { useUiStore } from '@/stores/ui';
import ChapterHeader from './ChapterHeader.vue';
import ChapterContent from './ChapterContent.vue';

interface Props {
  chapter: Chapter;
  chapterIndex: number;
}

const props = defineProps<Props>();
const uiStore = useUiStore();

const isExpanded = computed(() => {
  return uiStore.expandedChapters.has(props.chapterIndex);
});

const hasVisibleSections = computed(() => {
  // Show chapter if it has any sections
  return props.chapter.sections.length > 0;
});

// Auto-expand first chapter by default
onMounted(() => {
  if (props.chapterIndex === 0) {
    uiStore.toggleChapter(0);
  }
});
</script>
