import  {
    EditStatus,
} from "@/generated-types/queries";
import { ref } from "vue";
import {useLibraryBar} from "@/composables/useLibraryBar";
import EventBus from "@/EventBus";


const { selectedSkip, selectedPaginationLimitOption} = useLibraryBar();

type OrderItem = {
    field: String,
    initialValue: number,
    currentValue: number,
    status?: EditStatus
};
const orderItemsPerForm = ref<{ [key: string]: OrderItem[] }>([]);

const useOrderListItems = () => {

    const formExists = (formId: number) => {
        return orderItemsPerForm.value[formId] !== undefined;
    }
    const createFormIfNotExists = (formId: number) => {
        if (!formExists(formId)) orderItemsPerForm.value[formId] = [];
    }
    const getOrderItemInList = (formId: number, field: String): OrderItem => {
        return orderItemsPerForm.value[formId].filter((item) => item.field === field)[0]
    }
    const sortList = (formId: number) => {
        orderItemsPerForm.value[formId].sort((value, nextValue) => value.currentValue > nextValue.currentValue);
    }
    const setStatus = (item) => {
        return item.initialValue == item.currentValue ? EditStatus.Unchanged : EditStatus.Changed;
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

    const updateOrderItem = (formId: number, field: string, newValue: string) => {
        if (!formExists(formId)) return;
        const item = getOrderItemInList(formId, field);
        if (!item || !newValue || parseInt(newValue) <= 0 || newValue > orderItemsPerForm.value[formId].length) return;
        const oldValue = item.currentValue;
        item.currentValue = parseInt(newValue);
        item.status = setStatus(item);
        if (oldValue !== item.currentValue) changeOrderOfList(formId, oldValue, item.currentValue);
    }

    const changeOrderOfList = (formId: number, oldValue: number, newValue: number) => {
        const form = orderItemsPerForm.value[formId];
        if (newValue < oldValue) {
            for (let index = oldValue-2; index >= newValue-1; index--) {
                form[index].currentValue += 1;
                form[index].status = setStatus(form[index]);
            }
        } else {
            for (let index = oldValue; index < newValue; index++) {
                form[index].currentValue -= 1;
                form[index].status = setStatus(form[index]);
            }
        }
        sortList(formId);
        EventBus.emit("orderList_changed", form);
    }


    return {
        getFormOrderItems,
        addOrderItem,
        updateOrderItem,
    };
};
export { useOrderListItems, OrderItem };
