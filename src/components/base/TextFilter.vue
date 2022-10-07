<template>
  <div>
    <InputField
      v-model:modelValue="inputField"
      :debounce="true"
      :placeholder="placeholderText"
      :bg-color="'neutral-20'"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import type { PropType } from "vue";
import InputField from "@/components/base/InputField.vue";
import { defaultReturnTextObject } from "../../composables/useFilterHelper";
import type { FilterInList } from "../../composables/useFilterHelper";
export default defineComponent({
  name: "TextFilter",
  components: {
    InputField,
  },
  props: {
    inputValue: {
      type: Object as PropType<FilterInList>,
      required: false,
      default: undefined,
    },
    filterkey: {
      type: String,
      required: true,
    },
    placeholderText: {
      type: String,
      required: false,
      default: "",
    },
  },
  emits: ["update:inputValue"],
  setup(props, { emit }) {
    emit("update:inputValue", defaultReturnTextObject(props.filterkey));

    const inputField = computed<string | undefined | null>({
      get() {
        return props.inputValue && props.inputValue.input.textInput
          ? props.inputValue.input.textInput.value
          : undefined;
      },
      set(value) {
        emit(
          "update:inputValue",
          defaultReturnTextObject(props.filterkey, value)
        );
      },
    });

    return { inputField };
  },
});
</script>
