<template>
  <Transition name="toast">
    <div v-if="showToast" class="save-toast osrs-panel">
      <span class="toast-message osrs-text">{{ toastMessage }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toastMessage, showToast } = useToast()
</script>

<style scoped>
.save-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  z-index: 9999;
  border: 2px solid var(--osrs-gold);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.toast-message {
  font-size: var(--font-size-sm);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 300ms ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Mobile */
@media (max-width: 768px) {
  .save-toast {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
}
</style>
