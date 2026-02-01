import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type FilterType = 'all' | 'completed' | 'incomplete';

export interface SearchResult {
  chapterId: number;
  chapterName: string;
  sectionId: string;
  sectionName: string;
  stepId: string;
  stepIndex: number;
  contextSnippet: string;
  matchCount: number;
}

export const useFilterStore = defineStore('filter', () => {
  const activeFilter = ref<FilterType>('all');
  const minimizeCompleted = ref(false);
  const searchTerm = ref('');
  const searchResults = ref<SearchResult[]>([]);
  const currentResultIndex = ref(0);

  const totalResults = computed(() => searchResults.value.length);
  const hasResults = computed(() => totalResults.value > 0);
  const currentResult = computed(() => 
    hasResults.value ? searchResults.value[currentResultIndex.value] : null
  );

  function setFilter(filter: FilterType) {
    activeFilter.value = filter;
  }

  function toggleMinimize() {
    minimizeCompleted.value = !minimizeCompleted.value;
  }

  function setSearchTerm(term: string) {
    searchTerm.value = term;
    if (!term.trim()) {
      clearSearchResults();
    }
  }

  function clearSearch() {
    searchTerm.value = '';
    clearSearchResults();
  }

  function setSearchResults(results: SearchResult[]) {
    searchResults.value = results;
    currentResultIndex.value = 0;
  }

  function clearSearchResults() {
    searchResults.value = [];
    currentResultIndex.value = 0;
  }

  function nextResult() {
    if (hasResults.value) {
      currentResultIndex.value = (currentResultIndex.value + 1) % totalResults.value;
    }
  }

  function prevResult() {
    if (hasResults.value) {
      currentResultIndex.value = 
        currentResultIndex.value === 0 
          ? totalResults.value - 1 
          : currentResultIndex.value - 1;
    }
  }

  function goToResult(index: number) {
    if (index >= 0 && index < totalResults.value) {
      currentResultIndex.value = index;
    }
  }

  return {
    activeFilter,
    minimizeCompleted,
    searchTerm,
    searchResults,
    currentResultIndex,
    totalResults,
    hasResults,
    currentResult,
    setFilter,
    toggleMinimize,
    setSearchTerm,
    clearSearch,
    setSearchResults,
    clearSearchResults,
    nextResult,
    prevResult,
    goToResult
  };
}, {
  persist: {
    key: 'guideFilter',
    storage: localStorage,
    paths: ['activeFilter', 'minimizeCompleted'], // Don't persist searchTerm or results
  }
});
