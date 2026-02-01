<template>
  <div class="section-header" @click="handleToggle">
    <h3>
      <span class="collapse-icon">{{ isExpanded ? '▼' : '▶' }}</span>
      {{ section.title }}
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Section } from '@/types/guide';
import { useUiStore } from '@/stores/ui';

interface Props {
  section: Section;
  sectionId: string;
}

const props = defineProps<Props>();
const uiStore = useUiStore();

const isExpanded = computed(() => {
  return uiStore.expandedSections.has(props.sectionId);
});

function handleToggle() {
  uiStore.toggleSection(props.sectionId);
}
</script>
