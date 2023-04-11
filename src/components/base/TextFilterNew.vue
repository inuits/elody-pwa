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

<script lang="ts" setup>
import { computed, defineProps, defineEmits } from "vue";
import type {
  AdvancedFilter,
  FilterInList,
} from "../../composables/useFilterHelper";
import { defaultReturnTextObject } from "../../composables/useFilterHelper";
import InputField from "@/components/base/InputField.vue";

const props = defineProps<{
  inputValue: {
    type: FilterInList;
    required: false;
    default: undefined;
  };
  filter: {
    type: AdvancedFilter;
  };
  placeholderText: {
    type: String;
    required: false;
    default: "";
  };
}>();
const emit = defineEmits<{
  (event: "update:value", defaultTextObject: FilterInList): void;
}>();

const inputField = computed<string | undefined | null>({
  get() {
    return props.inputValue && props.inputValue?.input.textInput
      ? props.inputValue?.input.textInput.value
      : undefined;
  },
  set(value) {
    emit("update:value", defaultReturnTextObject(props.filter?.key, value));
  },
});
</script>
<style></style>
