import { computed } from "vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import {
  useBulkOperations,
  BulkOperationsContextEnum,
} from "@/composables/useBulkOperations";

export interface CropAreaCoordinates {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const useMediafileCrop = (props?: {
  currentMediafile?: any;
  cropMediafileCoordinatesKey?: string;
}) => {
  const { getEnqueuedItem, isEnqueued } = useBulkOperations();

  const cropSizes = computed<CropAreaCoordinates | undefined>(() => {
    if (!props?.cropMediafileCoordinatesKey) return;
    const initialValues = props.currentMediafile?.intialValues;
    return initialValues?.[props.cropMediafileCoordinatesKey];
  });

  const isCropModeEnabled = computed(() =>
    useEntityPickerModal().getIsCropModeEnabled(),
  );

  const keyToSaveCropCoordinates = computed(() =>
    useEntityPickerModal().getCropCoordinatesKey(),
  );

  const addMediafileCropCoordinates = (
    coordinates: CropAreaCoordinates,
    mediafileId: string,
  ) => {
    if (!keyToSaveCropCoordinates.value) return;

    const item = getEnqueuedItem(
      BulkOperationsContextEnum.EntityElementMediaEntityPickerModal,
      mediafileId,
    );
    if (!item) return;

    item.metadata = [
      { key: keyToSaveCropCoordinates.value, value: coordinates },
    ];
  };

  const isSelectable = (mediafileId: string) => {
    return isEnqueued(
      BulkOperationsContextEnum.EntityElementMediaEntityPickerModal,
      mediafileId,
    );
  };

  return {
    cropSizes,
    isCropModeEnabled,
    keyToSaveCropCoordinates,
    addMediafileCropCoordinates,
    isSelectable,
  };
};
