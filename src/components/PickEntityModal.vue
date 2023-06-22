<template>
  <BaseModal
    :modal-state="pickEntityModalState.state"
    modal-position="left"
    modal-width-style="w-8/12"
    @hide-modal="closePickEntityModal"
  >
    <div
      v-if="pickEntityModalState.state === ModalState.Show"
      class="bg-neutral-20 w-full h-full flex flex-col overflow-auto"
    >
      <AssetLibrary
        selection="true"
        :accepted-entity-types="pickEntityModalState.acceptedEntityTypes"
        @add-selection="addItem($event)"
      />
    </div>
  </BaseModal>
</template>
<script lang="ts">
import BaseModal from "./base/BaseModal.vue";
import { ModalState } from "@/generated-types/queries";
import { defineComponent, ref } from "vue";
import AssetLibrary from "@/components/AssetLibrary.vue";
import type { Entity, Maybe, Entitytyping } from "@/generated-types/queries";

export type PickEntityModalType = {
  state: ModalState;
  pickedEntity: Entity | undefined;
  acceptedEntityTypes?: Maybe<string>[];
};

const pickEntityModalState = ref<PickEntityModalType>({
  state: ModalState.Hide,
  pickedEntity: undefined,
  acceptedEntityTypes: [],
});

export const usePickEntityModal = () => {
  const updatePickEntityModal = (uploadModalInput: PickEntityModalType) => {
    pickEntityModalState.value = uploadModalInput;
  };

  const pickEntity = (pickedEntity: Entity) => {
    updatePickEntityModal({
      state: ModalState.Show,
      pickedEntity: pickedEntity,
    });
  };

  const closePickEntityModal = () => {
    updatePickEntityModal({
      state: ModalState.Hide,
      pickedEntity: undefined,
    });
  };

  const openPickEntityModal = (acceptedEntityTypes: Maybe<Entitytyping>[]) => {
    updatePickEntityModal({
      state: ModalState.Show,
      pickedEntity: undefined,
      acceptedEntityTypes: acceptedEntityTypes,
    });
  };

  return {
    pickEntity,
    closePickEntityModal,
    openPickEntityModal,
    pickEntityModalState,
  };
};

export default defineComponent({
  name: "PickEntityModal",
  components: {
    BaseModal,
    AssetLibrary,
  },
  setup() {
    const { pickEntity, closePickEntityModal, pickEntityModalState } =
      usePickEntityModal();
    const addItem = (entity: Entity) => {
      pickEntity(entity);
    };

    return {
      addItem,
      pickEntityModalState,
      closePickEntityModal,
      ModalState,
    };
  },
});
</script>
