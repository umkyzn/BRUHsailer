<template>
  <div class="filter-buttons">
    <button
      class="filter-btn"
      :class="{ active: filterStore.activeFilter === 'all' }"
      @click="filterStore.setFilter('all')"
    >
      All Steps
    </button>
    <button
      class="filter-btn"
      :class="{ active: filterStore.activeFilter === 'completed' }"
      @click="filterStore.setFilter('completed')"
    >
      Completed Steps
    </button>
    <button
      class="filter-btn"
      :class="{ active: filterStore.activeFilter === 'incomplete' }"
      @click="filterStore.setFilter('incomplete')"
    >
      Incomplete Steps
    </button>
  </div>
</template>

<script setup lang="ts">
import { useFilterStore } from '@/stores/filter';

const filterStore = useFilterStore();
</script>
