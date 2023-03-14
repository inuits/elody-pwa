<template>
  <base-modal
    :scroll="true"
    :modal-state="getModal(TypeModals.Create).modalState.value.state"
    @hide-modal="getModal(TypeModals.Create).closeModal()"
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
import {  ref } from "vue";
import CreateEntityForm from "@/components/CreateEntityForm.vue";
import {  useAvailableModals } from "@/composables/useAvailableModals";
import { TypeModals } from "@/composables/modalFactory";

const {  getModal } = useAvailableModals();
const selected = ref<Entitytyping>(Entitytyping.Story);

</script>
