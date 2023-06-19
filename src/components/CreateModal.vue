<template>
  <base-modal
    :modal-state="getModal(TypeModals.Create).modalState.value.state"
    modal-position="center"
    modal-width-style="w-3/4"
    @hide-modal="getModal(TypeModals.Create).closeModal()"
  >
    <div class="bg-neutral-0 w-full h-full">
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
import { Entitytyping, TypeModals } from "@/generated-types/queries";
import { ref } from "vue";
import CreateEntityForm from "@/components/CreateEntityForm.vue";
import { useAvailableModals } from "@/composables/useAvailableModals";

const { getModal } = useAvailableModals();
const selected = ref<Entitytyping>();
</script>
