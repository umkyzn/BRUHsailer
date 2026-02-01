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

<style scoped>
.navigation-footer {
  background: var(--card-bg);
  border-top: 1px solid var(--section-border);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-3xl);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border: 1px solid var(--section-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--foreground, var(--text-color));
  transition: all var(--transition-fast);
  min-height: 80px;
}

.nav-link:hover {
  background: var(--hover-bg);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.nav-link.prev {
  justify-content: flex-start;
}

.nav-link.next {
  justify-content: flex-end;
  grid-column: 2;
}

.nav-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-link.next .nav-text {
  align-items: flex-end;
  text-align: right;
}

.nav-label {
  font-size: var(--font-size-xs);
  color: var(--foreground-muted, var(--text-muted));
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  font-weight: var(--font-semibold);
}

.nav-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-medium);
  color: var(--foreground, var(--text-color));
}

.nav-link svg {
  flex-shrink: 0;
  color: var(--foreground-muted, var(--text-muted));
  transition: all var(--transition-fast);
}

.nav-link:hover svg {
  color: var(--primary);
}

.nav-link.prev:hover svg {
  transform: translateX(-4px);
}

.nav-link.next:hover svg {
  transform: translateX(4px);
}

.nav-placeholder {
  /* Empty space for alignment when prev/next doesn't exist */
}

/* Mobile responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .nav-link {
    padding: var(--spacing-md);
    min-height: 60px;
  }

  .nav-link.next {
    grid-column: 1;
  }

  .nav-title {
    font-size: var(--font-size-sm);
  }
}
</style>
