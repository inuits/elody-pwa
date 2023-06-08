<template>
  <div class="flex items-center">
    <div
      class="flex-none flex items-center justify-center w-10 h-10 rounded-lg"
      :class="[
        inputValue ? `${divSelectedBgColor}` : '',
        { 'cursor-pointer': !disabled },
      ]"
      @change.stop
      @click.stop="handleItemSelection"
    >
      <input
        class="border-2 focus:ring-0"
        :class="[
          { 'cursor-pointer': !disabled },
          { rounded: !inputValue },
          `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor}`,
          `${selectedInputStyle.disabledStyle.textColor} ${selectedInputStyle.disabledStyle.bgColor} ${selectedInputStyle.disabledStyle.borderColor}`,
        ]"
        v-model="inputValue"
        type="checkbox"
        :disabled="disabled"
      />
    </div>
    <span
      v-if="label"
      class="select-none cursor-pointer"
      :class="{ 'ml-2': inputValue }"
      @change.stop
      @click.stop="handleItemSelection"
    >
      {{ label }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import {
  useBulkOperations,
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { bulkSelectAllSizeLimit } from "@/main";
import { computed, onMounted, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    item: InBulkProcessableItem;
    bulkOperationsContext: Context;
    inputStyle: InputStyle;
    disabled?: boolean;
  }>(),
  {
    label: "",
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: boolean): void;
}>();

const inputValue = computed<boolean>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

type PseudoStyle = {
  textColor: string;
  bgColor: string;
  borderColor: string;
};
type Input = {
  textColor: string;
  bgColor: string;
  borderColor: string;
  disabledStyle: PseudoStyle;
};
const accentNormalInput: Input = {
  textColor: "text-accent-normal",
  bgColor: "bg-neutral-white",
  borderColor: "border-text-light checked:border-neutral-white",
  disabledStyle: {
    textColor: "disabled:text-text-light",
    bgColor: "disabled:bg-neutral-white",
    borderColor: "disabled:border-neutral-light",
  },
};

type InputStyle = "accentNormal";
const inputStyles: Record<InputStyle, Input> = {
  accentNormal: accentNormalInput,
};

const {
  contextWhereSelectionEventIsTriggered,
  enqueueItemForBulkProcessing,
  dequeueItemForBulkProcessing,
  isEnqueued,
  getEnqueuedItemCount,
} = useBulkOperations();

const handleItemSelection = () => {
  if (
    props.disabled ||
    getEnqueuedItemCount(props.bulkOperationsContext) >= bulkSelectAllSizeLimit
  )
    return;

  if (!inputValue.value)
    enqueueItemForBulkProcessing(props.bulkOperationsContext, props.item);
  else dequeueItemForBulkProcessing(props.bulkOperationsContext, props.item.id);

  inputValue.value = !inputValue.value;
};

const selectedInputStyle = computed<Input>(() => inputStyles[props.inputStyle]);
const divSelectedBgColor = computed<string>(() =>
  selectedInputStyle.value.textColor.replace(/^text/, "bg")
);

onMounted(
  () =>
    (inputValue.value = isEnqueued(props.bulkOperationsContext, props.item.id))
);

watch(
  contextWhereSelectionEventIsTriggered,
  () =>
    (inputValue.value = isEnqueued(props.bulkOperationsContext, props.item.id))
);
</script>
