<template>
  <!-- Inline editor (docs/design-system/components/inline-editor.md): the
       input a field row swaps to. Pick-then-Bewaar: nothing saves until
       Bewaar, Enter (Ctrl+Enter in a textarea) or a confirmed save. -->
  <div
    ref="rootRef"
    data-cy="inline-field-editor"
    class="flex flex-col gap-1 w-full"
    @keydown="handleKeydown"
  >
    <div data-cy="inline-editor-row" class="flex items-center gap-1.5 w-full">
      <div class="grow min-w-0">
        <AdvancedDropdown
          v-if="isDropdown"
          v-model="draft"
          :options="options"
          :clearable="!required"
          :multiple="isMultiple"
          :disable="saving"
          style-type="defaultWithBorder"
        />
        <BaseInputCheckbox
          v-else-if="type === InputFieldTypes.Checkbox"
          v-model="draft"
          :item="{ id: label }"
          :bulk-operations-context="undefined"
          :aria-label="label"
          :disabled="saving"
          ignore-bulk-operations
        />
        <BaseInputTextNumberDatetime
          v-else
          v-model="draft"
          :type="inputType"
          input-style="defaultWithBorder"
          :aria-label="label"
          :invalid="!!errorMessage"
          :described-by="errorMessage ? errorId : undefined"
          :disabled="saving"
        />
      </div>
      <div class="flex shrink-0 gap-1.5">
        <BaseButtonNew
          :label="saveLabel"
          button-style="commit"
          button-size="sm"
          :disabled="!isDirty || saving"
          :loading="saving"
          @click="commit"
        />
        <BaseButtonNew
          :label="cancelLabel"
          button-style="ghost"
          button-size="sm"
          :disabled="saving"
          @click="emit('cancel')"
        />
      </div>
    </div>
    <p
      v-if="errorMessage"
      :id="errorId"
      role="alert"
      class="text-hint text-danger"
    >
      {{ errorMessage }}
    </p>
    <p data-cy="inline-editor-hint" class="text-hint text-text-muted">
      {{ hint }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import {
  InputFieldTypes,
  type DropdownOption,
} from "@/generated-types/queries";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const props = withDefaults(
  defineProps<{
    type: string;
    modelValue: unknown;
    label: string;
    options?: DropdownOption[];
    required?: boolean;
    saving?: boolean;
    errorMessage?: string;
  }>(),
  {
    options: () => [],
    required: false,
    saving: false,
    errorMessage: undefined,
  },
);

const emit = defineEmits<{
  (event: "save", value: unknown): void;
  (event: "cancel"): void;
  (event: "dirty-change", dirty: boolean): void;
  (event: "draft-change", value: unknown): void;
}>();

const { t, te } = useI18n();
const translated = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;

const DROPDOWN_TYPES: string[] = [
  InputFieldTypes.Dropdown,
  InputFieldTypes.DropdownSingleselectMetadata,
  InputFieldTypes.DropdownMultiselectMetadata,
];
const MULTIPLE_TYPES: string[] = [InputFieldTypes.DropdownMultiselectMetadata];
const TEXTAREA_TYPES: string[] = [
  InputFieldTypes.Textarea,
  InputFieldTypes.ResizableTextarea,
];

const isDropdown = computed(() => DROPDOWN_TYPES.includes(props.type));
const isMultiple = computed(() => MULTIPLE_TYPES.includes(props.type));
const isTextarea = computed(() => TEXTAREA_TYPES.includes(props.type));
const inputType = computed(() =>
  isTextarea.value ? InputFieldTypes.Textarea : props.type,
);

const initial = JSON.stringify(props.modelValue ?? null);
const draft = ref<any>(props.modelValue);
const isDirty = computed(() => JSON.stringify(draft.value ?? null) !== initial);
watch(isDirty, (dirty) => emit("dirty-change", dirty));
watch(draft, (value) => emit("draft-change", value), { deep: true });

const saveLabel = computed(() => translated("inline-edit.save", "Save"));
const cancelLabel = computed(() => translated("inline-edit.cancel", "Cancel"));
const hint = computed(() =>
  isTextarea.value
    ? translated("inline-edit.hint-textarea", "Ctrl+Enter saves · Esc cancels")
    : translated("inline-edit.hint", "Enter saves · Esc cancels"),
);
const errorId = `inline-editor-error-${useId()}`;

const commit = () => {
  if (props.saving) return;
  if (!isDirty.value) {
    emit("cancel");
    return;
  }
  emit("save", draft.value);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    emit("cancel");
    return;
  }
  if (event.key !== "Enter") return;
  if (isTextarea.value && !(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  commit();
};

// Click outside: an unchanged editor closes, a changed one stays open (no
// silent discard). Clicks in teleported menus belong to the editor.
const rootRef = ref<HTMLElement | null>(null);
const OVERLAY_SELECTOR =
  ".menu, .multiselect-dropdown, [role='listbox'], .dp__menu, [role='tooltip']";
const handleOutsideMousedown = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target || rootRef.value?.contains(target)) return;
  if (target.closest?.(OVERLAY_SELECTOR)) return;
  if (!isDirty.value) emit("cancel");
};

onMounted(async () => {
  document.addEventListener("mousedown", handleOutsideMousedown, true);
  await nextTick();
  rootRef.value
    ?.querySelector<HTMLElement>("input, textarea, [role='combobox']")
    ?.focus();
});
onBeforeUnmount(() =>
  document.removeEventListener("mousedown", handleOutsideMousedown, true),
);
</script>
