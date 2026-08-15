<template>
  <label data-cy="base-input-checkbox" class="ds-checkbox">
    <input
      class="ds-checkbox__box"
      v-model="inputValue"
      type="checkbox"
      :checked="required"
      :disabled="disabled || isDisabledByContextLimit || required"
      :aria-label="label ? undefined : ariaLabel"
      @change.stop
      @click.stop="handleItemSelection"
    />
    <span v-if="label" class="ds-checkbox__label">
      {{ label }}
      <unicon
        v-if="required"
        :name="Unicons.ExclamationTriangle.name"
        height="16"
        :title="t('tooltip.required')"
      />
    </span>
  </label>
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
    bulkOperationsContext: Context | undefined;
    /** Required when there is no visible label — a box with no name is unusable. */
    ariaLabel?: string;
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

<style scoped>
.ds-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-5);
  cursor: pointer;
  user-select: none;
}

.ds-checkbox:has(.ds-checkbox__box:disabled) {
  cursor: auto;
}

.ds-checkbox__box {
  appearance: none;
  flex: none;
  width: 15px;
  height: 15px;
  margin: 0;
  border: 1.5px solid var(--color-border-dashed);
  border-radius: var(--radius-chip);
  background-color: var(--color-surface);
  cursor: inherit;
  transition:
    background-color var(--transition-duration-ui) var(--ease-ui),
    border-color var(--transition-duration-ui) var(--ease-ui);
}

.ds-checkbox__box:checked,
.ds-checkbox__box:indeterminate {
  background-color: var(--color-commit);
  border-color: var(--color-commit);
  /* Tick and dash are drawn rather than iconed: at 15px an icon font renders
     off-centre by a pixel and the box is the densest control in the app. */
  background-repeat: no-repeat;
  background-position: center;
}

.ds-checkbox__box:checked {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2.5 6.2 4.8 8.5 9.5 3.8'/%3E%3C/svg%3E");
}

.ds-checkbox__box:indeterminate {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' d='M3 6h6'/%3E%3C/svg%3E");
}

.ds-checkbox__box:not(:disabled):hover {
  border-color: var(--color-commit);
}

.ds-checkbox__box:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.ds-checkbox__box:disabled {
  background-color: var(--color-surface-muted);
  border-color: var(--color-border-default);
}

.ds-checkbox__box:disabled:checked {
  background-color: var(--color-text-disabled);
  border-color: var(--color-text-disabled);
}

.ds-checkbox__label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-4);
  font-size: var(--text-value);
  color: var(--color-text-body);
}
</style>
