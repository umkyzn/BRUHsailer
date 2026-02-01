<template>
  <div class="step-header" @click="handleToggle">
    <div class="step-header-left">
      <div class="custom-checkbox" :class="{ checked: isCompleted }">
        <svg v-if="isCompleted" class="checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="step-number">
        Step {{ stepNumber }}
      </span>
    </div>
    <span v-if="stepDuration" class="step-time">
      ({{ stepDuration }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProgressStore } from '@/stores/progress';

interface Props {
  stepNumber: number;
  stepId: string;
  stepDuration?: string;
}

const props = defineProps<Props>();
const progressStore = useProgressStore();

const isCompleted = computed(() => {
  return !!progressStore.checkboxStates[props.stepId];
});

function handleToggle() {
  progressStore.toggleStep(props.stepId);
}
</script>
