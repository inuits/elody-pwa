import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDeleteRelations } from '@/composables/useDeleteRelations';
import { useFormHelper } from '@/composables/useFormHelper';
import useEditMode from '@/composables/useEdit';
import { useMutation } from '@vue/apollo-composable';
import { useI18n } from 'vue-i18n';
import { useBaseModal } from '@/composables/useBaseModal';
import { useNotification } from '@/components/base/BaseNotification.vue';
import { useBulkOperations } from '@/composables/useBulkOperations';
import { EditStatus, TypeModals, Collection } from '@/generated-types/queries';
import type { FormContext } from 'vee-validate';
import type { Context } from '@/composables/useBulkOperations';

vi.mock('@/composables/useFormHelper');
vi.mock('@/composables/useEdit');
vi.mock('@vue/apollo-composable');
vi.mock('vue-i18n');
vi.mock('@/composables/useBaseModal');
vi.mock('@/components/base/BaseNotification.vue');
vi.mock('@/composables/useBulkOperations');

describe('useDeleteRelations', () => {
  let deleteRelations: ReturnType<typeof useDeleteRelations>['deleteRelations'];
  let submit: ReturnType<typeof useDeleteRelations>['submit'];
  let mockForm: FormContext;
  let mockContext: Context;
  let mockSelectedItems: { key: string }[];

  beforeEach(() => {
    vi.clearAllMocks();

    const mockParseFormValuesToFormInput = vi.fn().mockReturnValue({
      field1: 'value1',
      field2: 'value2',
    });

    const mockFindRelation = vi.fn().mockReturnValue({
      relation: { id: 'relation-1', editStatus: EditStatus.New },
    });
    const mockGetForm = vi.fn().mockReturnValue({
      setFieldValue: vi.fn(),
      values: { relationValues: {} },
      resetForm: vi.fn(),
    });
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockCloseModal = vi.fn();
    const mockCreateNotification = vi.fn();
    const mockT = vi.fn().mockReturnValue('translated text');
    const mockDequeueItemForBulkProcessing = vi.fn();
    const mockMutateEntityValues = vi.fn().mockResolvedValue({
      data: { mutateEntityValues: { id: 'entity-1', intialValues: {}, relationValues: {} } },
    });

    (useFormHelper as any).mockReturnValue({
      findRelation: mockFindRelation,
      getForm: mockGetForm,
      parseFormValuesToFormInput: mockParseFormValuesToFormInput,
    });
    (useEditMode as any).mockReturnValue({
      save: mockSave,
      disableEditMode: vi.fn(),
    });
    (useMutation as any).mockReturnValue({
      mutate: mockMutateEntityValues,
    });
    (useI18n as any).mockReturnValue({
      t: mockT,
    });
    (useBaseModal as any).mockReturnValue({
      closeModal: mockCloseModal,
    });
    (useNotification as any).mockReturnValue({
      createNotification: mockCreateNotification,
    });
    (useBulkOperations as any).mockReturnValue({
      dequeueItemForBulkProcessing: mockDequeueItemForBulkProcessing,
    });

    const { deleteRelations: deleteRelationsFn, submit: submitFn } = useDeleteRelations();
    deleteRelations = deleteRelationsFn;
    submit = submitFn;

    mockForm = mockGetForm();
    mockContext = "Home" as Context;
    mockSelectedItems = [{ key: 'item-1' }, { key: 'item-2' }];
  });

  describe('deleteRelations', () => {
    it('should delete relations and update the form', async () => {
      await deleteRelations('entity-1', 'relation-type-1', mockSelectedItems, mockContext);

      expect(mockForm.setFieldValue).toHaveBeenCalledWith(
        'relationValues.relation-type-1',
        [
          { id: 'relation-1', editStatus: EditStatus.Deleted },
          { id: 'relation-1', editStatus: EditStatus.Deleted },
        ],
      );

      expect(useEditMode().save).toHaveBeenCalled();

      expect(useBulkOperations().dequeueItemForBulkProcessing).toHaveBeenCalledTimes(2);
    });

    it('should not proceed if form is not found', async () => {
      (useFormHelper().getForm as any).mockReturnValue(null);

      await deleteRelations('entity-1', 'relation-type-1', mockSelectedItems, mockContext);

      expect(mockForm.setFieldValue).not.toHaveBeenCalled();
      expect(useEditMode().save).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should submit the form and reset it on success', async () => {
      await submit('entity-1', "entity" as Collection, TypeModals.BulkOperationsDeleteRelations);

      expect(useMutation().mutate).toHaveBeenCalledWith({
        id: 'entity-1',
        formInput: {
          field1: 'value1',
          field2: 'value2',
        },
        collection: "entity" as Collection,
      });

      expect(mockForm.resetForm).toHaveBeenCalledWith({
        values: {
          intialValues: {},
          relationValues: {},
        },
      });

      expect(useBaseModal().closeModal).toHaveBeenCalledWith(TypeModals.BulkOperationsDeleteRelations);

      expect(useNotification().createNotification).toHaveBeenCalled();

      expect(useEditMode().disableEditMode).toHaveBeenCalled();
    });

    it('should not proceed if form is not found', async () => {
      (useFormHelper().getForm as any).mockReturnValue(null);

      await submit('entity-1', "entity" as Collection);

      expect(useMutation().mutate).not.toHaveBeenCalled();
      expect(mockForm.resetForm).not.toHaveBeenCalled();
    });

    it('should not proceed if mutation result is invalid', async () => {
      (useMutation().mutate as any).mockResolvedValue({ data: null });

      await submit('entity-1', "entity" as Collection);

      expect(mockForm.resetForm).not.toHaveBeenCalled();
    });
  });
});