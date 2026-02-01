<template>
  <div class="section-content" :class="{ active: isExpanded }">
    <GuideStep
      v-for="(step, stepIndex) in section.steps"
      :key="`step-${chapterIndex}-${sectionIndex}-${stepIndex}`"
      :step="step"
      :stepId="`check-${chapterIndex}-${sectionIndex}-${stepIndex}`"
      :chapterIndex="chapterIndex"
      :sectionIndex="sectionIndex"
      :stepIndex="stepIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Section } from '@/types/guide';
import { useUiStore } from '@/stores/ui';
import GuideStep from './GuideStep.vue';

interface Props {
  section: Section;
  chapterIndex: number;
  sectionIndex: number;
}

const props = defineProps<Props>();
const uiStore = useUiStore();

const sectionId = computed(() => `${props.chapterIndex}-${props.sectionIndex}`);

const isExpanded = computed(() => {
  return uiStore.expandedSections.has(sectionId.value);
});
</script>
