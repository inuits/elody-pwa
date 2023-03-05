<template>
  <base-modal
    :scroll="true"
    :modal-state="modalState.state"
    @hide-modal="closeModal"
  >
    <div class="bg-neutral-0 w-full">
      <div class="p-6 pb-0">
        <h1>{{ $t("entity.create") }}</h1>
        <BaseDropdown
          v-model="selected"
          :options="Object.values(Entitytyping)"
          :label="$t('entity.type')"
          class="w-full"
        />
      </div>
      <CreateEntityForm v-if="selected" :entity-type="selected" />
    </div>
  </base-modal>
</template>
<script lang="ts" setup>
import BaseDropdown from "@/components/base/BaseDropdown.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { Entitytyping } from "@/generated-types/queries";
import { defineComponent, ref } from "vue";
import CreateEntityForm from "./CreateEntityForm.vue";
import { ModalState, useAvailableModals } from "@/composables/useAvailableModals";

const { closeModal, openModal, modalState } = useAvailableModals();
const selected = ref<Entitytyping>(Entitytyping.Story);

</script>
