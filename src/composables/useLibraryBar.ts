
import {
    type DropdownOption,
} from "@/generated-types/queries";
import { ref } from "vue";


const selectedPaginationLimitOption = ref<DropdownOption>();

export const useLibraryBar = () => {

    const setSelectedPaginationLimitOption = (limit: Number) => {
        selectedPaginationLimitOption.value = limit;
    }
    return {
        setSelectedPaginationLimitOption,
        selectedPaginationLimitOption
    };

}