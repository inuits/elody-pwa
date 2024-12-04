<template>
  <div
    data-cy="edit-toggle"
    v-if="isEditToggleVisible === 'edit' || isEditToggleVisible === 'edit-delete'"
    class="ml-6"
  >
    <base-button-new
      v-if="!editMetadataBtnClicked"
      :button-size="buttonSize"
      :label="originalLabel ? originalLabel : t('metadata.labels.edit-metadata')"
      :icon="DamsIcons.Edit"
      button-style="accentAccent"
      @click="clickEditMetadataButton()"
    />
    <base-button-new
      v-else
      :button-size="buttonSize"
      :label="clickedLabel ? clickedLabel : t('metadata.labels.editing-metadata')"
      :disabled="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import BaseButtonNew, { type ButtonSize } from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import useEditMode from "@/composables/useEdit";
import { DamsIcons } from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    buttonSize?: ButtonSize;
    originalLabel?: string;
    clickedLabel?: string;
  }>(),
  {
    buttonSize: "small",
    originalLabel: undefined,
    clickedLabel: undefined,
  }
);

const {
  isEdit,
  setEditMode,
  hideEditToggle,
  isEditToggleVisible,
} = useEditMode();
const { isSingle } = useRouteHelpers();
const { t } = useI18n();

const editMetadataBtnClicked = ref<boolean>(false);
const clickEditMetadataButton = () => {
  editMetadataBtnClicked.value = true;
  setEditMode();
}

watch(isEdit, (value: boolean) => {
  editMetadataBtnClicked.value = value;
});

watch(
  () => isSingle,
  () => {
    if (isSingle.value === false) hideEditToggle();
  },
  { immediate: true }
);
</script>

<style scoped></style>