import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from 'session-vue-3-oidc-library';

export default function useBreadcrumb() {
  const router = useRouter();
  const route = useRoute();

  const visitedPages = ref([]);
  const pageInfo = ref({ routerTitle: '', entityTitle: '' });

  watch(
    route,
    () => {
      const routerTitle = route.meta.title || router.currentRoute.value.name || 'Home';
      const entityTitle = route.meta.entityTitle || '';

      if (entityTitle) {
        visitedPages.value.push({ title: entityTitle, path: route.path });
      }

      pageInfo.value.routerTitle = routerTitle;
      pageInfo.value.entityTitle = entityTitle;
    },
    { immediate: true }
  );

  const showEntityTitle = computed(() => pageInfo.value.entityTitle !== '');
  const routerTitle = computed(() => pageInfo.value.routerTitle);
  const entityTitle = computed(() => pageInfo.value.entityTitle);

  const auth = useAuth();
  const isAuthenticated = computed(() => auth.isAuthenticated.value);

  return {
    routerTitle,
    entityTitle,
    showEntityTitle,
    isAuthenticated,
    visitedPages,
  };
}
