<template>
  <!-- The entity picker behind "Blader…" in a relation's inline editor. Picking
       only hands the entities back to the editor's draft; nothing saves here.
       It renders inside the editor, so its clicks and focus count as inside. -->
  <BaseModal
    :modal-type="TypeModals.RelationPicker"
    modal-height-style="min-h-[50vh]"
    :title="title"
    @hide-modal="close"
  >
    <div v-if="isOpen" class="p-4 flex flex-col gap-3">
      <EntityPickerComponent
        :entity-uuid="entityId"
        :accepted-types="[acceptedType]"
        custom-query=""
        :computed-filters="filters"
        :entity-picker-mode="EntityPickerMode.Emit"
        :show-button="true"
        :enable-bulk-operations="true"
        :enable-advanced-filters="true"
        :should-use-state-for-route="false"
        :force-list-view="true"
        :search-by-type-route="true"
        :selection-limit="single ? 1 : 0"
        :context="BulkOperationsContextEnum.RelationPickerModal"
        base-library-height="max-h-[55vh]"
        @entities-selected="onPicked"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  type AdvancedFilterInput,
  type DropdownOption,
  EntityPickerMode,
  TypeModals,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { describePickedItem } from "@/composables/useRepetitiveForm";

const props = defineProps<{
  entityId: string;
  acceptedType: string;
  filters?: AdvancedFilterInput[];
  single: boolean;
}>();

const emit = defineEmits<{
  (event: "picked", options: DropdownOption[]): void;
}>();

const { t, te } = useI18n();
const { closeModal, getModalInfo } = useBaseModal();

const isOpen = computed<boolean>(
  () => getModalInfo(TypeModals.RelationPicker).open,
);
// entity-picker.md: "Kies persoon", the type in words, sentence case
const title = computed<string>(() => {
  const key = `entity-translations.${props.acceptedType.toLowerCase()}`;
  const type = te(key) ? t(key, 1).toLocaleLowerCase() : props.acceptedType;
  return t("inline-edit.browse-title", [type]);
});

const close = () => closeModal(TypeModals.RelationPicker);

const onPicked = (items: InBulkProcessableItem[]) => {
  emit(
    "picked",
    items.map((item) => ({
      label: describePickedItem(item).label ?? item.id,
      value: item.id,
    })),
  );
  close();
};
</script>
