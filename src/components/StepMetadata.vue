<template>
  <div v-if="metadata && hasMetadata" class="step-metadata">
    <div v-if="metadata.gp_stack" class="metadata-item">
      <strong>GP Stack:</strong> {{ metadata.gp_stack }}
    </div>
    <div v-if="metadata.items_needed" class="metadata-item">
      <strong>Items Needed:</strong> {{ metadata.items_needed }}
    </div>
    <div v-if="metadata.total_time" class="metadata-item">
      <strong>Total Time:</strong> {{ metadata.total_time }}
    </div>
    <div v-if="metadata.skills_quests_met" class="metadata-item">
      <strong>Skills/Quests:</strong> {{ metadata.skills_quests_met }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StepMetadata } from '@/types/guide';
import { computed } from 'vue';

interface Props {
  metadata?: StepMetadata;
}

const props = defineProps<Props>();

const hasMetadata = computed(() => {
  if (!props.metadata) return false;
  return !!(
    props.metadata.gp_stack ||
    props.metadata.items_needed ||
    props.metadata.total_time ||
    props.metadata.skills_quests_met
  );
});
</script>
