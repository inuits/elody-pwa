<template>
  <BaseModal
    :modal-state="pickEntityModalState.state"
    modal-position="left"
    modal-width-style="w-8/12"
    @hide-modal="closePickEntityModal"
  >
    <div
      v-if="pickEntityModalState.state === ModalState.Show"
      class="bg-neutral-20 w-full h-full flex flex-col overflow-auto py-2"
    >
      <BaseLibrary
        :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
        :list-item-route-name="'SingleEntity'"
        :enable-bulk-operations="true"
        :bulk-operations-context="route.name as Context"
      />
    </div>
  </BaseModal>
</template>

<script lang="ts">
import BaseModal from "./base/BaseModal.vue";
import { ModalState } from "@/generated-types/queries";
import { defineComponent, ref } from "vue";
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import type { Entity, Maybe, Entitytyping } from "@/generated-types/queries";
import { SearchInputType } from "@/generated-types/queries";
import { useRoute } from "vue-router";
import type { Context } from "@/composables/useBulkOperations";

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
    BaseLibrary,
  },
  setup() {
    const { pickEntity, closePickEntityModal, pickEntityModalState } =
      usePickEntityModal();
    const addItem = (entity: Entity) => {
      pickEntity(entity);
    };
    const route = useRoute();

    return {
      addItem,
      pickEntityModalState,
      closePickEntityModal,
      ModalState,
      SearchInputType,
      route,
    };
  },
});
</script>
