<template>
  <div class="progress-bar">
    <div
      class="progress"
      id="progressBar"
      :style="{ width: progressStore.progressPercent + '%' }"
    >
      <span class="progress-text">{{ progressStore.progressPercent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProgressStore } from '@/stores/progress';

const progressStore = useProgressStore();
</script>
