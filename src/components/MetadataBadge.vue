<template>
  <div class="metadata-badge osrs-panel">
    <img
      v-if="iconSrc"
      :src="iconSrc"
      :alt="type"
      class="badge-icon"
    />
    <span v-else class="badge-icon-text osrs-text">{{ iconFallback }}</span>
    <span class="badge-label osrs-text">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'gp' | 'time' | 'items' | 'requirements'
  label: string
}

const props = defineProps<Props>()

const iconMap: Record<string, { src: string; fallback: string }> = {
  gp: { src: '/assets/osrs/icons/coins.png', fallback: '💰' },
  time: { src: '/assets/osrs/icons/clock.png', fallback: '⏱️' },
  items: { src: '/assets/osrs/icons/inventory.png', fallback: '🎒' },
  requirements: { src: '/assets/osrs/icons/quest.png', fallback: '⭐' },
}

const iconSrc = computed(() => iconMap[props.type]?.src || '')
const iconFallback = computed(() => iconMap[props.type]?.fallback || '?')
</script>

<style scoped>
.metadata-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: var(--font-size-xs);
}

.badge-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.badge-icon-text {
  font-size: 14px;
}

.badge-label {
  white-space: nowrap;
}
</style>
