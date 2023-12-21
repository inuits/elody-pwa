

import { useLibraryBar } from "@/composables/useLibraryBar";
import { ref } from "vue";

const { selectedPaginationLimitOption } = useLibraryBar();

const entityType = ref<String>();
const relationType = ref<String>();
const identifiers = ref<String>();
const searchInputType = ref<String>();

export const useQueryVariablesFactory = () => {
    const setEntityType = (value: String) => {
        entityType.value = value;
    }
    const setQueryRelationType = (value: String) => {
        relationType.value = value;
    }
    const setIdentifiers = (value: String) => {
        identifiers.value = value;
    }
    const setSearchInputType = (value: String) => {
        searchInputType.value = value;
    }

    const createQueryVariables = () => {
        return {
            limit: selectedPaginationLimitOption.value?.value,
            skip: 1,
            searchValue: {
                value: "",
                isAsc: false,
                key: "",
                order_by: "",
            },
            advancedSearchValue: [],
            advancedFilterInputs: [
                {
                    type: "type",
                    value: entityType.value,
                    match_exact: true
                },
                {
                    type: "selection",
                    parent_key: "relations",
                    key: relationType.value,
                    value: [
                        identifiers.value
                    ],
                    match_exact: true
                }
            ],
            searchInputType: searchInputType.value,
            userUuid: identifiers.value
        }
    };

    return {
        createQueryVariables,
        setIdentifiers,
        setQueryRelationType,
        setSearchInputType,
        setEntityType
    };
}