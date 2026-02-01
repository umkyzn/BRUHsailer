<template>
  <div class="search-container">
    <input
      type="text"
      id="searchInput"
      placeholder="Search steps..."
      :value="filterStore.searchTerm"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { useFilterStore } from '@/stores/filter';
import { ref } from 'vue';

const filterStore = useFilterStore();
let debounceTimeout: number | undefined;

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // Clear existing timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  // Set new timeout
  debounceTimeout = window.setTimeout(() => {
    filterStore.setSearchTerm(value);
  }, 150); // Reduced from 750ms for instant feedback (Linear-style)
}
</script>
