<template>
  <div data-cy="base-input-checkbox" class="flex items-center">
    <div
      class="flex-none flex items-center justify-center w-10 h-10 rounded-lg box-border"
      :class="[
        inputValue ? `${divSelectedBgColor}` : '',
        { 'cursor-pointer': !disabled },
      ]"
      @click.prevent="handleItemSelection"
    >
      <input
        class="border-2 focus:ring-0"
        :class="[
          { 'cursor-pointer': !disabled },
          { rounded: !inputValue },
          { [selectedInputStyle.disabledStyle.textColor]: disabled },
          { [selectedInputStyle.disabledStyle.bgColor]: disabled },
          { [selectedInputStyle.disabledStyle.borderColor]: disabled },
          `${selectedInputStyle.textColor} ${selectedInputStyle.bgColor} ${selectedInputStyle.borderColor} `,
        ]"
        v-model="inputValue"
        type="checkbox"
        :checked="required"
        :disabled="disabled || isDisabledByContextLimit || required"
        @change.stop
        @click.stop="handleItemSelection"
      />
    </div>
    <span
      v-if="label"
      class="flex flex-row select-none cursor-pointer"
      :class="{ 'ml-2': inputValue }"
      @change.stop
      @click.stop="handleItemSelection"
    >
      {{ label }}
      <div class="pl-2" :title="t(`tooltip.required`)">
        <unicon
          v-if="required"
          :name="Unicons.ExclamationTriangle.name"
          height="20"
        />
      </div>
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
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { Unicons } from "@/types";

const { t } = useI18n();
const { getModalInfo } = useBaseModal();

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    item: InBulkProcessableItem;
    bulkOperationsContext: Context;
    inputStyle: InputStyle;
    disabled?: boolean;
    ignoreBulkOperations?: boolean;
    required?: boolean;
  }>(),
  {
    modelValue: false,
    label: "",
    disabled: false,
    ignoreBulkOperations: false,
    required: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: boolean): void;
}>();

const inputValue = computed<boolean>({
  get() {
    return props.required ? props.required : props.modelValue;
  },
  set(value) {
    emit("update:modelValue", props.required ? props.required : value);
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
  bgColor: "accent-accent-normal",
  borderColor: "border-text-light checked:border-neutral-white",
  disabledStyle: {
    textColor: "disabled:text-text-light",
    bgColor: "disabled:accent-neutral-white",
    borderColor: "disabled:border-accent-highlight",
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
  isBulkSelectionLimitReached,
} = useBulkOperations();
const route = useRoute();

const handleItemSelection = () => {
  if (
    props.disabled ||
    getEnqueuedItemCount(props.bulkOperationsContext) >= bulkSelectAllSizeLimit
  )
    return;
  if (!inputValue.value && !props.ignoreBulkOperations)
    enqueueItemForBulkProcessing(props.bulkOperationsContext, {
      ...props.item,
      required: props.required,
    });
  else if (!props.required && !props.ignoreBulkOperations)
    dequeueItemForBulkProcessing(props.bulkOperationsContext, props.item.id);

  inputValue.value = !inputValue.value;
};

const selectedInputStyle = computed<Input>(() => inputStyles[props.inputStyle]);
const divSelectedBgColor = computed<string>(() =>
  selectedInputStyle.value.textColor.replace(/^text/, "bg"),
);
const isDisabledByContextLimit = computed<boolean>(() => {
  if (props.ignoreBulkOperations) return false;
  return (
    !isEnqueued(props.bulkOperationsContext, props.item.id) &&
    isBulkSelectionLimitReached(props.bulkOperationsContext)
  );
});

onMounted(() => {
  if (props.required)
    enqueueItemForBulkProcessing(props.bulkOperationsContext, {
      ...props.item,
      required: props.required,
    });
  if (props.ignoreBulkOperations) {
    inputValue.value = props.modelValue;
    return;
  }

  inputValue.value = isEnqueued(props.bulkOperationsContext, props.item.id);
});

watch(contextWhereSelectionEventIsTriggered, () => {
  if (props.ignoreBulkOperations) return;
  inputValue.value = isEnqueued(props.bulkOperationsContext, props.item.id);
});
watch(route, () => {
  if (props.ignoreBulkOperations) return;
  inputValue.value = isEnqueued(route.name as Context, props.item.id);
});
watch(
  () => getModalInfo(TypeModals.BulkOperations).open,
  (isBulkOperationsModalOpen: boolean | undefined) => {
    if (isBulkOperationsModalOpen)
      inputValue.value = isEnqueued(props.bulkOperationsContext, props.item.id);
  },
);
</script>
