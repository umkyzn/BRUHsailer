<template>
  <div
    v-show="isVisible"
    :id="stepId"
    :class="['guide-step', 'osrs-panel', { completed: isCompleted, expanded: isExpanded }]"
  >
    <div class="step-header" @click="toggleExpanded">
      <div class="step-left">
        <OSRSCheckbox
          :model-value="isCompleted"
          @update:model-value="toggleComplete"
          @click.stop
        />
        <span class="step-number osrs-text">Step {{ stepNumber }}</span>
      </div>
      <div class="step-right">
        <span v-if="stepDuration" class="step-duration osrs-text">
          {{ stepDuration }}
        </span>
        <button class="expand-toggle" @click.stop="toggleExpanded">
          {{ isExpanded ? '▼' : '▶' }}
        </button>
      </div>
    </div>

    <div v-show="isExpanded" class="step-body">
      <StepContent :step="step" />

      <div v-if="hasMetadata" class="step-metadata">
        <MetadataBadge
          v-if="step.metadata?.gp_stack"
          type="gp"
          :label="step.metadata.gp_stack"
        />
        <MetadataBadge
          v-if="step.metadata?.total_time"
          type="time"
          :label="step.metadata.total_time"
        />
        <MetadataBadge
          v-if="step.metadata?.items_needed"
          type="items"
          :label="step.metadata.items_needed"
        />
        <MetadataBadge
          v-if="step.metadata?.skills_quests_met"
          type="requirements"
          :label="step.metadata.skills_quests_met"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Step } from '@/types/guide'
import { useProgressStore } from '@/stores/progress'
import { useUiStore } from '@/stores/ui'
import { useFilterStore } from '@/stores/filter'
import OSRSCheckbox from './OSRSCheckbox.vue'
import StepContent from './StepContent.vue'
import MetadataBadge from './MetadataBadge.vue'

interface Props {
  step: Step
  stepId: string
  chapterIndex: number
  sectionIndex: number
  stepIndex: number
}

const props = defineProps<Props>()
const progressStore = useProgressStore()
const uiStore = useUiStore()
const filterStore = useFilterStore()

const stepNumber = computed(() => props.stepIndex + 1)

const isCompleted = computed(() => {
  return !!progressStore.checkboxStates[props.stepId]
})

const isExpanded = computed(() => {
  return uiStore.isStepExpanded(props.stepId)
})

const hasMetadata = computed(() => {
  return !!(
    props.step.metadata?.gp_stack ||
    props.step.metadata?.total_time ||
    props.step.metadata?.items_needed ||
    props.step.metadata?.skills_quests_met
  )
})

// Helper function to parse time strings to minutes
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0

  let totalMinutes = 0
  const timeStrClean = timeStr.toLowerCase().replace(/\s+/g, '')

  const daysMatch = timeStrClean.match(/(\d+)d(?:ays?)?/)
  const hoursMatch = timeStrClean.match(/(\d+)h(?:rs?|ours?)?/)
  const minutesMatch = timeStrClean.match(/(\d+)m(?:inutes?)?/)

  if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60
  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
  if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])

  return totalMinutes
}

function formatDuration(minutes: number): string {
  if (minutes === 0) {
    return '< 1h'
  }
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}m`
}

// Calculate the duration for this specific step
const stepDuration = computed(() => {
  const currentTime = props.step.metadata?.total_time
  if (!currentTime) return undefined

  const currentMinutes = parseTimeToMinutes(currentTime)

  // Calculate previous step ID based on indices
  let prevStepId: string | null = null

  if (props.stepIndex > 0) {
    // Previous step is in the same section
    prevStepId = `check-${props.chapterIndex}-${props.sectionIndex}-${props.stepIndex - 1}`
  } else if (props.sectionIndex > 0 || props.chapterIndex > 0) {
    // First step of a section - need to find the last step of the previous section
    const allStepIds = Object.keys(progressStore.stepMetadata).sort((a, b) => {
      const aParts = a.replace('check-', '').split('-').map(Number)
      const bParts = b.replace('check-', '').split('-').map(Number)
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) return aVal - bVal
      }
      return 0
    })

    const currentIndex = allStepIds.indexOf(props.stepId)
    if (currentIndex > 0) {
      prevStepId = allStepIds[currentIndex - 1]
    }
  }

  if (prevStepId) {
    const prevMeta = progressStore.stepMetadata[prevStepId]
    if (prevMeta?.totalTime) {
      const prevMinutes = parseTimeToMinutes(prevMeta.totalTime)
      const duration = currentMinutes - prevMinutes
      return duration >= 0 ? formatDuration(duration) : undefined
    }
  }

  // First step overall - return the total time as duration
  return formatDuration(currentMinutes)
})

function getAllStepText(step: Step): string {
  let text = step.content.map(c => c.text).join(' ')
  if (step.nestedContent) {
    step.nestedContent.forEach(nested => {
      text += ' ' + getAllStepText(nested)
    })
  }
  if (step.metadata) {
    text += ' ' + Object.values(step.metadata).filter(v => v).join(' ')
  }
  return text
}

const isVisible = computed(() => {
  const { activeFilter, searchTerm } = filterStore

  // Filter by completion state
  if (activeFilter === 'completed' && !isCompleted.value) return false
  if (activeFilter === 'incomplete' && isCompleted.value) return false

  // Filter by search
  if (searchTerm.trim()) {
    const stepText = getAllStepText(props.step).toLowerCase()
    return stepText.includes(searchTerm.toLowerCase())
  }

  return true
})

function toggleComplete() {
  progressStore.toggleCheckbox(props.stepId)
}

function toggleExpanded() {
  uiStore.toggleStepExpanded(props.stepId)
}

onMounted(() => {
  progressStore.initializeStep(props.stepId, props.step.metadata?.total_time)
})
</script>

<style scoped>
.guide-step {
  margin-bottom: var(--spacing-lg);
  transition: all 200ms ease;
}

.guide-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.guide-step.completed {
  opacity: 0.7;
  filter: saturate(0.6);
}

.guide-step.completed:hover {
  opacity: 0.85;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid var(--osrs-border);
}

.step-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.step-number {
  font-size: var(--font-size-lg);
}

.step-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.step-duration {
  font-size: var(--font-size-sm);
  padding: 4px 8px;
  background: var(--osrs-stone-dark);
  border-radius: 4px;
}

.expand-toggle {
  background: transparent;
  border: none;
  color: var(--osrs-gold);
  font-family: var(--font-osrs);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 200ms ease;
}

.guide-step.expanded .expand-toggle {
  transform: rotate(90deg);
}

.step-body {
  padding: var(--spacing-lg);
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 2px solid var(--osrs-stone-dark);
}

/* Mobile */
@media (max-width: 768px) {
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .step-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
