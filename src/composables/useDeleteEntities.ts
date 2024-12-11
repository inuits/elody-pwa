import { inject } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  Collection,
  DeleteDataDocument,
  type DeleteDataMutation,
  Entitytyping,
} from "@/generated-types/queries";
import { type InBulkProcessableItem } from "@/composables/useBulkOperations";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { apolloClient } from "@/main";
import { ref } from "vue";
import { useImport } from "./useImport";

export const useDeleteEntities = () => {
  const config: any = inject("config");
  const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
  const { loadDocument } = useImport();

  const form = ref<any | undefined>(undefined);

  const getQuery = async (queryName: string) => {
    return await loadDocument(queryName);
  };

  const getDeletionForm = async (queryDocument: any): Promise<void> => {
    const query = await getQuery(queryDocument);
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

    const childRoutes = getChildrenOfHomeRoutes(config).map(
      (route: any) => route.meta,
    );

    const deleteEntities = {
      ...(linkedEntitiesToRemove ? linkedEntitiesToRemove : {}),
      deleteMediafiles:
        linkedEntitiesToRemove?.["deleteMediafiles"] || deleteMediafiles,
    };

    const deletePromises = items.map(
      (item: InBulkProcessableItem | { id: string; type: string }) => {
        let collection;
        if (item?.type?.toLowerCase() === Entitytyping.Mediafile) {
          collection = Collection.Mediafiles;
        } else {
          const matchedRoute = childRoutes.find(
            (route: any) => route.entityType === item.type,
          );
          collection = matchedRoute?.type;
        }

        return mutate({
          id: item.id,
          path: collection,
          ...deleteEntities,
        });
      },
    );

    await Promise.all(deletePromises);
    return true;
  };

  return {
    form,
    deleteEntities,
    getDeletionForm,
  };
};
