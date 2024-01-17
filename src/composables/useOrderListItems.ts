import  {
    EditStatus,
} from "@/generated-types/queries";
import { ref, computed, watch } from "vue";
import useEditMode from "@/composables/useEdit";
import { useLibraryBar } from "@/composables/useLibraryBar";
import {useQueryVariablesFactory} from "@/composables/useQueryVariablesFactory";

import EventBus from "@/EventBus";
const { setChangePaginationNumber } = useQueryVariablesFactory();

const {
    selectedPaginationLimitOption,
    totalItemsCount,
    isAsc,
    setSelectedSkip, selectedSkip
} = useLibraryBar();
const { setEditMode, save, disableEditMode } = useEditMode();


type OrderItem = {
    field: String,
    initialValue: number,
    currentValue: number,
    status?: EditStatus
};
type SavedStateItem = {
    formId: number,
    oldValue: number,
    newValue: number
};

const orderItemsPerForm = ref<{ [key: string]: OrderItem[] }>([]);
const changedItem = ref<OrderItem>(null);
const savedState = ref<SavedStateItem>(null);
//TODO: when skip is fixed use skip from useLibraryBar
const savedSkipForOrdering = ref<number>(selectedSkip.value);
const pagination = computed(() => selectedPaginationLimitOption.value?.value ? selectedPaginationLimitOption.value?.value : 20);

