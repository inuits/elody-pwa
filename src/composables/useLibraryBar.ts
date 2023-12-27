
import {
    type DropdownOption,
    type GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import { ref } from "vue";


const selectedPaginationLimitOption = ref<DropdownOption>();
const selectedSkip = ref<DropdownOption>();
const selectedSortOption = ref<DropdownOption>();
const queryVariables = ref<GetEntitiesQueryVariables>();

export const useLibraryBar = () => {

    const setSelectedPaginationLimitOption = (limit: Number) => {
        selectedPaginationLimitOption.value = limit;
    }
    const setSelectedSkip = (skip: Number) => {
        selectedSkip.value = skip;
    }
    const setSelectedSortOption = (sort: Number) => {
        selectedSortOption.value = sort;
    }
    const setQueryVariables = (variables: Number) => {
        queryVariables.value = variables;
    }

    return {
        setSelectedPaginationLimitOption,
        selectedPaginationLimitOption,
        setSelectedSkip,
        selectedSkip,
        setSelectedSortOption,
        selectedSortOption,
        setQueryVariables,
        queryVariables
    };

}