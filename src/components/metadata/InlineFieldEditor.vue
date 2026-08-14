<template>
  <div ref="rootEl" class="min-w-0">
    <template v-if="!editing">
      <div class="flex items-center gap-1">
        <button
          ref="toggleRef"
          type="button"
          data-cy="inline-edit-toggle"
          class="group/ifr flex min-h-[26px] w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded px-1 text-left hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="{ 'opacity-45 hover:opacity-100': dim }"
          :aria-label="`${label}, ${editFieldLabel}`"
          @click.stop.prevent="startEditing"
        >
          <span
            class="min-w-0 truncate border-b border-dashed border-border-dashed"
          >
            <slot>{{ value }}</slot>
          </span>
          <span class="flex shrink-0 items-center gap-1">
            <span
              v-if="savedFlash"
              data-cy="inline-edit-saved"
              role="status"
              :aria-label="savedLabel"
              class="flex items-center text-green-600"
            >
              <unicon :name="Unicons.Check.name" height="14" />
            </span>
            <!-- pencil is a hover/focus cue; the dashed underline is the
                 always-visible affordance -->
            <unicon
              :name="Unicons.Edit.name"
              height="12"
              class="text-neutral-80 opacity-0 transition-opacity group-hover/ifr:opacity-100 group-focus-visible/ifr:opacity-100"
            />
          </span>
        </button>
        <button
          v-if="undoValue !== undefined"
          type="button"
          data-cy="inline-edit-undo"
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
        <!-- custom overlay listbox (native select is deprecated in edit
             surfaces); clearing = "Geen waarde"; choosing never saves -->
        <div
          v-if="isSelect"
          data-cy="inline-edit-select"
          class="w-full min-w-0"
          :class="{
            'rounded-input outline outline-1 outline-red-default': error,
          }"
          @keydown.esc.stop.prevent="cancel"
          @click.stop
        >
          <AdvancedDropdown
            :model-value="draft"
            :options="listboxOptions"
            :label="label"
            :clearable="!required"
            :disable="saving"
            :show-menu-header="false"
            label-position="inline"
            @update:model-value="onListboxDraft"
          />
        </div>
        <textarea
          v-else-if="isTextarea"
          ref="inputRef"
          v-model="draft"
          data-cy="inline-edit-textarea"
          rows="3"
          :aria-label="label"
          :aria-describedby="error ? errorId : undefined"
          :disabled="saving"
          class="w-full min-w-0 resize-y rounded-input border bg-neutral-white px-2 py-0.5 text-value text-text-body focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="error ? 'border-red-default' : 'border-neutral-40'"
          @keydown.ctrl.enter.stop.prevent="save"
          @keydown.meta.enter.stop.prevent="save"
          @keydown.esc.stop.prevent="cancel"
          @click.stop
        ></textarea>
        <input
          v-else
          ref="inputRef"
          v-model="draft"
          data-cy="inline-edit-input"
          :type="htmlInputType"
          :aria-label="label"
          :aria-describedby="error ? errorId : undefined"
          :disabled="saving"
          class="w-full min-w-0 rounded-input border bg-neutral-white px-2 py-0.5 text-value text-text-body focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="error ? 'border-red-default' : 'border-neutral-40'"
          @keydown.enter.stop.prevent="save"
          @keydown.esc.stop.prevent="cancel"
          @click.stop.prevent
        />
        <!-- text commit pair: Bewaar (teal rect, spinner while saving),
             Annuleer (ghost); Bewaar disabled while pristine -->
        <button
          type="button"
          data-cy="inline-edit-save"
          class="flex h-[26px] shrink-0 cursor-pointer items-center gap-1 rounded-md bg-accent-accent px-2 text-ui font-bold text-neutral-white hover:bg-commit-hover focus-visible:outline-2 focus-visible:outline-accent-accent disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="saving || isPristine"
          @click.stop.prevent="save"
        >
          <SpinnerLoader v-if="saving" :dimensions="3" />
          {{ saveFieldLabel }}
        </button>
        <button
          type="button"
          data-cy="inline-edit-cancel"
          class="flex h-[26px] shrink-0 cursor-pointer items-center rounded-md bg-transparent px-2 text-ui font-bold text-text-light hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
          :disabled="saving"
          @click.stop.prevent="cancel"
        >
          {{ cancelFieldLabel }}
        </button>
      </div>
      <div
        v-if="error"
        :id="errorId"
        role="alert"
        data-cy="inline-edit-error"
        class="pt-0.5 text-xs text-red-default"
      >
        {{ error }}
      </div>
      <div v-else class="pt-0.5 text-xs text-text-placeholder">
        {{ isTextarea ? textareaHintLabel : hintLabel }}
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  useId,
  watch,
} from "vue";
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
import { activeInlineScope } from "@/composables/useInlineEditCoordination";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

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
const originalDraft = ref<string>("");
const error = ref<string>("");
const savedFlash = ref<boolean>(false);
const undoValue = ref<unknown>(undefined);
const inputRef = ref<HTMLInputElement | null>(null);
const toggleRef = ref<HTMLButtonElement | null>(null);
const rootEl = ref<HTMLElement | null>(null);
const errorId = `inline-edit-error-${useId()}`;
const scopeId = Symbol("inline-editor");
let flashTimer: ReturnType<typeof setTimeout> | undefined;

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
const savedLabel = computed(() => translate("inline-edit.saved", "Saved"));
const hintLabel = computed(() =>
  translate("inline-edit.hint", "Enter saves · Esc cancels"),
);
const undoLabel = computed(() => translate("inline-edit.undo", "Undo"));

