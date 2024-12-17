import { useMutation } from "@vue/apollo-composable";
import {
  Collection,
  BulkDeleteEntitiesDocument,
  type BulkDeleteEntitiesMutation,
} from "@/generated-types/queries";
import { type InBulkProcessableItem } from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";
import { ref } from "vue";
import { useImport } from "./useImport";

export const useDeleteEntities = () => {
  const { mutate } = useMutation<BulkDeleteEntitiesMutation>(
    BulkDeleteEntitiesDocument,
  );
  const { loadDocument } = useImport();

  const form = ref<any | undefined>(undefined);

  const getDeletionForm = async (queryDocument: any): Promise<void> => {
    const query = await loadDocument(queryDocument);
    const response = await apolloClient.query({
      query,
    });

    form.value = response.data.GetDynamicForm.formTab.formFields.field;
  };

  const deleteEntities = async (
    items: InBulkProcessableItem[] | { id: string; type: string }[],
    deleteMediafiles: boolean = false,
    linkedEntitiesToRemove: { [key: string]: boolean } | undefined,
  ) => {
    if (items.length === 0) return;

    const deleteEntities = {
      ...(linkedEntitiesToRemove ? linkedEntitiesToRemove : {}),
      deleteMediafiles:
        linkedEntitiesToRemove?.["deleteMediafiles"] || deleteMediafiles,
    };

    await mutate({
      ids: items.map((item: { id: string }) => item.id),
      path: Collection.Entities,
      deleteEntities,
    });

    return true;
  };

  return {
    form,
    deleteEntities,
    getDeletionForm,
  };
};
