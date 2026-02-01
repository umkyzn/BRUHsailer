<template>
  <div :class="['command-bar-wrapper', { scrolled: isScrolled }]">
    <div class="command-bar">
      <button class="menu-toggle" @click="uiStore.toggleSidebar" aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      <div class="search-container">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref="searchInput"
          id="searchInput"
          v-model="searchTerm"
          type="text"
          placeholder="Search steps..."
          class="search-input"
          @input="handleSearchInput"
        />
        <div v-if="filterStore.hasResults" class="search-results-info">
          <span class="result-count">{{ filterStore.currentResultIndex + 1 }} of {{ filterStore.totalResults }}</span>
          <button class="nav-button" @click="filterStore.prevResult()" aria-label="Previous result">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="nav-button" @click="filterStore.nextResult()" aria-label="Next result">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <kbd v-else class="keyboard-hint">⌘K</kbd>
      </div>

      <div class="filter-chips">
        <button
          :class="['filter-chip', { active: filterStore.activeFilter === 'all' }]"
          @click="filterStore.setFilter('all')"
        >
          All Steps
        </button>
        <button
          :class="['filter-chip', { active: filterStore.activeFilter === 'incomplete' }]"
          @click="filterStore.setFilter('incomplete')"
        >
          Incomplete
        </button>
        <button
          :class="['filter-chip', { active: filterStore.activeFilter === 'completed' }]"
          @click="filterStore.setFilter('completed')"
        >
          Completed
        </button>
      </div>

      <div class="action-buttons">
        <button
          :class="['action-button', { active: filterStore.minimizeCompleted }]"
          @click="filterStore.toggleMinimize()"
          :title="filterStore.minimizeCompleted ? 'Expand completed steps' : 'Minimize completed steps'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12h16M4 6h16M4 18h16"/>
          </svg>
        </button>
        <button class="action-button" @click="uiStore.toggleDarkMode()" title="Toggle theme">
          <svg v-if="!uiStore.darkMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useUiStore } from '@/stores/ui';
import { useFilterStore } from '@/stores/filter';
import { useDebounceFn } from '@vueuse/core';

const uiStore = useUiStore();
const filterStore = useFilterStore();

const searchInput = ref<HTMLInputElement>();
const searchTerm = ref(filterStore.searchTerm);
const isScrolled = ref(false);

const handleSearchInput = useDebounceFn(() => {
  filterStore.setSearchTerm(searchTerm.value);
}, 150);

watch(() => filterStore.searchTerm, (newValue) => {
  if (newValue !== searchTerm.value) {
    searchTerm.value = newValue;
  }
});

function handleScroll() {
  isScrolled.value = window.scrollY > 10;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.command-bar-wrapper {
  position: sticky;
  top: 0;
  z-index: 90;
  background: var(--bg-color);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-fast);
}

.command-bar-wrapper.scrolled {
  background: var(--bg-color);
  backdrop-filter: blur(12px);
  border-bottom-color: var(--section-border);
  box-shadow: var(--shadow-sm);
}

.command-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--foreground-muted, var(--text-muted));
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.menu-toggle:hover {
  background: var(--hover-bg);
  color: var(--foreground, var(--text-color));
}

.search-container {
  flex: 1;
  max-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--card-bg);
  border: 1px solid var(--section-border);
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all var(--transition-fast);
}

.search-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(192, 160, 128, 0.1);
}

.search-icon {
  color: var(--foreground-muted, var(--text-muted));
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--foreground, var(--text-color));
  font-size: var(--font-size-sm);
  padding: 0;
}

.search-input::placeholder {
  color: var(--foreground-muted, var(--text-muted));
}

.search-results-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
  padding-left: var(--spacing-sm);
  border-left: 1px solid var(--section-border);
}

.result-count {
  font-size: var(--font-size-xs);
  color: var(--foreground-muted, var(--text-muted));
  white-space: nowrap;
}

.nav-button {
  background: transparent;
  border: none;
  color: var(--foreground-muted, var(--text-muted));
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.nav-button:hover {
  background: var(--hover-bg);
  color: var(--foreground, var(--text-color));
}

.keyboard-hint {
  font-size: var(--font-size-xs);
  color: var(--foreground-muted, var(--text-muted));
  background: var(--meta-bg);
  border: 1px solid var(--section-border);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
}

.filter-chips {
  display: flex;
  gap: var(--spacing-xs);
}

.filter-chip {
  background: transparent;
  border: 1px solid var(--section-border);
  color: var(--foreground-muted, var(--text-muted));
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-chip:hover {
  background: var(--hover-bg);
  color: var(--foreground, var(--text-color));
  border-color: var(--foreground-muted, var(--text-muted));
}

.filter-chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.action-button {
  background: transparent;
  border: 1px solid var(--section-border);
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.action-button:hover {
  background: var(--hover-bg);
  color: var(--text-color);
  border-color: var(--text-muted);
  transform: scale(1.05);
}

.action-button.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .command-bar {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }

  .filter-chips {
    flex: 1;
  }

  .filter-chip {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}
</style>
