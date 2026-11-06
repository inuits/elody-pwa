<template>
  <!-- In-place editing actions on a WYSIWYG field's label line
       (docs/design-system/components/wysiwyg-field.md): a pencil at rest,
       ✓ and × while editing (leaving the field saves it too). They sit above
       the content so they stay in view however long the text is. -->
  <div v-if="editing" class="flex shrink-0 items-center gap-1">
    <SpinnerLoader v-if="saving" data-cy="wysiwyg-saving" :dimensions="4" />
    <template v-else>
      <BaseButtonNew
        :icon="DamsIcons.Check"
        :aria-label="`${saveLabel} ${label}`"
        button-style="commit"
        button-size="md"
        class="!w-auto"
        @click="emit('save')"
      />
      <BaseButtonNew
        :icon="DamsIcons.Close"
        :aria-label="`${cancelLabel} ${label}`"
        button-style="secondary"
        button-size="md"
        class="!w-auto"
        @click="emit('cancel')"
      />
    </template>
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
import { DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

defineProps<{
  label: string;
  canEdit: boolean;
  editing: boolean;
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

const cancelLabel = computed(() => translated("inline-edit.cancel", "Cancel"));
const saveLabel = computed(() => translated("inline-edit.save", "Save"));
const editLabel = computed(() => translated("inline-edit.edit-field", "edit"));
</script>
