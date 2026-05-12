import { computed } from "vue";
import { useRoute } from "vue-router";
import { mapUrlToEntityType } from "@/helpers";
import type {
  ContextMenuActionRouteConfig,
  EntityButtonConfig,
  EntityConfig,
} from "@/types/contextMenuRouteConfig";

export const useEntityPageConfig = () => {
  const route = useRoute();

  const entityConfig = computed<EntityConfig | undefined>(() => {
    const config = route.meta.entityPageConfig;
    if (!config) return undefined;
    const slug = String(route.params["type"] ?? "");
    const entityType = mapUrlToEntityType(slug) || slug;
    if (!entityType) return undefined;
    return config[entityType];
  });

  const actions = computed<ContextMenuActionRouteConfig[]>(
    () => entityConfig.value?.actions ?? [],
  );

  const hasEditMetadataButton = computed<boolean | undefined>(
    () => entityConfig.value?.hasEditMetadataButton,
  );

  const deleteButton = computed<EntityButtonConfig | false | undefined>(
    () => entityConfig.value?.deleteButton,
  );

  return { actions, hasEditMetadataButton, deleteButton };
};
