<template>
  <div
    data-cy="edit-toggle"
    v-if="
      editModeHelper.editMode === 'view' ||
      editModeHelper.editMode === 'edit' ||
      editModeHelper.editMode === 'edit-delete'
    "
    class="ml-auto px-2"
  >
    <base-button
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
    <base-button
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
import BaseButton, {
  type ButtonSize,
} from "@/components/base/BaseButton.vue";
import { useI18n } from "vue-i18n";
import { useEditMode } from "@/composables/useEdit";
import { DamsIcons } from "@/generated-types/queries";
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
