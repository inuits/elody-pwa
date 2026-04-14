import { ref, watch } from "vue";
import type { Ref } from "vue";
import {
  BaseLibraryModes,
  type Entity,
  Entitytyping,
  GetPreviewComponentsDocument,
  ListItemCoverageTypes,
  type PreviewComponent,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";

export interface PreviewComponentProps {
  entityType: Entitytyping;
  baseLibraryMode?: BaseLibraryModes;
}

export const usePreviewComponent = (
  props: PreviewComponentProps,
  refEntities: Ref<Entity[]>,
) => {
  const previewComponent = ref<PreviewComponent | undefined>(undefined);
  const previewComponentEnabled = ref<boolean>(false);
  const previewForEntity = ref<string | undefined>(undefined);

  const getPreviewItemsForEntity = async () => {
    previewComponent.value = undefined;
    previewComponentEnabled.value = false;
    previewForEntity.value = undefined;
    apolloClient
      .query({
        query: GetPreviewComponentsDocument,
        variables: { entityType: props.entityType },
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        previewComponent.value =
          result.data.PreviewComponents?.previewComponent;
        if (previewComponent.value?.openByDefault && refEntities.value[0]?.id)
          togglePreviewComponent(refEntities.value[0].id);
      });
  };

  const togglePreviewComponent = (entityId: string) => {
    if (
      previewComponent.value?.listItemsCoverage ===
      ListItemCoverageTypes.AllListItems
    )
      previewComponentEnabled.value = !previewComponentEnabled.value;
    else
      previewComponentEnabled.value = !(
        previewComponentEnabled.value && previewForEntity.value === entityId
      );
    previewForEntity.value = entityId;
  };

  const closePreviewComponent = () => {
    previewComponentEnabled.value = false;
    previewForEntity.value = undefined;
  };

  const isPreviewComponentEnabledForListItem = (entityId: string): boolean => {
    if (!previewComponentEnabled.value) return false;
    if (
      previewComponent.value?.listItemsCoverage ===
      ListItemCoverageTypes.AllListItems
    )
      return true;
    if (
      previewComponent.value?.listItemsCoverage ===
        ListItemCoverageTypes.OneListItem &&
      previewForEntity.value === entityId
    )
      return true;
    return false;
  };

  const configurePreviewComponentWithNewEntities = (
    entities: Entity[],
  ): void => {
    if (previewComponentEnabled.value) previewForEntity.value = entities[0]?.id;
  };

  watch(
    () => props.entityType,
    () => {
      if (
        props.entityType === undefined ||
        (props.baseLibraryMode !== BaseLibraryModes.NormalBaseLibrary &&
          props.baseLibraryMode !== BaseLibraryModes.PreviewBaseLibrary)
      )
        return;
      getPreviewItemsForEntity();
    },
    { immediate: true },
  );

  watch(
    () => refEntities.value,
    (newEntities) => {
      if (newEntities.length > 0)
        configurePreviewComponentWithNewEntities(newEntities);
      if (
        !previewForEntity.value &&
        previewComponent.value?.openByDefault &&
        newEntities[0]?.id
      )
        togglePreviewComponent(newEntities[0].id);
    },
  );

  return {
    previewComponent,
    previewComponentEnabled,
    previewForEntity,
    togglePreviewComponent,
    closePreviewComponent,
    isPreviewComponentEnabledForListItem,
  };
};
