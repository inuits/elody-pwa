import { computed, inject } from "vue";
import type { Ref } from "vue";
import {
  type Entity,
  Entitytyping,
  RelationActions,
} from "@/generated-types/queries";
import {
  getEntityPageRoute,
  updateEntityMediafileOnlyForMediafiles,
} from "@/helpers";
import { useLibraryBar } from "@/composables/useLibraryBar";
import EventBus from "@/EventBus";
import type { OrderItem } from "@/composables/useOrderListItems";

export interface EntityListHelpersProps {
  idsOfNonSelectableEntities?: string[];
  parentEntityIdentifiers?: string[];
  enableNavigation?: boolean;
  showCurrentEntityFlow?: boolean;
  allowedActionsOnRelations?: RelationActions[];
}

export const useEntityListHelpers = (
  props: EntityListHelpersProps,
  refEntities: Ref<Entity[]>,
  previewComponentEnabled: Ref<boolean>,
  togglePreviewComponent: (entityId: string) => void,
) => {
  const mediafileViewerContext: any = inject("mediafileViewerContext");
  const isPreviewElement: boolean = inject("IsPreviewElement", false);
  const { queryVariables } = useLibraryBar();

  const containerNameForPreview = computed(() =>
    props.showCurrentEntityFlow
      ? "preview"
      : "preview-without-current-entity-flow",
  );

  const getLinkSettings = (
    entity: Entity,
    listItemRouteName: string = "",
    force = false,
  ) => {
    if ((!props.enableNavigation || previewComponentEnabled.value) && !force) {
      if (
        (props.parentEntityIdentifiers?.length ?? 0) > 0 &&
        entity.type.toLowerCase() === Entitytyping.Mediafile
      )
        return { tag: "div", path: undefined };
      return { tag: "div", path: undefined };
    }
    return {
      tag: "router-link",
      path: getEntityPageRoute(entity, listItemRouteName),
    };
  };

  const isEntityDisabled = (entity: Entity) =>
    (props.idsOfNonSelectableEntities ?? []).includes(entity.id) ||
    (props.idsOfNonSelectableEntities ?? []).includes(entity.uuid);

  const entityWrapperHandler = (entity: Entity) => {
    if (previewComponentEnabled.value)
      togglePreviewComponent(entity.id || entity.uuid);
    if (isEntityDisabled(entity) || !props.enableNavigation) return;
    updateEntityMediafileOnlyForMediafiles(mediafileViewerContext, entity);
  };

  const getContextMenu = (entity: Entity) => {
    if (entity.teaserMetadata?.forceShowContextMenuActions)
      return entity.teaserMetadata?.contextMenuActions;
    if ((props.parentEntityIdentifiers?.length ?? 0) > 0)
      return entity.teaserMetadata?.contextMenuActions;
    return undefined;
  };

  EventBus.on("orderList_changed", (orderItems: OrderItem[]) => {
    let itemsFound = false;
    refEntities.value.forEach((entity) => {
      const fieldKeyWithId = `order-${entity.id}`;
      const item = orderItems.find((item) => item.field === fieldKeyWithId);
      if (!item) return;
      entity.intialValues.order = item.currentValue;
      entity.teaserMetadata.order.value = item.currentValue;
      itemsFound = true;
    });
    if (itemsFound) {
      refEntities.value.sort((a, b) =>
        a.intialValues.order > b.intialValues.order ? 1 : -1,
      );
      if (!queryVariables.value.searchValue.isAsc) refEntities.value.reverse();
    }
  });

  return {
    containerNameForPreview,
    getLinkSettings,
    isEntityDisabled,
    entityWrapperHandler,
    getContextMenu,
    isPreviewElement,
    mediafileViewerContext,
  };
};
