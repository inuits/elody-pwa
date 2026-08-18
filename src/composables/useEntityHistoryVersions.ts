import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import {
  GetEntityHistoryVersionsDocument,
  type GetEntityHistoryVersionsQuery,
  type GetEntityHistoryVersionsQueryVariables,
} from "@/generated-types/queries";

export function useEntityHistoryVersions(
  entityId: string,
  entityType: string,
  options: { limit?: number; skip?: number } = {},
) {
  const { result, loading, error } = useQuery<
    GetEntityHistoryVersionsQuery,
    GetEntityHistoryVersionsQueryVariables
  >(GetEntityHistoryVersionsDocument, {
    id: entityId,
    type: entityType,
    limit: options.limit,
    skip: options.skip,
  });

  const versions = computed(
    () => result.value?.EntityHistoryVersions ?? [],
  );

  return { versions, loading, error };
}
