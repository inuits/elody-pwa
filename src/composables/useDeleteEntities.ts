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

export const useDeleteEntities = () => {
  const config: any = inject("config");
  const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

  const deleteEntities = async (
    items: InBulkProcessableItem[] | { id: string; type: string }[],
    deleteMediafiles: boolean = false,
  ) => {
    if (items.length === 0) return;

    const childRoutes = getChildrenOfHomeRoutes(config).map(
      (route: any) => route.meta,
    );

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
          deleteMediafiles,
        });
      },
    );

    await Promise.all(deletePromises);
    return true;
  };

  return {
    deleteEntities,
  };
};
