import { reactive } from 'vue';

interface State {
    dynamicForm: any;
}

const state: State = reactive({
    dynamicForm: undefined,
});

const setDynamicForm = (dynamicForm: any): void => {
    state.dynamicForm = dynamicForm;
};

export { state, setDynamicForm };
