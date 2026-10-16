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
  openPreviewByDefault?: boolean;
}

export const usePreviewComponent = (
  props: PreviewComponentProps,
  refEntities: Ref<Entity[]>,
) => {
  const previewComponent = ref<PreviewComponent | undefined>(undefined);
  const previewComponentEnabled = ref<boolean>(false);
  const previewForEntity = ref<string | undefined>(undefined);
  const lastPreviewedEntityId = ref<string | undefined>(undefined);

  const shouldOpenByDefault = (): boolean =>
    !!previewComponent.value &&
    (props.openPreviewByDefault ?? !!previewComponent.value.openByDefault);

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
        if (shouldOpenByDefault() && refEntities.value[0]?.id)
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
    if (previewComponentEnabled.value) lastPreviewedEntityId.value = entityId;
  };

  const openPreviewComponent = (entityId: string) => {
    previewComponentEnabled.value = true;
    previewForEntity.value = entityId;
    lastPreviewedEntityId.value = entityId;
  };

  const closePreviewComponent = () => {
    previewComponentEnabled.value = false;
    previewForEntity.value = undefined;
  };

  const togglePreviewForListItem = (entityId: string) => {
    if (!previewComponent.value) return;
    if (previewComponentEnabled.value && previewForEntity.value === entityId)
      closePreviewComponent();
    else openPreviewComponent(entityId);
  };

  // Whether this row's preview is open now: the eye's pressed state.
  const isPreviewOpenForListItem = (entityId: string): boolean => {
    if (!previewComponentEnabled.value) return false;
    const coverage = previewComponent.value?.listItemsCoverage;
    if (coverage === ListItemCoverageTypes.AllListItems) return true;
    return (
      coverage === ListItemCoverageTypes.OneListItem &&
      previewForEntity.value === entityId
    );
  };

  // The row's highlight: open, or (keepLastActiveItemHighlighted) last previewed.
  const isPreviewComponentEnabledForListItem = (entityId: string): boolean => {
    if (isPreviewOpenForListItem(entityId)) return true;
    if (
      previewComponent.value?.previewConfiguration
        ?.keepLastActiveItemHighlighted &&
      lastPreviewedEntityId.value === entityId
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
        shouldOpenByDefault() &&
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
    openPreviewComponent,
    closePreviewComponent,
    togglePreviewForListItem,
    isPreviewComponentEnabledForListItem,
    isPreviewOpenForListItem,
  };
};
