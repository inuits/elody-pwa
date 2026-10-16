<template>
  <!-- Design-system checkbox: commit-teal check, visible keyboard focus, a
       real label. The hit area meets the touch-target minimum but is no longer
       painted when selected. -->
  <div data-cy="base-input-checkbox" class="flex items-center">
    <div
      data-cy="checkbox-hit-area"
      class="flex-none flex items-center justify-center box-border"
      :class="[
        size === 'compact'
          ? 'w-(--checkbox-hit-area-compact) h-(--checkbox-hit-area-compact)'
          : 'w-(--checkbox-hit-area) h-(--checkbox-hit-area)',
        { 'cursor-pointer': !disabled },
      ]"
      @click.prevent.stop="handleItemSelection"
    >
      <input
        :id="checkboxId"
        :class="[
          CHECKBOX_BOX_CLASSES,
          {
            'cursor-pointer': !disabled,
            'disabled:text-text-light disabled:accent-neutral-white disabled:border-border-subtle':
              disabled,
          },
        ]"
        v-model="inputValue"
        type="checkbox"
        :checked="required"
        :disabled="disabled || isDisabledByContextLimit || required"
        :aria-label="!label ? ariaLabel : undefined"
        @change.stop
        @click.stop="handleItemSelection"
      />
    </div>
    <label
      v-if="label"
      :for="checkboxId"
      class="flex flex-row select-none cursor-pointer"
      :class="size === 'compact' ? 'ml-1.5' : { 'ml-2': inputValue }"
      @click.prevent.stop="handleItemSelection"
    >
      {{ label }}
      <span v-if="required" class="pl-2" :title="t(`tooltip.required`)">
        <unicon :name="Unicons.ExclamationTriangle.name" height="20" />
      </span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import {
  useBulkOperations,
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { bulkSelectAllSizeLimit } from "@/main";
import { computed, onMounted, useId, watch } from "vue";
import { CHECKBOX_BOX_CLASSES } from "@/components/base/checkboxStyles";
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
    bulkOperationsContext: Context | undefined;
    disabled?: boolean;
    ignoreBulkOperations?: boolean;
    required?: boolean;
    ariaLabel?: string;
    // compact: dense option lists (filters); default keeps the 40px touch target
    size?: "default" | "compact";
  }>(),
  {
    modelValue: false,
    label: "",
    disabled: false,
    ignoreBulkOperations: false,
    required: false,
    ariaLabel: undefined,
    size: "default",
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

const checkboxId = `base-checkbox-${useId()}`;
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
    if (props.ignoreBulkOperations) return;
    if (isBulkOperationsModalOpen)
      inputValue.value = isEnqueued(props.bulkOperationsContext, props.item.id);
  },
);
</script>
