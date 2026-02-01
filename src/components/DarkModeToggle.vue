<template>
  <button
    class="dark-mode-toggle"
    id="darkModeToggle"
    @click="uiStore.toggleDarkMode()"
    title="Toggle dark mode"
  >
    🌓
  </button>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { onMounted } from 'vue';

const uiStore = useUiStore();

// Apply dark mode on mount
onMounted(() => {
  uiStore.applyDarkMode();
});
</script>
