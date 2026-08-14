<template>
  <div ref="rootEl" class="min-w-0">
    <template v-if="!editing">
      <button
        ref="toggleRef"
        type="button"
        data-cy="inline-relation-toggle"
        class="group/irl flex min-h-[26px] w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded px-1 text-left hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
        :class="{ 'opacity-45 hover:opacity-100': empty }"
        :aria-label="`${label}, ${editFieldLabel}`"
        @click.stop.prevent="startEditing"
      >
        <span class="pointer-events-none min-w-0">
          <slot name="display" />
        </span>
        <span class="flex shrink-0 items-center gap-1">
          <span
            v-if="savedFlash"
            data-cy="inline-relation-saved"
            role="status"
            :aria-label="savedLabel"
            class="flex items-center text-green-600"
          >
            <unicon :name="Unicons.Check.name" height="14" />
          </span>
          <unicon
            :name="Unicons.Edit.name"
            height="12"
            class="text-neutral-80 opacity-0 transition-opacity group-hover/irl:opacity-100 group-focus-visible/irl:opacity-100"
          />
        </span>
      </button>
    </template>
    <template v-else>
      <!-- the tag input is the in-place relation gesture: chips + async
           options; Bewaar commits only this relation's diff -->
      <div
        role="group"
        :aria-label="label"
        data-cy="inline-relation-editor"
        @keydown.esc.stop.prevent="cancelEditing()"
        @click.stop
      >
        <div
          :class="{
            'pointer-events-none opacity-60': isSaving,
          }"
        >
          <slot name="editor" />
        </div>
        <div class="flex items-center gap-1 pt-1">
          <span class="mr-auto text-xs text-text-placeholder">
            {{ hintLabel }}
          </span>
          <button
            type="button"
            data-cy="inline-relation-cancel"
            class="flex h-[26px] shrink-0 cursor-pointer items-center rounded-md bg-transparent px-2 text-ui font-bold text-text-light hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
            :disabled="isSaving"
            @click.stop.prevent="cancelEditing()"
          >
            {{ cancelFieldLabel }}
          </button>
          <button
            type="button"
            data-cy="inline-relation-save"
            class="flex h-[26px] shrink-0 cursor-pointer items-center gap-1 rounded-md bg-accent-accent px-2 text-ui font-bold text-neutral-white hover:bg-commit-hover focus-visible:outline-2 focus-visible:outline-accent-accent disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="isSaving || !hasChanges()"
            @click.stop.prevent="saveEditing"
          >
            <SpinnerLoader v-if="isSaving" :dimensions="3" />
            {{ saveFieldLabel }}
          </button>
        </div>
        <div
          v-if="blockError"
          role="alert"
          data-cy="inline-relation-error"
          class="pt-0.5 text-xs text-red-default"
        >
          {{ blockError }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useBlockEditor } from "@/composables/useBlockEditor";
import { activeInlineScope } from "@/composables/useInlineEditCoordination";
import { Unicons } from "@/types";

// In-place relation editing: the field's relation is its own edit, save and
// validation scope. The editor slot hosts the autocomplete tag input, which
// writes drafts into the form's relationValues; Bewaar submits only the
// relations that changed since the snapshot (useBlockEditor diffs them).
const props = defineProps<{
  formId: string;
  label: string;
  empty?: boolean;
}>();

const { t, te } = useI18n();
const { isSaving, blockError, savedFlash, hasChanges, start, cancel, save } =
  useBlockEditor(props.formId);

const editing = ref<boolean>(false);
const toggleRef = ref<HTMLButtonElement | null>(null);
const rootEl = ref<HTMLElement | null>(null);
const scopeId = Symbol("inline-relation-editor");

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
  translate(
    "inline-edit.relation-hint",
    "Changes save when you click Save · Esc cancels",
  ),
);

// Only one scope edits at a time.
watch(activeInlineScope, (scope) => {
  if (editing.value && scope !== scopeId) cancelEditing({ refocus: false });
});

const handleOutsideClick = (event: MouseEvent) => {
  if (!editing.value || isSaving.value) return;
  if (rootEl.value?.contains(event.target as Node)) return;
  // The autocomplete menu teleports to body — clicks inside it are ours.
  if (
    (event.target as HTMLElement | null)?.closest?.(
      ".menu, .vue-advanced-select, [role='listbox']",
    )
  )
    return;
  if (!hasChanges()) cancelEditing({ refocus: false });
};

const startEditing = () => {
  start();
  editing.value = true;
  activeInlineScope.value = scopeId;
  document.addEventListener("click", handleOutsideClick, true);
  nextTick(() =>
    rootEl.value?.querySelector<HTMLInputElement>("input")?.focus(),
  );
};

const stopEditing = () => {
  editing.value = false;
  document.removeEventListener("click", handleOutsideClick, true);
  if (activeInlineScope.value === scopeId) activeInlineScope.value = null;
};

const cancelEditing = (options: { refocus?: boolean } = {}) => {
  cancel();
  stopEditing();
  if (options.refocus !== false) nextTick(() => toggleRef.value?.focus());
};

const saveEditing = async () => {
  const saved = await save([], [], undefined, {
    failureCopy: translate(
      "inline-edit.save-failed",
      "Saving failed, try again",
    ),
  });
  if (!saved) return;
  stopEditing();
  nextTick(() => toggleRef.value?.focus());
};

onBeforeUnmount(() =>
  document.removeEventListener("click", handleOutsideClick, true),
);
</script>
