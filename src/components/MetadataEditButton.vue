<template>
  <div
    data-cy="edit-toggle"
    v-if="
      editModeHelper.editMode === 'view' ||
      editModeHelper.editMode === 'edit' ||
      editModeHelper.editMode === 'edit-delete'
    "
    class="ml-6"
  >
    <base-button-new
      v-if="!editModeHelper.isEdit"
      :button-size="buttonSize"
      :label="
        readmodeLabel ? readmodeLabel : t('metadata.labels.edit-metadata')
      "
      :icon="DamsIcons.Edit"
      button-style="accentNormal"
      @click="() => editModeHelper.setEditMode()"
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
import { watch, inject, computed, onMounted } from "vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import BaseButtonNew, {
  type ButtonSize,
} from "@/components/base/BaseButtonNew.vue";
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
    buttonSize: "small",
    readmodeLabel: undefined,
    editmodeLabel: undefined,
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
</script>

<style scoped></style>
