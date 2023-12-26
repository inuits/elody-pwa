
import {
    type DropdownOption,
} from "@/generated-types/queries";
import { ref } from "vue";


const selectedPaginationLimitOption = ref<DropdownOption>();
const selectedSkip = ref<DropdownOption>();

export const useLibraryBar = () => {

    const setSelectedPaginationLimitOption = (limit: Number) => {
        selectedPaginationLimitOption.value = limit;
    }
    const setSelectedSkip = (skip: Number) => {
        selectedSkip.value = skip;
    }

    return {
        setSelectedPaginationLimitOption,
        selectedPaginationLimitOption,
        setSelectedSkip,
        selectedSkip,
    };

}