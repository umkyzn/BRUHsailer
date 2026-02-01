<template>
  <svg
    class="osrs-progress-ring"
    :width="size"
    :height="size"
    viewBox="0 0 36 36"
  >
    <circle
      class="ring-bg"
      cx="18"
      cy="18"
      :r="radius"
    />
    <circle
      class="ring-fill"
      cx="18"
      cy="18"
      :r="radius"
      :stroke-dasharray="`${progress} ${circumference}`"
      stroke-dashoffset="0"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
})

const radius = 15.5
const circumference = 2 * Math.PI * radius

const progress = computed(() => {
  return (props.percentage / 100) * circumference
})
</script>

<style scoped>
.osrs-progress-ring {
  transform: rotate(-90deg);
  overflow: visible;
}

.ring-bg {
  fill: none;
  stroke: var(--osrs-stone-dark);
  stroke-width: 3;
}

.ring-fill {
  fill: none;
  stroke: var(--osrs-gold);
  stroke-width: 3;
  transition: stroke-dasharray 300ms ease;
}
</style>
