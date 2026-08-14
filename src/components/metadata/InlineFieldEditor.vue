<template>
  <div class="min-w-0">
    <template v-if="!editing">
      <div class="flex items-center gap-1">
        <button
          type="button"
          data-cy="inline-edit-toggle"
          class="flex min-h-[26px] w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded px-1 text-left hover:bg-accent-light hover:shadow-[inset_0_0_0_1px_var(--color-accent-accent)] focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="{ 'opacity-45 hover:opacity-100': dim }"
          :aria-label="`${editFieldLabel} ${label}`"
          @click.stop.prevent="startEditing"
        >
          <span
            class="min-w-0 truncate border-b border-dashed border-neutral-60"
          >
            <slot>{{ value }}</slot>
          </span>
          <span class="flex shrink-0 items-center gap-1">
            <span
              v-if="savedFlash"
              data-cy="inline-edit-saved"
              class="flex items-center text-green-600"
            >
              <unicon :name="Unicons.Check.name" height="14" />
            </span>
            <unicon
              :name="Unicons.Edit.name"
              height="12"
              class="text-neutral-80"
            />
          </span>
        </button>
        <button
          v-if="undoValue !== undefined"
          type="button"
          data-cy="inline-edit-undo"
          role="status"
          class="shrink-0 cursor-pointer text-xs font-bold text-accent-accent underline decoration-dotted hover:text-text-body focus-visible:outline-2 focus-visible:outline-accent-accent"
          :disabled="saving"
          @click.stop.prevent="undo"
        >
          {{ undoLabel }}
        </button>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center gap-1 pt-0.5">
        <select
          v-if="isSelect"
          ref="inputRef"
          v-model="draft"
          data-cy="inline-edit-select"
          :aria-label="label"
          :disabled="saving"
          class="w-full min-w-0 rounded border border-neutral-40 bg-neutral-white px-2 py-0.5 text-value text-text-body focus-visible:outline-2 focus-visible:outline-accent-accent"
          @change="save"
          @keydown.esc.stop.prevent="cancel"
          @click.stop
        >
          <option v-if="!required" value="">—</option>
          <option
            v-for="option in options"
            :key="String(option.value)"
            :value="option.value"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <input
          v-else
          ref="inputRef"
          v-model="draft"
          data-cy="inline-edit-input"
          :type="htmlInputType"
          :aria-label="label"
          :disabled="saving"
          class="w-full min-w-0 rounded border bg-neutral-white px-2 py-0.5 text-value text-text-body focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="error ? 'border-red-default' : 'border-neutral-40'"
          @keydown.enter.stop.prevent="save"
          @keydown.esc.stop.prevent="cancel"
          @click.stop.prevent
        />
        <template v-if="!saving">
          <button
            type="button"
            data-cy="inline-edit-save"
            :aria-label="`${saveFieldLabel} ${label}`"
            class="flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded bg-accent-accent text-neutral-white hover:bg-accent-normal focus-visible:outline-2 focus-visible:outline-accent-accent"
            @click.stop.prevent="save"
          >
            <unicon :name="Unicons.Check.name" height="14" />
          </button>
          <button
            type="button"
            data-cy="inline-edit-cancel"
            :aria-label="`${cancelFieldLabel} ${label}`"
            class="flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded border border-neutral-40 bg-neutral-white text-text-body hover:bg-neutral-20 focus-visible:outline-2 focus-visible:outline-accent-accent"
            @click.stop.prevent="cancel"
          >
            <unicon :name="Unicons.Cross.name" height="12" />
          </button>
        </template>
        <SpinnerLoader v-else theme="accent" :dimensions="4" />
      </div>
      <div
        v-if="error"
        role="alert"
        data-cy="inline-edit-error"
        class="pt-0.5 text-xs text-red-default"
      >
        {{ error }}
      </div>
      <div v-else class="pt-0.5 text-xs text-text-placeholder">
        {{ isSelect ? selectHintLabel : hintLabel }}
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import {
  Collection,
  InputFieldTypes,
  MutateEntityValuesDocument,
} from "@/generated-types/queries";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { Unicons } from "@/types";

// Per-field inline editing: edit scope = save scope = validation scope.
// One PATCH per field key via mutateEntityValues with a single metadata
// entry; only this field locks while saving; undo writes the old value
// back as a new change so the audit trail stays append-only.
const props = withDefaults(
  defineProps<{
    formId: string;
    fieldKey: string;
    label: string;
    value: unknown;
    inputType?: string;
    required?: boolean;
    regex?: string | null;
    entityType?: string;
    dim?: boolean;
    options?: { label?: string | null; value?: unknown }[] | null;
  }>(),
  {
    inputType: InputFieldTypes.Text,
    required: false,
    regex: null,
    entityType: undefined,
    dim: false,
    options: null,
  },
);

