import {
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  SearchInputType,
} from "@/generated-types/queries";
import { computed, ref } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { apolloClient } from "@/main";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";

export const useGetDropdownOptions = (
  entityType: Entitytyping,
  parent: "fetchAll" | string
) => {
  const options = ref<DropdownOption[]>([]);
  const {
    entities,
    getEntities,
    setAdvancedFilters,
    setEntityType,
    setIsSearchLibrary,
    setsearchInputType,
  } = useBaseLibrary(apolloClient as ApolloClient<any>);

  const initialize = async () => {
    setIsSearchLibrary(false);
    setAdvancedFilters([
      {
        type: "type",
        value: entityType,
        match_exact: true,
      },
    ]);
    setsearchInputType(SearchInputType.AdvancedInputType);
    setEntityType(entityType);

    await getEntities(undefined);
  };

  const entityDropdownOptions = computed<DropdownOption[]>(() => {
    return entities.value.map((entity: BaseEntity) => {
      return {
        icon: DamsIcons.NoIcon,
        label: getEntityTitle(entity),
        value: entity.id,
      };
    });
  });

  return {
    initialize,
    options,
  };
};
