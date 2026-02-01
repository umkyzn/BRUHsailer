<template>
  <div v-show="hasVisibleSteps" class="guide-section">
    <SectionHeader :section="section" :sectionId="sectionId" />
    <SectionContent
      :class="{ active: isExpanded }"
      :section="section"
      :chapterIndex="chapterIndex"
      :sectionIndex="sectionIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import type { Section } from '@/types/guide';
import { useUiStore } from '@/stores/ui';
import { useFilterStore } from '@/stores/filter';
import SectionHeader from './SectionHeader.vue';
import SectionContent from './SectionContent.vue';

interface Props {
  section: Section;
  chapterIndex: number;
  sectionIndex: number;
}

const props = defineProps<Props>();
const uiStore = useUiStore();
const filterStore = useFilterStore();

const sectionId = computed(() => `${props.chapterIndex}-${props.sectionIndex}`);

const isExpanded = computed(() => {
  return uiStore.expandedSections.has(sectionId.value);
});

const hasVisibleSteps = computed(() => {
  // This is a simple check - the actual filtering happens in GuideStep
  // We show the section if it has any steps
  return props.section.steps.length > 0;
});

// Auto-expand on search
const shouldAutoExpand = computed(() => {
  return filterStore.searchTerm.trim().length > 0;
});

watch(shouldAutoExpand, (shouldExpand) => {
  if (shouldExpand) {
    uiStore.expandSection(sectionId.value);
  }
}, { immediate: true });

// Auto-expand first section by default
onMounted(() => {
  if (props.sectionIndex === 0 && props.chapterIndex === 0) {
    uiStore.expandSection(sectionId.value);
  }
});
</script>