const emit = defineEmits<{
  (event: "update:value", value: unknown): void;
}>();

const { t, te } = useI18n();
const route = useRoute();
const config: any = inject("config");
const { mutate } = useMutation(MutateEntityValuesDocument);

const editing = ref<boolean>(false);
const saving = ref<boolean>(false);
const draft = ref<string>("");
const error = ref<string>("");
const savedFlash = ref<boolean>(false);
const undoValue = ref<unknown>(undefined);
const inputRef = ref<HTMLInputElement | null>(null);
let flashTimer: ReturnType<typeof setTimeout> | undefined;
let undoTimer: ReturnType<typeof setTimeout> | undefined;

const translate = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;

const editFieldLabel = computed(() =>
  translate("inline-edit.edit-field", "Edit"),
);
const saveFieldLabel = computed(() =>
  translate("inline-edit.save-field", "Save"),
);
const cancelFieldLabel = computed(() =>
  translate("inline-edit.cancel-field", "Cancel"),
);
const hintLabel = computed(() =>
  translate("inline-edit.hint", "Enter saves · Esc cancels"),
);
const undoLabel = computed(() => translate("inline-edit.undo", "Undo"));

const htmlInputType = computed(() => {
  if (props.inputType === InputFieldTypes.Number) return "number";
  if (props.inputType === InputFieldTypes.Date) return "date";
  return "text";
});

// Selects commit on choose: picking an option saves immediately.
const isSelect = computed(
  () =>
    props.inputType === InputFieldTypes.DropdownSingleselectMetadata &&
    (props.options?.length ?? 0) > 0,
);

const optionLabel = (option: { label?: string | null; value?: unknown }) => {
  const label = option.label ?? String(option.value ?? "");
  return te(label) ? t(label) : label;
};

const selectHintLabel = computed(() =>
  translate("inline-edit.select-hint", "Choosing saves · Esc cancels"),
);

const collection = computed<Collection>(() => {
  const routeCollection = route.meta?.type as Collection | undefined;
  if (routeCollection) return routeCollection;
  if (props.entityType && config) {
    const childRoutes = getChildrenOfHomeRoutes(config).map(
      (childRoute: any) => childRoute.meta,
    );
    const match = childRoutes.find(
      (meta: any) =>
        meta.entityType?.toLowerCase() === props.entityType?.toLowerCase(),
    )?.type;
    if (match) return match;
  }
  return Collection.Entities;
});

const startEditing = () => {
  draft.value = props.value === undefined || props.value === null
    ? ""
    : String(props.value);
  error.value = "";
  editing.value = true;
  nextTick(() => inputRef.value?.focus());
};

const cancel = () => {
  editing.value = false;
  error.value = "";
};

const validateDraft = (): string => {
  const trimmed = draft.value.trim();
  if (props.required && trimmed === "")
    return translate("inline-edit.required", "This field is required");
  if (props.regex && trimmed !== "") {
    const raw = props.regex.replace(/^\/|\/$/g, "").replace(/\\\\/g, "\\");
    try {
      if (!new RegExp(raw).test(trimmed))
        return translate(
          "inline-edit.invalid-format",
          "Value does not match the expected format",
        );
    } catch {
      // Unparseable regex config: fall through, the backend still validates.
    }
  }
  return "";
};

const patchField = async (value: unknown): Promise<void> => {
  await mutate(
    {
      id: props.formId,
      collection: collection.value,
      formInput: {
        metadata: [{ key: props.fieldKey, value }],
        relations: [],
      },
    },
    { context: { skipGlobalErrorHandling: true } } as any,
  );
};

const flashSaved = () => {
  savedFlash.value = true;
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => (savedFlash.value = false), 2500);
};

const offerUndo = (oldValue: unknown) => {
  undoValue.value = oldValue;
  if (undoTimer) clearTimeout(undoTimer);
  undoTimer = setTimeout(() => (undoValue.value = undefined), 10000);
};

const save = async () => {
  error.value = validateDraft();
  if (error.value) return;

  const newValue =
    htmlInputType.value === "number" && draft.value.trim() !== ""
      ? Number(draft.value)
      : draft.value;
  const oldValue = props.value;
  saving.value = true;
  try {
    await patchField(newValue);
    emit("update:value", newValue);
    editing.value = false;
    flashSaved();
    offerUndo(oldValue);
  } catch (exception: unknown) {
    error.value =
      (exception as Error)?.message ||
      translate("inline-edit.save-failed", "Saving failed, try again");
  } finally {
    saving.value = false;
  }
};

const undo = async () => {
  const oldValue = undoValue.value;
  saving.value = true;
  try {
    await patchField(oldValue);
    emit("update:value", oldValue);
    undoValue.value = undefined;
    flashSaved();
  } catch {
    // Keep the undo affordance so the user can retry.
  } finally {
    saving.value = false;
  }
};
</script>
