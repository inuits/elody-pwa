<template>
  <div class="inline-field-editor" @keydown="handleKeydown">
    <div class="inline-field-editor__row">
      <div ref="inputZone" class="inline-field-editor__input">
        <slot />
      </div>
      <template v-if="showCommitActions">
        <BaseButton
          button-style="commit"
          button-size="sm"
          :label="t('inline-editor.save')"
          :disabled="!isDirty || isSaving"
          :loading="isSaving"
          data-cy="inline-field-editor-save"
          @click="emit('save')"
        />
        <BaseButton
          button-style="ghost"
          button-size="sm"
          :label="t('inline-editor.cancel')"
          :disabled="isSaving"
          data-cy="inline-field-editor-cancel"
          @click="emit('cancel')"
        />
      </template>
    </div>

    <p v-if="showCommitActions" class="inline-field-editor__hint">
      {{ t("inline-editor.keyboard-hint") }}
    </p>

    <p
      v-if="errorMessage"
      role="alert"
      data-cy="inline-field-editor-error"
      class="inline-field-editor__error"
    >
      {{ t(errorMessage) }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue";
import { nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const {
  isDirty = false,
  isSaving = false,
  errorMessage = undefined,
  multiline = false,
  showCommitActions = true,
} = defineProps<{
  /** Pick-then-Bewaar: nothing commits until the value actually changed. */
  isDirty?: boolean;
  isSaving?: boolean;
  errorMessage?: string;
  /** A textarea keeps Enter for newlines and commits on Ctrl+Enter. */
  multiline?: boolean;
  /**
   * Off for a field inside an open group: the group carries one Bewaar and
   * one Annuleer for all of its members, never one per field.
   */
  showCommitActions?: boolean;
}>();

const emit = defineEmits<{
  (event: "save"): void;
  (event: "cancel"): void;
}>();

const { t } = useI18n();

const inputZone = ref<HTMLElement>();

/* Opening is a keyboard gesture (Enter on the row), so the input must take
   focus — without it Enter-saves and Esc-cancels never reach the editor. */
onMounted(async () => {
  await nextTick();
  const target = inputZone.value?.querySelector<HTMLElement>(
    "input:not([type=hidden]):not([disabled]), textarea, select, [contenteditable], [tabindex]:not([tabindex='-1'])",
  );
  target?.focus();
});

const handleKeydown = (event: KeyboardEvent) => {
  // Inside a group the keys belong to the group, so let them bubble untouched.
  if (!showCommitActions) return;

  if (event.key === "Escape") {
    event.stopPropagation();
    emit("cancel");
    return;
  }

  if (event.key !== "Enter" || isSaving) return;

  // A multiline editor must not commit on a plain Enter — that is a newline.
  if (multiline && !(event.ctrlKey || event.metaKey)) return;
  // Neither should a select that is using Enter to pick an option.
  if ((event.target as HTMLElement)?.getAttribute("role") === "combobox") return;

  event.preventDefault();
  if (isDirty) emit("save");
};
</script>

<style scoped>
.inline-field-editor__row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-ds-5);
}

.inline-field-editor__input {
  flex: 1;
  min-width: 0;
  font-size: var(--text-value);
}

/* BaseButton is width:100% by default, which would squeeze the input out of
   the row entirely; here the actions size to their labels. */
.inline-field-editor__row > :deep(.ds-button) {
  flex: none;
  width: auto;
}

.inline-field-editor__hint {
  margin-top: var(--spacing-ds-2);
  font-size: var(--text-hint);
  color: var(--color-text-muted);
}

.inline-field-editor__error {
  margin-top: var(--spacing-ds-2);
  font-size: var(--text-hint);
  color: var(--color-danger);
}
</style>
