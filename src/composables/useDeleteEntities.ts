import { useMutation } from "@vue/apollo-composable";
import {
  Collection,
  BulkDeleteEntitiesDocument,
  Entitytyping,
  type BulkDeleteEntitiesMutation,
} from "@/generated-types/queries";
import { type InBulkProcessableItem } from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";
import { ref } from "vue";
import { useImport } from "./useImport";
import { goToEntityPageById } from "@/helpers";

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
    linkedEntitiesToRemove: { [key: string]: boolean } | undefined = {},
    skipItemsWithRelationDuringBulkDelete: string[] | undefined = undefined,
  ) => {
    if (items.length === 0) return;
    const types = [...new Set(items.map((item) => item.type))];

    if (types.length > 1) {
      console.error("Items should have the same type");
      return;
    }

    let path;
    if ((types as string[])[0].toLowerCase() === Entitytyping?.Job) {
      path = Collection.Jobs;
    } else if ((types as string[])[0].toLowerCase() === Entitytyping?.Mediafile) {
      path = Collection.Mediafiles;
    } else {
      path = Collection.Entities;
    }

    const result = await mutate({
      ids: items.map((item: { id: string }) => item.id),
      path,
      ...linkedEntitiesToRemove,
      skipItemsWithRelationDuringBulkDelete,
    });

    if (result?.data)
      return result.data.bulkDeleteEntities || true;
    return false;
  };

  return {
    form,
    deleteEntities,
    getDeletionForm,
  };
};
