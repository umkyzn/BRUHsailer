import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import App from '../App.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/c/0/s/0-0'
  },
  {
    path: '/c/:chapterId',
    redirect: to => {
      // Redirect chapter-only view to first section
      return `/c/${to.params.chapterId}/s/${to.params.chapterId}-0`;
    }
  },
  {
    path: '/c/:chapterId/s/:sectionId',
    name: 'section',
    component: App,
    props: true,
  },
  {
    path: '/c/:chapterId/s/:sectionId/step/:stepId',
    redirect: to => {
      // Redirect step-specific URLs to section view (scroll handled by hash)
      return {
        path: `/c/${to.params.chapterId}/s/${to.params.sectionId}`,
        hash: `#step-${to.params.stepId}`
      };
    }
  },
];

const router = createRouter({
  history: createWebHashHistory('/BRUHsailer/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    // Don't scroll on filter/search changes (same path)
    if (to.path === from.path && to.query !== from.query) {
      return false;
    }
    return { top: 0 };
  },
});

export default router;

// Helper function to generate shareable links
export function getShareableLink(
  chapterId: number,
  sectionId?: string,
  stepId?: string
): string {
  const base = `${window.location.origin}/BRUHsailer/#`;

  if (stepId && sectionId) {
    return `${base}/c/${chapterId}/s/${sectionId}#step-${stepId}`;
  }
  if (sectionId) {
    return `${base}/c/${chapterId}/s/${sectionId}`;
  }
  return `${base}/c/${chapterId}/s/${chapterId}-0`;
}
