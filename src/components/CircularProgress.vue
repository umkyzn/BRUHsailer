<template>
  <div class="circular-progress" :title="`${percentage}% complete`">
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle
        class="progress-bg"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke-width="2"
      />
      <circle
        class="progress-bar"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke-width="2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 12 12)"
      />
      <text
        v-if="percentage === 100"
        x="12"
        y="12"
        text-anchor="middle"
        dominant-baseline="central"
        class="check-mark"
        font-size="14"
      >
        ✓
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  percentage: number;
}>();

const radius = 10;
const circumference = 2 * Math.PI * radius;

const dashOffset = computed(() => {
  return circumference - (props.percentage / 100) * circumference;
});
</script>

<style scoped>
.circular-progress {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circular-progress svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.progress-bg {
  stroke: currentColor;
  opacity: 0.15;
}

.progress-bar {
  stroke: var(--active-btn);
  transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  stroke-linecap: round;
}

.check-mark {
  fill: var(--active-btn);
  font-weight: 700;
  animation: checkIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes checkIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Active state colors */
.chapter-button.active .progress-bg,
.section-item.active .progress-bg {
  stroke: white;
  opacity: 0.25;
}

.chapter-button.active .progress-bar,
.section-item.active .progress-bar {
  stroke: white;
}

.chapter-button.active .check-mark,
.section-item.active .check-mark {
  fill: white;
}

/* Hover effect for parent items */
.chapter-button:hover:not(.active) .progress-bar,
.section-item:hover:not(.active) .progress-bar {
  stroke: var(--primary);
}
</style>