const isPristine = computed(() => draft.value === originalDraft.value);

const htmlInputType = computed(() => {
  if (props.inputType === InputFieldTypes.Number) return "number";
  if (props.inputType === InputFieldTypes.Date) return "date";
  return "text";
});

const isTextarea = computed(
  () =>
    props.inputType === InputFieldTypes.Textarea ||
    props.inputType === InputFieldTypes.ResizableTextarea,
);

// Decision R2-2: selects follow the same pick-then-Bewaar model as text.
const isSelect = computed(
  () =>
    props.inputType === InputFieldTypes.DropdownSingleselectMetadata &&
    (props.options?.length ?? 0) > 0,
);

const optionLabel = (option: { label?: string | null; value?: unknown }) => {
  const label = option.label ?? String(option.value ?? "");
  return te(label) ? t(label) : label;
};

const listboxOptions = computed(() =>
  (props.options ?? []).map((option) => ({
    label: optionLabel(option),
    value: option.value as string,
  })),
);

// Choosing never saves; it only updates the draft (pick-then-Bewaar).
const onListboxDraft = (value: unknown) => {
  draft.value = value === undefined || value === null ? "" : String(value);
};

const textareaHintLabel = computed(() =>
  translate("inline-edit.textarea-hint", "Ctrl+Enter saves · Esc cancels"),
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

// Only one scope edits at a time: opening this editor closes any other
// inline editor; pristine editors also close on outside click.
watch(activeInlineScope, (scope) => {
  if (scope === scopeId) return;
  if (editing.value) cancel({ refocus: false });
  if (scope !== null) undoValue.value = undefined;
});

const handleOutsideClick = (event: MouseEvent) => {
  if (!editing.value || saving.value) return;
  if (rootEl.value?.contains(event.target as Node)) return;
  if (isPristine.value) cancel({ refocus: false });
};

const startEditing = () => {
  draft.value =
    props.value === undefined || props.value === null
      ? ""
      : String(props.value);
  originalDraft.value = draft.value;
  error.value = "";
  editing.value = true;
  activeInlineScope.value = scopeId;
  document.addEventListener("click", handleOutsideClick, true);
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
    else rootEl.value?.querySelector<HTMLInputElement>("input")?.focus();
  });
};

const stopEditing = () => {
  editing.value = false;
  error.value = "";
  document.removeEventListener("click", handleOutsideClick, true);
  if (activeInlineScope.value === scopeId) activeInlineScope.value = null;
};

const cancel = (options: { refocus?: boolean } = {}) => {
  stopEditing();
  if (options.refocus !== false) nextTick(() => toggleRef.value?.focus());
};

onBeforeUnmount(() =>
  document.removeEventListener("click", handleOutsideClick, true),
);

const validateDraft = (): string => {
  const trimmed = draft.value.trim();
  if (props.required && trimmed === "")
    return te("inline-edit.required")
      ? t("inline-edit.required", { field: props.label })
      : `${props.label} is required`;
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
  flashTimer = setTimeout(() => (savedFlash.value = false), 2000);
};

// Decision R2-3: the inline undo chip lives until the next action (any
// other edit clears it via the shared scope watcher), not a timer.
const offerUndo = (oldValue: unknown) => {
  undoValue.value = oldValue;
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
    stopEditing();
    nextTick(() => toggleRef.value?.focus());
    flashSaved();
    offerUndo(oldValue);
  } catch {
    // The value the user typed is preserved; copy names the action, not
    // the server internals.
    error.value = translate(
      "inline-edit.save-failed",
      "Saving failed, try again",
    );
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
