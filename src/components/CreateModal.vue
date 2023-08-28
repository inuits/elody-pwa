<template>
  <base-modal
    :modal-state="getModalInfo(TypeModals.Create).state"
    :modal-position="getModalInfo(TypeModals.Create).modalPosition"
    modal-width-style="w-5/12"
    @hide-modal="closeModal(TypeModals.Create)"
  >
    <div class="w-full h-full bg-neutral-white">
      <div class="p-6 pb-0 mb-3">
        <h1 class="text-2xl text-text-body mb-3">{{ t("entity.create") }}</h1>
        <BaseDropdownNew
          v-model="selectedEntityType"
          :options="entityTypes"
          label="Entity type"
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
import {
  CreateableEntityTypes,
  DamsIcons,
  ModalState,
  TypeModals,
  type DropdownOption,
} from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import CreateEntityForm from "@/components/CreateEntityForm.vue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBaseModal } from "@/composables/useBaseModal";

const { t } = useI18n();
const { getModalInfo, closeModal } = useBaseModal();
const selectedEntityType = ref<DropdownOption>();
const entityTypes = ref<DropdownOption[]>([]);

Object.values(CreateableEntityTypes).forEach((type) => {
  entityTypes.value.push({ icon: DamsIcons.NoIcon, label: type, value: type });
});

watch(
  () => getModalInfo(TypeModals.Create).state,
  (createModalState: ModalState) => {
    if (createModalState === ModalState.Hide)
      selectedEntityType.value = undefined;
  }
);
</script>
