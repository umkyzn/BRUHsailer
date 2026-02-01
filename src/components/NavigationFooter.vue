<template>
  <footer class="navigation-footer">
    <div class="footer-content">
      <router-link
        v-if="adjacentSections.prev"
        :to="`/c/${adjacentSections.prev.chapterId}/s/${adjacentSections.prev.sectionId}`"
        class="nav-link prev"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <div class="nav-text">
          <span class="nav-label">Previous</span>
          <span class="nav-title">{{ adjacentSections.prev.section.title }}</span>
        </div>
      </router-link>
      <div v-else class="nav-placeholder"></div>

      <router-link
        v-if="adjacentSections.next"
        :to="`/c/${adjacentSections.next.chapterId}/s/${adjacentSections.next.sectionId}`"
        class="nav-link next"
      >
        <div class="nav-text">
          <span class="nav-label">Next</span>
          <span class="nav-title">{{ adjacentSections.next.section.title }}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </router-link>
      <div v-else class="nav-placeholder"></div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGuideStore } from '@/stores/guide';

const route = useRoute();
const guideStore = useGuideStore();

const adjacentSections = computed(() => {
  const chapterId = route.params.chapterId ? Number(route.params.chapterId) : null;
  const sectionId = route.params.sectionId as string | null;

  if (chapterId === null || !sectionId) {
    return { prev: null, next: null };
  }

  return guideStore.getAdjacentSections(chapterId, sectionId);
});
</script>

