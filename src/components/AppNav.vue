<template>
  <nav>
    <div class="nav-content">
      <a href="https://docs.google.com/document/d/1CBkFM70SnrW4hJXvHM2F1fYCuBF_fRnEXnTYgRnRkAE">
        Guide Docs
      </a>
      <div v-if="guideStore.guideData" id="lastUpdated">
        Last updated: {{ guideStore.guideData.updatedOn }}
      </div>
      <a href="#" @click.prevent="handleReset">Reset Progress</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useProgressStore } from '@/stores/progress';
import { useGuideStore } from '@/stores/guide';

const progressStore = useProgressStore();
const guideStore = useGuideStore();

function handleReset() {
  progressStore.reset();
}
</script>
