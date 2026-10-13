<template>
  <div
    data-cy="edit-toggle"
    v-if="
      pageEditModeEnabled &&
      (editModeHelper.editMode === 'view' ||
      editModeHelper.editMode === 'edit' ||
        editModeHelper.editMode === 'edit-delete')
    "
    class="ml-auto px-2"
  >
    <base-button-new
      v-if="!editModeHelper.isEdit"
      :button-size="buttonSize"
      :label="
        readmodeLabel
          ? translatedLabels.readmodeLabel
          : t('metadata.labels.edit-metadata')
      "
      :icon="DamsIcons.Edit"
      button-style="commit"
      @click="() => editModeHelper.enableEdit()"
    />
    <base-button-new
      v-else
      :button-size="buttonSize"
      :label="
        editmodeLabel
          ? translatedLabels.editmodeLabel
          : t('metadata.labels.editing-metadata')
      "
      :disabled="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { watch, inject, computed } from "vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import BaseButtonNew, {
  type ButtonSize,
} from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import { useEditMode } from "@/composables/useEdit";
import { DamsIcons } from "@/generated-types/queries";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useRoute } from "vue-router";
import type { useEditState } from "@/composables/useEditState";

const props = withDefaults(
  defineProps<{
    buttonSize?: ButtonSize;
    readmodeLabel?: string;
    editmodeLabel?: string;
  }>(),
  {
    buttonSize: "sm",
    readmodeLabel: "",
    editmodeLabel: "",
  },
);

const entityFormData = inject("entityFormData");
const route = useRoute();
const entityId = computed<string>(() => entityFormData?.id || route.params.id);
const editModeHelper = computed<ReturnType<typeof useEditState>>(() =>
  useEditMode(entityId.value),
);
const { isSingle } = useRouteHelpers();
// Fields are edited in place; the page-wide edit mode is opt-in per entity
// type (entityPageConfig[type].hasEditMetadataButton).
const { hasEditMetadataButton } = useEntityPageConfig();
const pageEditModeEnabled = computed<boolean>(
  () => hasEditMetadataButton.value === true,
);
const { t } = useI18n();

watch(
  () => isSingle,
  () => {
    if (!isSingle.value) editModeHelper.value.hideEditButton();
  },
  { immediate: true },
);

const translatedLabels = computed(() => ({
  readmodeLabel: t(props.readmodeLabel),
  editmodeLabel: t(props.editmodeLabel),
}));
</script>

<style scoped></style>
