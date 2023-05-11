<template>
  <div>
    <InputField
      v-model="inputField"
      :debounce="true"
      :bg-color="'neutral-20'"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, defineEmits } from "vue";
import type {
  AdvancedFilter,
  FilterInList,
} from "@/composables/useFilterHelper";
import { defaultReturnTextObject } from "@/composables/useFilterHelper";
import InputField from "@/components/base/InputField.vue";

const props = defineProps<{
  value?: FilterInList;
  filter: AdvancedFilter;
}>();
const emit = defineEmits<{
  (event: "update:value", defaultTextObject: FilterInList): void;
}>();

const inputField = computed<string | undefined | null>({
  get() {
    return props.value && props.value?.input.textInput
      ? props.value?.input.textInput.value
      : undefined;
  },
  set(value) {
    emit("update:value", defaultReturnTextObject(props.filter?.key, value));
  },
});
</script>
<style></style>
