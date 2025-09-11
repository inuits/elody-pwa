import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useMediafileCrop,
  type CropAreaCoordinates,
} from "@/composables/useMediafileCrop";

const mocks = vi.hoisted(() => {
  return {
    useBulkOperations: vi.fn(),
    useEntityPickerModal: vi.fn(),
    getEnqueuedItem: vi.fn(),
    isEnqueued: vi.fn(),
    getIsCropModeEnabled: vi.fn(),
    getCropCoordinatesKey: vi.fn(),
  };
});

vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: mocks.useBulkOperations,
  BulkOperationsContextEnum: {
    EntityElementMediaEntityPickerModal: "EntityElementMediaEntityPickerModal",
  },
}));

vi.mock("@/composables/useEntityPickerModal", () => ({
  default: mocks.useEntityPickerModal,
}));

describe("useMediafileCrop", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useBulkOperations.mockReturnValue({
      getEnqueuedItem: mocks.getEnqueuedItem,
      isEnqueued: mocks.isEnqueued,
    });

    mocks.useEntityPickerModal.mockReturnValue({
      getIsCropModeEnabled: mocks.getIsCropModeEnabled,
      getCropCoordinatesKey: mocks.getCropCoordinatesKey,
    });
  });

  describe("cropSizes", () => {
    it("should return undefined when cropMediafileCoordinatesKey is not provided", () => {
      const { cropSizes } = useMediafileCrop({});
      expect(cropSizes.value).toBeUndefined();
    });

    it("should return undefined when currentMediafile is not provided", () => {
      const { cropSizes } = useMediafileCrop({
        cropMediafileCoordinatesKey: "crop_key",
      });
      expect(cropSizes.value).toBeUndefined();
    });

    it("should return undefined when initialValues does not contain the key", () => {
      const { cropSizes } = useMediafileCrop({
        currentMediafile: { intialValues: {} },
        cropMediafileCoordinatesKey: "non_existent_key",
      });
      expect(cropSizes.value).toBeUndefined();
    });

    it("should return crop coordinates when all conditions are met", () => {
      const expectedCoordinates: CropAreaCoordinates = {
        x: 10,
        y: 20,
        w: 100,
        h: 200,
      };

      const { cropSizes } = useMediafileCrop({
        currentMediafile: {
          intialValues: {
            crop_key: expectedCoordinates,
          },
        },
        cropMediafileCoordinatesKey: "crop_key",
      });

      expect(cropSizes.value).toEqual(expectedCoordinates);
    });

    it("should handle null or undefined initialValues", () => {
      const { cropSizes } = useMediafileCrop({
        currentMediafile: { intialValues: null },
        cropMediafileCoordinatesKey: "crop_key",
      });
      expect(cropSizes.value).toBeUndefined();
    });
  });

  describe("isCropModeEnabled", () => {
    it("should return true when crop mode is enabled", () => {
      mocks.getIsCropModeEnabled.mockReturnValue(true);

      const { isCropModeEnabled } = useMediafileCrop();
      expect(isCropModeEnabled.value).toBe(true);
      expect(mocks.getIsCropModeEnabled).toHaveBeenCalled();
    });

    it("should return false when crop mode is disabled", () => {
      mocks.getIsCropModeEnabled.mockReturnValue(false);

      const { isCropModeEnabled } = useMediafileCrop();
      expect(isCropModeEnabled.value).toBe(false);
    });
  });

  describe("keyToSaveCropCoordinates", () => {
    it("should return the crop coordinates key", () => {
      const expectedKey = "custom_crop_key";
      mocks.getCropCoordinatesKey.mockReturnValue(expectedKey);

      const { keyToSaveCropCoordinates } = useMediafileCrop();
      expect(keyToSaveCropCoordinates.value).toBe(expectedKey);
      expect(mocks.getCropCoordinatesKey).toHaveBeenCalled();
    });

    it("should return undefined when no key is set", () => {
      mocks.getCropCoordinatesKey.mockReturnValue(undefined);

      const { keyToSaveCropCoordinates } = useMediafileCrop();
      expect(keyToSaveCropCoordinates.value).toBeUndefined();
    });

    it("should return null when key is null", () => {
      mocks.getCropCoordinatesKey.mockReturnValue(null);

      const { keyToSaveCropCoordinates } = useMediafileCrop();
      expect(keyToSaveCropCoordinates.value).toBeNull();
    });
  });

  describe("addMediafileCropCoordinates", () => {
    const testCoordinates: CropAreaCoordinates = { x: 5, y: 10, w: 50, h: 75 };
    const mediafileId = "test-mediafile-123";

    it("should not add coordinates when keyToSaveCropCoordinates is undefined", () => {
      mocks.getCropCoordinatesKey.mockReturnValue(undefined);

      const { addMediafileCropCoordinates } = useMediafileCrop();
      addMediafileCropCoordinates(testCoordinates, mediafileId);

      expect(mocks.getEnqueuedItem).not.toHaveBeenCalled();
    });

    it("should not add coordinates when keyToSaveCropCoordinates is null", () => {
      mocks.getCropCoordinatesKey.mockReturnValue(null);

      const { addMediafileCropCoordinates } = useMediafileCrop();
      addMediafileCropCoordinates(testCoordinates, mediafileId);

      expect(mocks.getEnqueuedItem).not.toHaveBeenCalled();
    });

    it("should not add coordinates when enqueued item is not found", () => {
      const cropKey = "crop_coordinates";
      mocks.getCropCoordinatesKey.mockReturnValue(cropKey);
      mocks.getEnqueuedItem.mockReturnValue(undefined);

      const { addMediafileCropCoordinates } = useMediafileCrop();
      addMediafileCropCoordinates(testCoordinates, mediafileId);

      expect(mocks.getEnqueuedItem).toHaveBeenCalledWith(
        "EntityElementMediaEntityPickerModal",
        mediafileId,
      );
    });

    it("should add coordinates to enqueued item metadata", () => {
      const cropKey = "crop_coordinates";
      const mockItem = { metadata: [] };

      mocks.getCropCoordinatesKey.mockReturnValue(cropKey);
      mocks.getEnqueuedItem.mockReturnValue(mockItem);

      const { addMediafileCropCoordinates } = useMediafileCrop();
      addMediafileCropCoordinates(testCoordinates, mediafileId);

      expect(mocks.getEnqueuedItem).toHaveBeenCalledWith(
        "EntityElementMediaEntityPickerModal",
        mediafileId,
      );
      expect(mockItem.metadata).toEqual([
        { key: cropKey, value: testCoordinates },
      ]);
    });

    it("should replace existing metadata with crop coordinates", () => {
      const cropKey = "crop_coordinates";
      const mockItem = {
        metadata: [{ key: "existing_key", value: "old_value" }],
      };

      mocks.getCropCoordinatesKey.mockReturnValue(cropKey);
      mocks.getEnqueuedItem.mockReturnValue(mockItem);

      const { addMediafileCropCoordinates } = useMediafileCrop();
      addMediafileCropCoordinates(testCoordinates, mediafileId);

      expect(mockItem.metadata).toEqual([
        { key: cropKey, value: testCoordinates },
      ]);
    });
  });

  describe("isSelectable", () => {
    const mediafileId = "test-mediafile-456";

    it("should return true when mediafile is enqueued", () => {
      mocks.isEnqueued.mockReturnValue(true);

      const { isSelectable } = useMediafileCrop();
      const result = isSelectable(mediafileId);

      expect(result).toBe(true);
      expect(mocks.isEnqueued).toHaveBeenCalledWith(
        "EntityElementMediaEntityPickerModal",
        mediafileId,
      );
    });

    it("should return false when mediafile is not enqueued", () => {
      mocks.isEnqueued.mockReturnValue(false);

      const { isSelectable } = useMediafileCrop();
      const result = isSelectable(mediafileId);

      expect(result).toBe(false);
      expect(mocks.isEnqueued).toHaveBeenCalledWith(
        "EntityElementMediaEntityPickerModal",
        mediafileId,
      );
    });
  });

  describe("without props", () => {
    it("should work correctly when no props are provided", () => {
      mocks.getIsCropModeEnabled.mockReturnValue(false);
      mocks.getCropCoordinatesKey.mockReturnValue(undefined);
      mocks.isEnqueued.mockReturnValue(false);

      const {
        cropSizes,
        isCropModeEnabled,
        keyToSaveCropCoordinates,
        isSelectable,
      } = useMediafileCrop();

      expect(cropSizes.value).toBeUndefined();
      expect(isCropModeEnabled.value).toBe(false);
      expect(keyToSaveCropCoordinates.value).toBeUndefined();
      expect(isSelectable("test-id")).toBe(false);
    });
  });

  describe("with empty props", () => {
    it("should handle empty props object", () => {
      const { cropSizes } = useMediafileCrop({});
      expect(cropSizes.value).toBeUndefined();
    });
  });
});
