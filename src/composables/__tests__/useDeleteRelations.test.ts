import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDeleteRelations } from "@/composables/useDeleteRelations";
import { useFormHelper } from "@/composables/useFormHelper";
import useEditMode from "@/composables/useEdit";
import { useI18n } from "vue-i18n";
import { useBaseModal } from "@/composables/useBaseModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useBulkOperations } from "@/composables/useBulkOperations";
import type { Collection } from "@/generated-types/queries";
import { EditStatus, TypeModals } from "@/generated-types/queries";
import type { FormContext } from "vee-validate";
import type { Context } from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";

vi.mock("@/composables/useFormHelper");
vi.mock("@/composables/useEdit");
vi.mock("vue-i18n");
vi.mock("@/composables/useBaseModal");
vi.mock("@/composables/useBaseNotification");
vi.mock("@/composables/useBulkOperations");
vi.mock("@/main", () => ({
  apolloClient: {
    mutate: vi.fn(),
  },
}));

describe("useDeleteRelations", () => {
  let deleteRelations: ReturnType<typeof useDeleteRelations>["deleteRelations"];
  let submit: ReturnType<typeof useDeleteRelations>["submit"];
  let mockForm: FormContext;
  let mockContext: Context;
  let mockSelectedItems: { key: string }[];

  beforeEach(() => {
    vi.clearAllMocks();

    const mockParseFormValuesToFormInput = vi.fn().mockReturnValue({
      field1: "value1",
      field2: "value2",
    });

    const mockFindRelation = vi.fn().mockReturnValue({
      relation: { id: "relation-1", editStatus: EditStatus.New },
    });
    const mockGetRelationsBasedOnType = vi.fn().mockReturnValue([]);
    const mockGetForm = vi.fn().mockReturnValue({
      setFieldValue: vi.fn(),
      values: { relationValues: {} },
      resetForm: vi.fn(),
    });
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockCloseModal = vi.fn();
    const mockDisplaySuccessNotification = vi.fn();
    const mockT = vi.fn().mockReturnValue("translated text");
    const mockDequeueItemForBulkProcessing = vi.fn();

    (apolloClient.mutate as any).mockResolvedValue({
      data: {
        mutateEntityValues: {
          id: "entity-1",
          intialValues: {},
          relationValues: {},
        },
      },
    });

    (useFormHelper as any).mockReturnValue({
      findRelation: mockFindRelation,
      getRelationsBasedOnType: mockGetRelationsBasedOnType,
      getForm: mockGetForm,
      parseFormValuesToFormInput: mockParseFormValuesToFormInput,
    });
    (useEditMode as any).mockReturnValue({
      save: mockSave,
      disableEditMode: vi.fn(),
    });
    (useI18n as any).mockReturnValue({
      t: mockT,
    });
    (useBaseModal as any).mockReturnValue({
      closeModal: mockCloseModal,
    });
    (useBaseNotification as any).mockReturnValue({
      displaySuccessNotification: mockDisplaySuccessNotification,
    });
    (useBulkOperations as any).mockReturnValue({
      dequeueItemForBulkProcessing: mockDequeueItemForBulkProcessing,
    });

    const { deleteRelations: deleteRelationsFn, submit: submitFn } =
      useDeleteRelations();
    deleteRelations = deleteRelationsFn;
    submit = submitFn;

    mockForm = mockGetForm();
    mockContext = "Home" as Context;
    mockSelectedItems = [{ key: "item-1" }, { key: "item-2" }];
  });

  describe("deleteRelations", () => {
    it("should delete relations and update the form", async () => {
      await deleteRelations(
        "entity-1",
        "relation-type-1",
        mockSelectedItems,
        mockContext,
      );

      expect(mockForm.setFieldValue).toHaveBeenCalledWith(
        "relationValues.relation-type-1",
        [
          { id: "relation-1", editStatus: EditStatus.Deleted },
          { id: "relation-1", editStatus: EditStatus.Deleted },
        ],
      );

      expect(useEditMode().save).toHaveBeenCalled();
      expect(
        useBulkOperations().dequeueItemForBulkProcessing,
      ).toHaveBeenCalledTimes(2);
    });

    it("should not proceed if form is not found", async () => {
      (useFormHelper().getForm as any).mockReturnValue(null);

      await deleteRelations(
        "entity-1",
        "relation-type-1",
        mockSelectedItems,
        mockContext,
      );

      expect(mockForm.setFieldValue).not.toHaveBeenCalled();
      expect(useEditMode().save).not.toHaveBeenCalled();
    });
  });

  describe("submit", () => {
    it("should submit the form and reset it on success", async () => {
      await submit(
        "entity-1",
        "entity" as Collection,
        TypeModals.BulkOperationsDeleteRelations,
      );

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          id: "entity-1",
          formInput: {
            field1: "value1",
            field2: "value2",
          },
          collection: "entity",
        },
      });

      expect(mockForm.resetForm).toHaveBeenCalledWith({
        values: {
          intialValues: {},
          relationValues: {},
        },
      });

      expect(useBaseModal().closeModal).toHaveBeenCalledWith(
        TypeModals.BulkOperationsDeleteRelations,
      );

      expect(
        useBaseNotification().displaySuccessNotification,
      ).toHaveBeenCalled();
      expect(useEditMode().disableEditMode).toHaveBeenCalled();
    });

    it("should not proceed if form is not found", async () => {
      (useFormHelper().getForm as any).mockReturnValue(null);

      await submit("entity-1", "entity" as Collection);

      expect(apolloClient.mutate).not.toHaveBeenCalled();
      expect(mockForm.resetForm).not.toHaveBeenCalled();
    });

    it("should not proceed if mutation result is invalid", async () => {
      (apolloClient.mutate as any).mockResolvedValue({ data: null });

      await submit("entity-1", "entity" as Collection);

      expect(mockForm.resetForm).not.toHaveBeenCalled();
    });
  });
});
