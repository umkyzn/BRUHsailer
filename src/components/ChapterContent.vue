<template>
  <div class="chapter-content" :class="{ active: isExpanded }">
    <GuideSection
      v-for="(section, sectionIndex) in chapter.sections"
      :key="`section-${chapterIndex}-${sectionIndex}`"
      :section="section"
      :chapterIndex="chapterIndex"
      :sectionIndex="sectionIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Chapter } from '@/types/guide';
import { useUiStore } from '@/stores/ui';
import GuideSection from './GuideSection.vue';

interface Props {
  chapter: Chapter;
  chapterIndex: number;
}

const props = defineProps<Props>();
const uiStore = useUiStore();

const isExpanded = computed(() => {
  return uiStore.expandedChapters.has(props.chapterIndex);
});
</script>
