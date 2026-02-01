<template>
  <div class="px-4 py-4 bg-card">
    <div class="prose prose-sm max-w-none text-foreground">
      <FormattedContent :content="step.content" />
    </div>
    <NestedContent v-if="step.nestedContent" :nestedContent="step.nestedContent" />
    <StepMetadata :metadata="step.metadata" />
  </div>
</template>

<script setup lang="ts">
import type { Step } from '@/types/guide';
import FormattedContent from './FormattedContent.vue';
import NestedContent from './NestedContent.vue';
import StepMetadata from './StepMetadata.vue';

interface Props {
  step: Step;
}

const props = defineProps<Props>();
</script>
