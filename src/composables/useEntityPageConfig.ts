import { computed } from "vue";
import { useRoute, useRouter, type RouteRecordNormalized } from "vue-router";
import { mapUrlToEntityType } from "@/helpers";
import type {
  ContextMenuActionRouteConfig,
  EntityButtonConfig,
  EntityConfig,
  ToggleEntityButtonConfig,
} from "@/types/contextMenuRouteConfig";

export const useEntityPageConfig = () => {
  const route = useRoute();
  const router = useRouter();

  const entityTypeFromOverviewRoute = (slug: string): string | undefined => {
    const overviewRoute = router
      ?.getRoutes?.()
      ?.find(
        (registeredRoute: RouteRecordNormalized) =>
          registeredRoute.meta?.entityType &&
          (registeredRoute.meta.slug === slug ||
            registeredRoute.path.split("/").filter(Boolean).pop() === slug),
      );
    return overviewRoute ? String(overviewRoute.meta.entityType) : undefined;
  };

  const entityConfig = computed<EntityConfig | undefined>(() => {
    const config = route.meta.entityPageConfig;
    if (!config) return undefined;
    const slug = String(route.params["type"] ?? "");
    const entityType =
      entityTypeFromOverviewRoute(slug) ||
      mapUrlToEntityType(slug) ||
      slug ||
      String(route.meta.entityType ?? "");
    if (!entityType) return undefined;
    return config[entityType] ?? config[entityType.toLowerCase()];
  });

  const actions = computed<ContextMenuActionRouteConfig[]>(
    () => entityConfig.value?.actions ?? [],
  );

  const hasEditMetadataButton = computed<boolean | undefined>(
    () => entityConfig.value?.hasEditMetadataButton,
  );

  const deleteButton = computed<
    EntityButtonConfig | ToggleEntityButtonConfig | false | undefined
  >(() => entityConfig.value?.deleteButton);

  const trackSeen = computed<boolean>(
    () => entityConfig.value?.trackSeen === true,
  );

  const jobStatusPolling = computed<boolean>(
    () => entityConfig.value?.jobStatusPolling === true,
  );

  return {
    actions,
    hasEditMetadataButton,
    deleteButton,
    trackSeen,
    jobStatusPolling,
  };
};
