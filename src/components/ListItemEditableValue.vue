<template>
  <button
    type="button"
    data-cy="list-item-editable-value"
    class="group flex items-end gap-1.5 w-fit max-w-full -mx-1.5 -my-1 px-1.5 py-1 text-left rounded-md cursor-pointer transition-colors hover:bg-accent-light focus-visible:bg-accent-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-normal"
    :aria-label="t('modals.entityEdit.editValue', [t(label ?? '')])"
    @click.stop.prevent="openEditForm"
  >
    <span class="min-w-0"><slot /></span>
    <unicon
      :name="Unicons.EditAlt.name"
      height="12"
      aria-hidden="true"
      class="shrink-0 mb-1 fill-neutral-200 transition-colors group-hover:fill-accent-accent group-focus-visible:fill-accent-accent"
    />
  </button>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import {
  ContextMenuFormFlow,
  ModalStyle,
  TypeModals,
  type Entitytyping,
} from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { Unicons } from "@/types";

const props = defineProps<{
  editFormQuery: string;
  label?: string;
  entityId: string;
  entityType: Entitytyping;
  refetchEntities?: () => unknown;
}>();

const { t } = useI18n();
const { openModal } = useBaseModal();

const openEditForm = () =>
  openModal(
    TypeModals.EntityEditModal,
    ModalStyle.CenterWide,
    props.editFormQuery,
    undefined,
    undefined,
    undefined,
    {
      entityId: props.entityId,
      entityType: props.entityType,
      flow: ContextMenuFormFlow.Update,
      title: props.label,
      callback: () => props.refetchEntities?.(),
    },
  );
</script>
