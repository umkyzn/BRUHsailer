import { computed } from 'vue';
import { useFilterStore } from '@/stores/filter';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function useSearchHighlight(text: string) {
  const filterStore = useFilterStore();

  const highlightedText = computed(() => {
    const searchTerm = filterStore.searchTerm.trim();
    if (!searchTerm) return text;

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  });

  return { highlightedText };
}
