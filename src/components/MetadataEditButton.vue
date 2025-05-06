<template>
  <div
    data-cy="edit-toggle"
    v-if="editMode === 'edit' || editMode === 'edit-delete'"
    class="ml-6"
  >
    <base-button-new
      v-if="!editMetadataBtnClicked"
      :button-size="buttonSize"
      :label="
        readmodeLabel ? readmodeLabel : t('metadata.labels.edit-metadata')
      "
      :icon="DamsIcons.Edit"
      button-style="accentNormal"
      @click="clickEditMetadataButton()"
    />
    <base-button-new
      v-else
      :button-size="buttonSize"
      :label="
        editmodeLabel ? editmodeLabel : t('metadata.labels.editing-metadata')
      "
      :disabled="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import BaseButtonNew, {
  type ButtonSize,
} from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import useEditMode from "@/composables/useEdit";
import { DamsIcons } from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    buttonSize?: ButtonSize;
    readmodeLabel?: string;
    editmodeLabel?: string;
  }>(),
  {
    buttonSize: "small",
    readmodeLabel: undefined,
    editmodeLabel: undefined,
  },
);

const { isEdit, setEditMode, hideEditToggle, editMode } = useEditMode();
const { isSingle } = useRouteHelpers();
const { t } = useI18n();

const editMetadataBtnClicked = ref<boolean>(false);
const clickEditMetadataButton = () => {
  editMetadataBtnClicked.value = true;
  setEditMode();
};

watch(isEdit, (value: boolean) => {
  editMetadataBtnClicked.value = value;
});

watch(
  () => isSingle,
  () => {
    if (isSingle.value === false) hideEditToggle();
  },
  { immediate: true },
);
</script>

<style scoped></style>
