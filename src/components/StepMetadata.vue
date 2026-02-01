<template>
  <div v-if="metadata && hasMetadata" class="step-metadata">
    <div v-if="metadata.gp_stack" class="metadata-item" style="border-left: 3px solid var(--accent-coins);">
      <svg class="icon" style="color: var(--accent-coins);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
      <span><strong>GP:</strong> {{ metadata.gp_stack }}</span>
    </div>
    <div v-if="metadata.items_needed" class="metadata-item" style="border-left: 3px solid var(--accent-items);">
      <svg class="icon" style="color: var(--accent-items);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 7h-3a2 2 0 01-2-2V2"/>
        <path d="M9 2v3a2 2 0 01-2 2H4"/>
        <path d="M4 7v13a2 2 0 002 2h12a2 2 0 002-2V7H4z"/>
      </svg>
      <span><strong>Items:</strong> {{ metadata.items_needed }}</span>
    </div>
    <div v-if="metadata.total_time" class="metadata-item" style="border-left: 3px solid var(--accent-time);">
      <svg class="icon" style="color: var(--accent-time);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span><strong>Total:</strong> {{ metadata.total_time }}</span>
    </div>
    <div v-if="metadata.skills_quests_met" class="metadata-item" style="border-left: 3px solid var(--accent-skills);">
      <svg class="icon" style="color: var(--accent-skills);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span><strong>Skills/Quests:</strong> {{ metadata.skills_quests_met }}</span>
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
