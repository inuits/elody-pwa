<template>
  <!-- The entity picker behind "Blader…" in a relation's inline editor. Picking
       only hands the entities back to the editor's draft; nothing saves here.
       It renders inside the editor, so its clicks and focus count as inside. -->
  <BaseModal
    :modal-type="TypeModals.RelationPicker"
    modal-height-style="min-h-[50vh]"
    :cancel-button-availabe="true"
    @hide-modal="close"
  >
    <div v-if="isOpen" class="p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-lg font-bold text-text-body">{{ label }}</h3>
        <button
          type="button"
          data-cy="relation-picker-close"
          :aria-label="closeLabel"
          class="inline-flex rounded-button p-(--button-sm-padding-icon) text-text-subtle hover:bg-accent-wash"
          @click="close"
        >
          <unicon :name="Unicons.Cross.name" height="18" aria-hidden="true" />
        </button>
      </div>
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
import { Unicons } from "@/types";
import BaseModal from "@/components/base/BaseModal.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { describePickedItem } from "@/composables/useRepetitiveForm";

defineProps<{
  label: string;
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
const closeLabel = computed<string>(() =>
  te("inline-edit.browse-close") ? t("inline-edit.browse-close") : "Close",
);

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
