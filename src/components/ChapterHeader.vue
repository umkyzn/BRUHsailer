<template>
  <div class="chapter-header" @click="handleToggle">
    <h2>
      <span class="collapse-icon">{{ isExpanded ? '▼' : '▶' }}</span>
      {{ chapter.title }}
    </h2>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Chapter } from '@/types/guide';
import { useUiStore } from '@/stores/ui';

interface Props {
  chapter: Chapter;
  chapterIndex: number;
}

const props = defineProps<Props>();
const uiStore = useUiStore();

const isExpanded = computed(() => {
  return uiStore.expandedChapters.has(props.chapterIndex);
});

function handleToggle() {
  uiStore.toggleChapter(props.chapterIndex);
}
</script>
