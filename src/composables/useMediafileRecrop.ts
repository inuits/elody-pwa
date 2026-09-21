import { ref, computed } from "vue";
import { apolloClient } from "@/main";
import {
  GetEntityByIdDocument,
  type Entity,
  type Entitytyping,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import { updateRelationDirect } from "@/composables/useUpdateRelation";
import type { CropAreaCoordinates } from "@/composables/useMediafileCrop";

export const useMediafileRecrop = (props?: {
  parentEntityId?: string;
  parentEntityType?: Entitytyping;
  relationType?: string;
  cropMediafileCoordinatesKey?: string;
}) => {
  const isRecropModalOpen = ref(false);

  const canRecrop = computed(() =>
    Boolean(
      props?.parentEntityId &&
      props?.parentEntityType &&
      props?.relationType &&
      props?.cropMediafileCoordinatesKey,
    ),
  );

  const openRecropModal = () => {
    isRecropModalOpen.value = true;
  };

  const closeRecropModal = () => {
    isRecropModalOpen.value = false;
  };

  const fetchParentEntity = async (): Promise<Entity> => {
    const variables: GetEntityByIdQueryVariables = {
      id: props!.parentEntityId!,
      type: props!.parentEntityType!,
    };
    const { data } = await apolloClient.query({
      query: GetEntityByIdDocument,
      variables,
      fetchPolicy: "no-cache",
    });
    return data.Entity!;
  };

  const saveRecrop = async (
    coordinates: CropAreaCoordinates,
    mediafileId: string,
  ) => {
    if (!canRecrop.value) return;

    const parentEntity = await fetchParentEntity();
    await updateRelationDirect(
      parentEntity,
      props!.relationType!,
      mediafileId,
      { [props!.cropMediafileCoordinatesKey!]: coordinates },
    );

    isRecropModalOpen.value = false;
  };

  return {
    isRecropModalOpen,
    canRecrop,
    openRecropModal,
    closeRecropModal,
    saveRecrop,
  };
};