const useOrderListItems = () => {

    const formExists = (formId: number) => {
        return orderItemsPerForm.value[formId] !== undefined;
    }
    const createFormIfNotExists = (formId: number) => {
        if (!formExists(formId)) orderItemsPerForm.value[formId] = [];
    }
    const isFormEmpty = (formId: number) => {
        return orderItemsPerForm.value[formId].length <= 0;
    }
    const getOrderItemInList = (formId: number, field: String): OrderItem => {
        return orderItemsPerForm.value[formId].filter((item) => item.field === field)[0]
    }
    const sortList = (formId: number) => {
        orderItemsPerForm.value[formId].sort((value, nextValue) => value.currentValue > nextValue.currentValue);
    }
    const setStatus = (item) => {
        return item.status = item.initialValue == item.currentValue ? EditStatus.Unchanged : EditStatus.Changed;
    }
    const saveForm = async (formId: number) => {
        await save();
        orderItemsPerForm.value[formId] = []
    }

    const getFormOrderItems = (formId: number) => {
        return orderItemsPerForm.value[formId];
    }

    const addOrderItem = (formId: number, orderItem: OrderItem) => {
        createFormIfNotExists(formId);
        if (getOrderItemInList(formId, orderItem.field)) return;
        orderItem.status = EditStatus.Unchanged;
        orderItemsPerForm.value[formId].push(orderItem);
        sortList(formId);
    }

    const removeOrderItem = (formId: number, field: string) => {
        if (!formExists(formId) || isFormEmpty(formId)) return;
        orderItemsPerForm.value[formId] = orderItemsPerForm.value[formId].filter((item) => item.field !== field);
    }

    const updateOrderItem = async (formId: number, field: string, newValue: string) => {
        if (!formExists(formId)) return;
        const item = getOrderItemInList(formId, field);
        if (!item || !newValue || parseInt(newValue) <= 0 || parseInt(newValue) > totalItemsCount.value) return;
        const oldValue = item.currentValue;
        item.currentValue = parseInt(newValue);
        setStatus(item);
        if (oldValue !== item.currentValue) {
            changedItem.value = item;
            savedSkipForOrdering.value = selectedSkip.value;
            await changeOrderOfList(formId, field, oldValue, item.currentValue);
        }
    }

    const saveChanges = async (form: any, formId: number) => {
        sortList(formId);
        EventBus.emit("orderList_changed", form);
        await saveForm(formId);
        setEditMode();
    }
    const changeOrder = (form: any, indexToSave: number, countUp: boolean) => {
        if (form.length-1 < indexToSave) return;
        if (form[indexToSave].field === changedItem.value.field)
            indexToSave += countUp ? 1 : -1;
        form[indexToSave].currentValue += countUp ? -1 : 1;
        setStatus(form[indexToSave]);
        indexToSave += countUp ? 1 : -1;
        return indexToSave;
    }

    const traverseListDownwards = async (form: any, formId: number, oldValue, newValue, indexToSave, isMultipage) => {
        for (oldValue ; oldValue > newValue ; oldValue--) {
            if (isMultipage && orderItemsPerForm.value[formId][0]?.status === EditStatus.Changed) {
                setChangePaginationNumber(isAsc.value ? 1 : -1);
                await saveChanges(form, formId);
                savedSkipForOrdering.value += isAsc.value ? -1 : 1;
                setSelectedSkip(savedSkipForOrdering.value);
                savedState.value = {
                    formId,
                    oldValue,
                    newValue,
                };
                break;
            }
            indexToSave = changeOrder(form, indexToSave, false);
        }
    }
    const traverseListUpwards = async (form: any, formId: number, oldValue, newValue, indexToSave, isMultipage) => {
        for (oldValue ; oldValue < newValue ; oldValue++) {
            const checkIndex = orderItemsPerForm.value[formId].length - 1;
            if (isMultipage && orderItemsPerForm.value[formId][checkIndex]?.status === EditStatus.Changed) {
                setChangePaginationNumber(isAsc.value ? -1 : 1);
                await saveChanges(form, formId);
                savedSkipForOrdering.value += isAsc.value ? 1 : -1;
                setSelectedSkip(savedSkipForOrdering.value);
                savedState.value = {
                    formId,
                    oldValue,
                    newValue,
                };
                break;
            }
            indexToSave = changeOrder(form, indexToSave, true);
        }
    }

    const changeOrderOfList = async (formId: number, field: string, oldValue: number, newValue: number) => {
        let form = orderItemsPerForm.value[formId];
        let indexToSave = orderItemsPerForm.value[formId].map((item) => item.field).indexOf(field);
        if (newValue < oldValue) {
            const isMultipage = oldValue - newValue > pagination.value || isAsc.value ? oldValue - newValue > indexToSave : oldValue - newValue > pagination.value - (indexToSave+1);
            await traverseListDownwards(form, formId, oldValue, newValue, indexToSave, isMultipage);
        } else {
            const multiPageIndexCompare = orderItemsPerForm.value[formId].length - (indexToSave+1);
            const isMultipage = newValue - oldValue > pagination.value || isAsc.value ? newValue - oldValue > pagination.value - (indexToSave+1) : newValue - oldValue > multiPageIndexCompare;
            await traverseListUpwards(form, formId, oldValue, newValue, indexToSave, isMultipage);
        }
        sortList(formId);
        EventBus.emit("orderList_changed", form);
    }


    watch(
        () => orderItemsPerForm.value[savedState.value?.formId]?.length,
        async () => {
            if (!savedState.value) return;
            if (orderItemsPerForm.value[savedState.value.formId].length < 1) return;

            const formId = savedState.value?.formId;
            let oldValue = savedState.value?.oldValue;
            const newValue = savedState.value?.newValue;
            const form = orderItemsPerForm.value[formId];
            disableEditMode();

            if (newValue < oldValue) {
                if (orderItemsPerForm.value[formId][0].initialValue > oldValue ) return;
                savedState.value = null;
                setEditMode();
                let indexToSave = form.length-1;
                const isMultipage = oldValue - newValue > pagination.value || isAsc.value ? oldValue - newValue > indexToSave : oldValue - newValue > pagination.value - (indexToSave+1);
                if (!isMultipage) indexToSave -= savedSkipForOrdering.value - 2;
                await traverseListDownwards(form, formId, oldValue, newValue, indexToSave, isMultipage);

            } else {
                if (orderItemsPerForm.value[formId][form.length-1].initialValue < oldValue ) return;
                savedState.value = null;
                setEditMode();
                let indexToSave = 0;
                const multiPageIndexCompare = orderItemsPerForm.value[formId].length - (indexToSave+1);
                const isMultipage = newValue - oldValue > pagination.value || isAsc.value ? newValue - oldValue > pagination.value - (indexToSave+1) : newValue - oldValue > multiPageIndexCompare;
                if (!isMultipage) indexToSave += savedSkipForOrdering.value - 2;
                await traverseListUpwards(form, formId, oldValue, newValue, indexToSave, isMultipage);
            }
            sortList(formId);
            EventBus.emit("orderList_changed", form);
            setChangePaginationNumber(undefined);
        }
    );

    return {
        getFormOrderItems,
        addOrderItem,
        removeOrderItem,
        updateOrderItem,
    };
};
export { useOrderListItems, OrderItem, savedSkipForOrdering };
