<template>
  <base-modal
    :scroll="true"
    :modal-state="createModalState.state"
    @hide-modal="closeCreateModal"
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
<script lang="ts">
import BaseDropdown from "@/components/base/BaseDropdown.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import type { ModalState } from "@/components/base/BaseModal.vue";
import { Entitytyping } from "@/generated-types/generated-types/queries";
import { defineComponent, ref } from "vue";
import CreateEntityForm from "./CreateEntityForm.vue";

export type CreateModalType = {
  state: ModalState;
};

const createModalState = ref<CreateModalType>({
  state: "hide",
});

export const useCreateModal = () => {
  const updateCreateModal = (CreateModalInput: CreateModalType) => {
    createModalState.value = CreateModalInput;
  };

  const closeCreateModal = () => {
    updateCreateModal({
      state: "hide",
    });
  };

  const openCreateModal = () => {
    updateCreateModal({
      state: "show",
    });
  };

  return {
    closeCreateModal,
    openCreateModal,
    createModalState,
  };
};

export default defineComponent({
  name: "CreateEntity",
  components: { CreateEntityForm, BaseDropdown, BaseModal },
  setup() {
    const { closeCreateModal, createModalState } = useCreateModal();
    const selected = ref<Entitytyping>(Entitytyping.Story);

    return {
      selected,
      Entitytyping,
      closeCreateModal,
      createModalState,
    };
  },
});
</script>
