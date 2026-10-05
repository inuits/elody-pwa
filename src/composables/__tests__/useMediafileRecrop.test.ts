import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CropAreaCoordinates } from "@/composables/useMediafileCrop";
import { EditStatus } from "@/generated-types/queries";

const { mockQuery, mockMutate } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockMutate: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/main", () => ({
  apolloClient: { query: mockQuery, mutate: mockMutate },
}));

import { useMediafileRecrop } from "@/composables/useMediafileRecrop";

const coordinates: CropAreaCoordinates = { x: 1, y: 2, w: 3, h: 4 };

const baseProps = {
  parentEntityId: "parent-1",
  parentEntityType: "inscription" as const,
  relationType: "refMediafiles",
  cropMediafileCoordinatesKey: "coordinates",
};

describe("useMediafileRecrop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("canRecrop", () => {
    it("is false when parentEntityId is missing", () => {
      const { canRecrop } = useMediafileRecrop({
        parentEntityType: baseProps.parentEntityType,
        relationType: baseProps.relationType,
        cropMediafileCoordinatesKey: baseProps.cropMediafileCoordinatesKey,
      });
      expect(canRecrop.value).toBe(false);
    });

    it("is false when parentEntityType is missing", () => {
      const { canRecrop } = useMediafileRecrop({
        parentEntityId: baseProps.parentEntityId,
        relationType: baseProps.relationType,
        cropMediafileCoordinatesKey: baseProps.cropMediafileCoordinatesKey,
      });
      expect(canRecrop.value).toBe(false);
    });

    it("is false when relationType is missing", () => {
      const { canRecrop } = useMediafileRecrop({
        parentEntityId: baseProps.parentEntityId,
        parentEntityType: baseProps.parentEntityType,
        cropMediafileCoordinatesKey: baseProps.cropMediafileCoordinatesKey,
      });
      expect(canRecrop.value).toBe(false);
    });

    it("is false when cropMediafileCoordinatesKey is missing", () => {
      const { canRecrop } = useMediafileRecrop({
        parentEntityId: baseProps.parentEntityId,
        parentEntityType: baseProps.parentEntityType,
        relationType: baseProps.relationType,
      });
      expect(canRecrop.value).toBe(false);
    });

    it("is true when all four are present", () => {
      const { canRecrop } = useMediafileRecrop(baseProps);
      expect(canRecrop.value).toBe(true);
    });
  });

  describe("openRecropModal / closeRecropModal", () => {
    it("toggles isRecropModalOpen", () => {
      const { isRecropModalOpen, openRecropModal, closeRecropModal } =
        useMediafileRecrop(baseProps);

      expect(isRecropModalOpen.value).toBe(false);
      openRecropModal();
      expect(isRecropModalOpen.value).toBe(true);
      closeRecropModal();
      expect(isRecropModalOpen.value).toBe(false);
    });
  });

  describe("saveRecrop", () => {
    it("does nothing when canRecrop is false", async () => {
      const { saveRecrop } = useMediafileRecrop({
        relationType: baseProps.relationType,
        cropMediafileCoordinatesKey: baseProps.cropMediafileCoordinatesKey,
      });

      await saveRecrop(coordinates, "mediafile-1");

      expect(mockQuery).not.toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("fetches the parent entity fresh (no-cache) and updates only the target relation, keeping every sibling relation in the mutation", async () => {
      mockQuery.mockResolvedValue({
        data: {
          Entity: {
            id: "parent-1",
            relationValues: {
              refMediafiles: [
                {
                  key: "mediafile-1",
                  editStatus: EditStatus.Unchanged,
                  metadata: [],
                },
                {
                  key: "mediafile-2",
                  editStatus: EditStatus.Unchanged,
                  metadata: [],
                },
              ],
              refCreators: [
                { key: "creator-1", editStatus: EditStatus.Unchanged },
              ],
            },
          },
        },
      });

      const { saveRecrop } = useMediafileRecrop(baseProps);
      await saveRecrop(coordinates, "mediafile-1");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { id: "parent-1", type: "inscription" },
          fetchPolicy: "no-cache",
        }),
      );

      expect(mockMutate).toHaveBeenCalledOnce();
      const { variables } = mockMutate.mock.calls[0][0];
      expect(variables.id).toBe("parent-1");

      const relations = variables.formInput.relations;
      const target = relations.find((r: any) => r.key === "mediafile-1");
      const sibling = relations.find((r: any) => r.key === "mediafile-2");
      const otherType = relations.find((r: any) => r.key === "creator-1");

      expect(target.editStatus).toBe(EditStatus.Changed);
      expect(target.metadata).toEqual([
        { key: "coordinates", value: coordinates },
      ]);
      expect(sibling.editStatus).toBe(EditStatus.Unchanged);
      expect(otherType.editStatus).toBe(EditStatus.Unchanged);
    });

    it("closes the recrop modal after a successful save", async () => {
      mockQuery.mockResolvedValue({
        data: { Entity: { id: "parent-1", relationValues: {} } },
      });

      const { isRecropModalOpen, openRecropModal, saveRecrop } =
        useMediafileRecrop(baseProps);

      openRecropModal();
      expect(isRecropModalOpen.value).toBe(true);

      await saveRecrop(coordinates, "mediafile-1");

      expect(isRecropModalOpen.value).toBe(false);
    });

    it("leaves the recrop modal open when the query rejects", async () => {
      mockQuery.mockRejectedValue(new Error("network error"));

      const { isRecropModalOpen, openRecropModal, saveRecrop } =
        useMediafileRecrop(baseProps);

      openRecropModal();
      await expect(saveRecrop(coordinates, "mediafile-1")).rejects.toThrow(
        "network error",
      );

      expect(isRecropModalOpen.value).toBe(true);
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
