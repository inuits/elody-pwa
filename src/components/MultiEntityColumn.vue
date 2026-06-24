<template>
  <div class="flex flex-col h-full bg-neutral-0 rounded-lg overflow-hidden">
    <div
      class="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-10"
    >
      <div class="flex w-1/2 min-w-0">
        <metadata-formatter-pill
          v-if="pillLabel"
          formatter="pill"
          size="lg"
          :label="pillLabel"
        />
        <span v-else class="text-lg font-bold text-text-light truncate">
          {{ columnLabel }}
        </span>
      </div>
      <div class="flex w-1/2 shrink-0 items-center justify-center gap-2">
        <base-button-new
          v-if="
            !editHelper.isEdit &&
            (editHelper.editMode === 'edit' ||
              editHelper.editMode === 'edit-delete')
          "
          button-size="small"
          :label="t('metadata.labels.edit-metadata')"
          :icon="DamsIcons.Edit"
          button-style="accentNormal"
          @click="startEdit"
        />
        <template v-if="editHelper.isEdit">
          <base-button-new
            button-size="small"
            :label="t('bulk-operations.save')"
            :icon="DamsIcons.Save"
            button-style="accentAccent"
            :disabled="editHelper.showErrors"
            @click="saveEdit"
          />
          <base-button-new
            button-size="small"
            :label="t('bulk-operations.cancel')"
            :icon="DamsIcons.Times"
            button-style="accentNormal"
            @click="openDiscardModal"
          />
        </template>
      </div>
    </div>
    <div class="flex-1 min-h-0 overflow-y-auto">
      <entity-column
        :entity="entity"
        :column-list="entity.entityView"
        :identifiers="identifiers"
        :id="entity.id"
        :entity-type="entity.type"
        @mutated-entity-updated="onMutatedEntityUpdated"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, watch } from "vue";
import {
  DamsIcons,
  Permission,
  type BaseEntity,
  type Entity,
} from "@/generated-types/queries";
import EntityColumn from "@/components/EntityColumn.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import MetadataFormatterPill from "@/components/metadata/MetadataFormatterPill.vue";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { usePermissions } from "@/composables/usePermissions";
import useEntitySingle from "@/composables/useEntitySingle";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
import { auth } from "@/main";

const props = defineProps<{
  entity: BaseEntity;
  refetch: () => any;
}>();

const emit = defineEmits<{
  (event: "mutatedEntityUpdated", mutatedEntity: Entity): void;
}>();

const { t } = useI18n();
const { getEditableMetadataKeys, discardEditForForm } = useFormHelper();
const { fetchUpdateAndDeletePermission } = usePermissions();
const { confirm } = useConfirmModal();

useEditMode(props.entity.id);
const editHelper = useEditMode(props.entity.id);
const entityRef = computed(() => props.entity);
const identifiers = computed<string[]>(
  () => props.entity.intialValues?.identifiers ?? [props.entity.id],
);

provide("ParentEntityProvider", entityRef);
provide("RefetchParentEntity", props.refetch);
provide("IsPreviewElement", false);

const pillLabel = computed<string | undefined>(() => {
  const typePill = (props.entity.intialValues as any)?.typePillLabel;
  if (typePill && typeof typePill === "object") return typePill.label;
  if (typeof typePill === "string") return typePill;
  return undefined;
});
const columnLabel = computed<string>(() =>
  t(`entity-translations.singular.${props.entity.type}`),
);

const focusThisEntity = () => {
  useEntitySingle().setEntityUuid(props.entity.uuid || props.entity.id);
  useEntitySingle().setEntityType(props.entity.type);
};

const applyEditPermissions = () => {
  const mappings = fetchUpdateAndDeletePermission(
    props.entity.id,
    props.entity.type,
  );
  if (!mappings) return;
  mappings.then((result) => {
    const canEdit = result.get(Permission.Canupdate);
    const canDelete = result.get(Permission.Candelete);
    if (!auth.isAuthenticated.value) return editHelper.hideEditButton();
    if (canEdit && canDelete) editHelper.setEditMode("edit-delete");
    else if (canEdit) editHelper.setEditMode("edit");
    else if (canDelete) editHelper.setEditMode("delete");
    else editHelper.hideEditButton();
  });
};

const startEdit = () => {
  focusThisEntity();
  editHelper.enableEdit();
};

const saveEdit = async () => {
  focusThisEntity();
  editHelper.clickButton();
  await editHelper.save();
};

const openDiscardModal = async () => {
  const choice = await confirm({
    title: t("confirm.discard-edit.title"),
    message: t("confirm.discard-edit.message"),
    confirmLabel: t("confirm.discard-edit.confirm"),
    cancelLabel: t("confirm.discard-edit.cancel"),
  });
  if (choice !== "confirm") return;
  focusThisEntity();
  editHelper.discard();
  discardEditForForm(props.entity.id);
};

const onMutatedEntityUpdated = (mutatedEntity: Entity) => {
  emit("mutatedEntityUpdated", mutatedEntity);
};

const registerEditableKeys = () => {
  if (props.entity.entityView && typeof props.entity.entityView !== "string")
    getEditableMetadataKeys(props.entity.entityView, props.entity.id);
};

onMounted(() => {
  editHelper.isEdit = false;
  registerEditableKeys();
  applyEditPermissions();
});

watch(
  () => props.entity,
  () => registerEditableKeys(),
);
</script>
