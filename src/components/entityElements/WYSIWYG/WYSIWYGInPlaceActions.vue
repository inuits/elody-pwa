<template>
  <!-- In-place editing actions on a WYSIWYG field's label line
       (docs/design-system/components/wysiwyg-field.md): a pencil at rest,
       Bewaar and Annuleer while editing. They sit above the content so they
       stay in view however long the text is. -->
  <div v-if="editing" class="flex shrink-0 gap-1.5">
    <BaseButtonNew
      :label="saveLabel"
      button-style="commit"
      button-size="sm"
      force-show-label
      :disabled="!dirty || saving"
      :loading="saving"
      @click="emit('save')"
    />
    <BaseButtonNew
      :label="cancelLabel"
      button-style="ghost"
      button-size="sm"
      force-show-label
      :disabled="saving"
      @click="emit('cancel')"
    />
  </div>
  <!-- The same pencil as a field row's (field-row.md): subtle ink, 12px. -->
  <button
    v-else-if="canEdit"
    type="button"
    data-cy="wysiwyg-edit-button"
    class="flex shrink-0 items-center p-1 rounded-input cursor-pointer text-text-subtle hover:bg-surface-editable-hover"
    :aria-label="`${label}, ${editLabel}`"
    @click="emit('edit')"
  >
    <unicon :name="Unicons.EditAlt.name" height="12" />
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

defineProps<{
  label: string;
  canEdit: boolean;
  editing: boolean;
  dirty: boolean;
  saving: boolean;
}>();

const emit = defineEmits<{
  (event: "edit"): void;
  (event: "save"): void;
  (event: "cancel"): void;
}>();

const { t, te } = useI18n();
const translated = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;

const saveLabel = computed(() => translated("inline-edit.save", "Save"));
const cancelLabel = computed(() => translated("inline-edit.cancel", "Cancel"));
const editLabel = computed(() => translated("inline-edit.edit-field", "edit"));
</script>
