<template>
  <BaseModal
    :large="true"
    :scroll="false"
    :modal-state="pickEntityModalState.state"
    @hide-modal="closePickEntityModal"
  >
    <div
      v-if="pickEntityModalState.state === 'show'"
      class="bg-neutral-20 w-full h-full flex flex-col overflow-auto"
    >
      <MediaFileLibrary
        v-if="pickEntityModalState?.acceptedEntityTypes?.includes('MediaFile')"
        :enable-selection="true"
        :accepted-entity-types="pickEntityModalState.acceptedEntityTypes"
        @add-selection="addItem"
      />
      <AssetLibrary
        v-else
        :enable-selection="true"
        :accepted-entity-types="pickEntityModalState.acceptedEntityTypes"
        @add-selection="addItem($event)"
      />
    </div>
  </BaseModal>
</template>
<script lang="ts">
import BaseModal from "./base/BaseModal.vue";
import type { ModalState } from "./base/BaseModal.vue";
import { defineComponent, ref } from "vue";
import AssetLibrary from "@/components/AssetLibrary.vue";
import MediaFileLibrary from "@/components/MediaFileLibrary.vue";
import type { Entity, Maybe } from "@/queries";

export type PickEntityModalType = {
  state: ModalState;
  pickedEntity: Entity | undefined;
  acceptedEntityTypes?: Maybe<string>[];
};

const pickEntityModalState = ref<PickEntityModalType>({
  state: "hide",
  pickedEntity: undefined,
  acceptedEntityTypes: [],
});

export const usePickEntityModal = () => {
  const updatePickEntityModal = (uploadModalInput: PickEntityModalType) => {
    pickEntityModalState.value = uploadModalInput;
  };

  const pickEntity = (pickedEntity: Entity) => {
    updatePickEntityModal({
      state: "hide",
      pickedEntity: pickedEntity,
    });
  };

  const closePickEntityModal = () => {
    updatePickEntityModal({
      state: "hide",
      pickedEntity: undefined,
    });
  };

  const openPickEntityModal = (acceptedEntityTypes: Maybe<string>[]) => {
    updatePickEntityModal({
      state: "show",
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
    MediaFileLibrary,
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
    };
  },
});
</script>
