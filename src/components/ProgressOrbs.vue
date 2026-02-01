<template>
  <div class="progress-orbs">
    <div class="orb-item" @mouseenter="showTooltip('steps', $event)" @mouseleave="hideTooltip">
      <svg class="orb" viewBox="0 0 100 100">
        <circle class="orb-bg" cx="50" cy="50" r="40" />
        <circle
          class="orb-fill steps-fill"
          cx="50"
          cy="50"
          r="40"
          :stroke-dasharray="`${stepsCircumference * (stepsPercentage / 100)}, ${stepsCircumference}`"
        />
        <text x="50" y="55" class="orb-text">{{ stepsCompleted }}/{{ stepsTotal }}</text>
      </svg>
      <span class="orb-label osrs-text">Steps</span>
    </div>

    <div class="orb-item" @mouseenter="showTooltip('time', $event)" @mouseleave="hideTooltip">
      <svg class="orb" viewBox="0 0 100 100">
        <circle class="orb-bg" cx="50" cy="50" r="40" />
        <circle
          class="orb-fill time-fill"
          cx="50"
          cy="50"
          r="40"
          :stroke-dasharray="`${stepsCircumference * (timePercentage / 100)}, ${stepsCircumference}`"
        />
        <text x="50" y="60" class="orb-text orb-text-large">{{ Math.round(timePercentage) }}%</text>
      </svg>
      <span class="orb-label osrs-text">Time</span>
    </div>

    <div class="orb-item" @mouseenter="showTooltip('gp', $event)" @mouseleave="hideTooltip">
      <svg class="orb" viewBox="0 0 100 100">
        <circle class="orb-bg" cx="50" cy="50" r="40" />
        <circle
          class="orb-fill gp-fill"
          cx="50"
          cy="50"
          r="40"
          :stroke-dasharray="`${stepsCircumference * (gpPercentage / 100)}, ${stepsCircumference}`"
        />
        <text x="50" y="60" class="orb-text orb-text-large">{{ Math.round(gpPercentage) }}%</text>
      </svg>
      <span class="orb-label osrs-text">GP</span>
    </div>

    <div v-if="tooltipVisible" class="osrs-tooltip" :style="tooltipStyle">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  stepsCompleted: number
  stepsTotal: number
  timeInvested?: string
  gpAccumulated?: string
}

const props = withDefaults(defineProps<Props>(), {
  timeInvested: '0h',
  gpAccumulated: '0k',
})

const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipStyle = ref({})

const stepsCircumference = 2 * Math.PI * 40

const stepsPercentage = computed(() => {
  return props.stepsTotal > 0 ? (props.stepsCompleted / props.stepsTotal) * 100 : 0
})

const timePercentage = computed(() => {
  // Placeholder - calculate based on estimated total time
  return stepsPercentage.value
})

const gpPercentage = computed(() => {
  // Placeholder - calculate based on estimated total GP
  return stepsPercentage.value
})

function showTooltip(type: string, event: MouseEvent) {
  tooltipVisible.value = true

  switch (type) {
    case 'steps':
      tooltipText.value = `${props.stepsCompleted} of ${props.stepsTotal} steps completed`
      break
    case 'time':
      tooltipText.value = `${props.timeInvested} invested`
      break
    case 'gp':
      tooltipText.value = `${props.gpAccumulated} accumulated`
      break
  }

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  tooltipStyle.value = {
    position: 'fixed',
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.bottom + 8}px`,
    transform: 'translateX(-50%)',
  }
}

function hideTooltip() {
  tooltipVisible.value = false
}
</script>

<style scoped>
.progress-orbs {
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
}

.orb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.orb {
  width: 80px;
  height: 80px;
  transform: rotate(-90deg);
}

.orb-bg {
  fill: none;
  stroke: var(--osrs-stone-dark);
  stroke-width: 8;
}

.orb-fill {
  fill: none;
  stroke-width: 8;
  transition: stroke-dasharray 300ms ease;
}

.steps-fill {
  stroke: var(--osrs-gold);
}

.time-fill {
  stroke: #3399FF;
}

.gp-fill {
  stroke: #00CC00;
}

.orb-text {
  fill: var(--osrs-gold);
  font-family: var(--font-osrs);
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: middle;
  transform: rotate(90deg);
  transform-origin: center;
  text-shadow: var(--osrs-text-shadow);
}

.orb-text-large {
  font-size: 18px;
}

.orb-label {
  font-size: var(--font-size-xs);
}

/* Mobile */
@media (max-width: 768px) {
  .progress-orbs {
    gap: var(--spacing-md);
  }

  .orb {
    width: 60px;
    height: 60px;
  }

  .orb-text {
    font-size: 11px;
  }

  .orb-text-large {
    font-size: 14px;
  }
}
</style>
