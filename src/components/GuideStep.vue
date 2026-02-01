<template>
  <div
    v-show="isVisible"
    :id="stepId"
    class="step"
    :class="{ completed: isCompleted }"
  >
    <StepHeader
      :stepNumber="stepNumber"
      :stepId="stepId"
      :stepDuration="stepDuration"
    />
    <StepContent v-show="!isMinimized" :step="step" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Step } from '@/types/guide';
import { useProgressStore } from '@/stores/progress';
import { useFilterStore } from '@/stores/filter';
import StepHeader from './StepHeader.vue';
import StepContent from './StepContent.vue';

interface Props {
  step: Step;
  stepId: string;
  chapterIndex: number;
  sectionIndex: number;
  stepIndex: number;
}

const props = defineProps<Props>();
const progressStore = useProgressStore();
const filterStore = useFilterStore();

const stepNumber = computed(() => props.stepIndex + 1);

// Helper function to parse time strings to minutes
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  let totalMinutes = 0;
  const timeStrClean = timeStr.toLowerCase().replace(/\s+/g, '');

  const daysMatch = timeStrClean.match(/(\d+)d(?:ays?)?/);
  const hoursMatch = timeStrClean.match(/(\d+)h(?:rs?|ours?)?/);
  const minutesMatch = timeStrClean.match(/(\d+)m(?:inutes?)?/);

  if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60;
  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
  if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);

  return totalMinutes;
}

function formatDuration(minutes: number): string {
  if (minutes === 0) {
    return '< 1h';
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Calculate the duration for this specific step
const stepDuration = computed(() => {
  const currentTime = props.step.metadata?.total_time;
  if (!currentTime) return undefined;

  const currentMinutes = parseTimeToMinutes(currentTime);

  // Calculate previous step ID based on indices
  let prevStepId: string | null = null;

  if (props.stepIndex > 0) {
    // Previous step is in the same section
    prevStepId = `check-${props.chapterIndex}-${props.sectionIndex}-${props.stepIndex - 1}`;
  } else if (props.sectionIndex > 0 || props.chapterIndex > 0) {
    // First step of a section - need to find the last step of the previous section
    // This is handled by checking all stepMetadata for the pattern
    const allStepIds = Object.keys(progressStore.stepMetadata).sort((a, b) => {
      const aParts = a.replace('check-', '').split('-').map(Number);
      const bParts = b.replace('check-', '').split('-').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

    const currentIndex = allStepIds.indexOf(props.stepId);
    if (currentIndex > 0) {
      prevStepId = allStepIds[currentIndex - 1];
    }
  }

  if (prevStepId) {
    const prevMeta = progressStore.stepMetadata[prevStepId];
    if (prevMeta?.totalTime) {
      const prevMinutes = parseTimeToMinutes(prevMeta.totalTime);
      const duration = currentMinutes - prevMinutes;
      return duration >= 0 ? formatDuration(duration) : undefined;
    }
  }

  // First step overall - return the total time as duration
  return formatDuration(currentMinutes);
});

onMounted(() => {
  progressStore.initializeStep(props.stepId, props.step.metadata?.total_time);
});

const isCompleted = computed(() => {
  return !!progressStore.checkboxStates[props.stepId];
});

const isMinimized = computed(() => {
  return isCompleted.value && filterStore.minimizeCompleted;
});

function getAllStepText(step: Step): string {
  let text = step.content.map(c => c.text).join(' ');
  if (step.nestedContent) {
    step.nestedContent.forEach(nested => {
      text += ' ' + getAllStepText(nested);
    });
  }
  if (step.metadata) {
    text += ' ' + Object.values(step.metadata).filter(v => v).join(' ');
  }
  return text;
}

const isVisible = computed(() => {
  const { activeFilter, searchTerm } = filterStore;

  // Filter by completion state
  if (activeFilter === 'completed' && !isCompleted.value) return false;
  if (activeFilter === 'incomplete' && isCompleted.value) return false;

  // Filter by search
  if (searchTerm.trim()) {
    const stepText = getAllStepText(props.step).toLowerCase();
    return stepText.includes(searchTerm.toLowerCase());
  }

  return true;
});
</script>
