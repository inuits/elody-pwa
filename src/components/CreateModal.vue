<template>
  <base-modal
    :modal-state="modal.modalState.value.state"
    modal-position="left"
    modal-width-style="w-5/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="w-full h-full bg-neutral-white">
      <div class="p-6 pb-0 mb-3">
        <h1 class="text-2xl text-text-body mb-3">{{ t("entity.create") }}</h1>
        <BaseDropdownNew
          v-model="selectedEntityType"
          :options="entityTypes"
          dropdown-style="defaultWithBorder"
        />
      </div>
      <CreateEntityForm
        v-if="selectedEntityType"
        :entity-type="selectedEntityType.value"
      />
    </div>
  </base-modal>
</template>

<script lang="ts" setup>
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import CreateEntityForm from "@/components/CreateEntityForm.vue";
import {
  CreateableEntityTypes,
  DamsIcons,
  ModalState,
  TypeModals,
  type DropdownOption,
} from "@/generated-types/queries";
import { ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.Create);
const selectedEntityType = ref<DropdownOption>();
const entityTypes = ref<DropdownOption[]>([]);

Object.values(CreateableEntityTypes).forEach((type) => {
  entityTypes.value.push({ icon: DamsIcons.NoIcon, label: type, value: type });
});

watch(
  () => modal.modalState.value.state,
  () => {
    if (modal.modalState.value.state === ModalState.Hide)
      selectedEntityType.value = undefined;
  }
);
</script>
