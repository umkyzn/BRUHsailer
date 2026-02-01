<template>
  <div class="osrs-checkbox-wrapper" @click="handleClick">
    <div
      :class="['osrs-checkbox', { checked: modelValue }]"
      role="checkbox"
      :aria-checked="modelValue"
      tabindex="0"
      @keydown.space.prevent="handleClick"
    >
      <svg
        v-if="modelValue"
        class="checkmark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <div ref="particleContainer" class="particle-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const particleContainer = ref<HTMLElement | null>(null)

function handleClick() {
  emit('update:modelValue', !props.modelValue)

  if (!props.modelValue) {
    // Trigger particle effect when checking
    createParticles()
  }
}

function createParticles() {
  if (!particleContainer.value) return

  const particleCount = 6

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'osrs-particle'

    const angle = (i / particleCount) * 360
    const x = Math.cos(angle * Math.PI / 180) * 30
    const y = Math.sin(angle * Math.PI / 180) * 30

    particle.style.setProperty('--particle-x', `${x}px`)
    particle.style.setProperty('--particle-y', `${y}px`)

    particleContainer.value.appendChild(particle)

    setTimeout(() => {
      particle.remove()
    }, 600)
  }
}
</script>

<style scoped>
.osrs-checkbox-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.osrs-checkbox {
  width: 28px;
  height: 28px;
  border: 3px solid var(--osrs-border);
  background: var(--osrs-stone-dark);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.osrs-checkbox:hover {
  border-color: var(--osrs-gold);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3),
              inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.osrs-checkbox.checked {
  background: var(--osrs-gold);
  border-color: var(--osrs-gold-dark);
  transform: scale(1.05);
}

.checkmark {
  width: 20px;
  height: 20px;
  color: var(--osrs-stone-dark);
  animation: checkmarkPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkmarkPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.particle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Mobile touch targets */
@media (max-width: 768px) {
  .osrs-checkbox {
    width: 48px;
    height: 48px;
  }

  .checkmark {
    width: 32px;
    height: 32px;
  }
}
</style>
