<template>
  <BaseModal
    :modal-state="pickEntityModalState.state"
    modal-position="left"
    modal-width-style="w-8/12"
    @hide-modal="closePickEntityModal"
  >
    <div
      v-if="pickEntityModalState.state === ModalState.Show"
      class="bg-neutral-20 w-full h-[92%] flex flex-col overflow-auto py-2"
    >
      <BaseLibrary
        :filterType="pickEntityModalState.acceptedEntityTypes[0]"
        :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
        :list-item-route-name="'SingleEntity'"
        :enable-bulk-operations="false"
        :bulk-operations-context="route.name as Context"
      />
    </div>
    <div class="w-full flex justify-end items-center p-6">
      <div
        :class="['rounded-md bg-accent-normal text-text-subtitle h-10 w-16 flex justify-center items-center cursor-pointer', {'opacity-30': !getEnqueuedItems(route.name as Context).length}]"
        @click="getItems()"
      >
        Add
      </div>
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
import {
  type Context,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useRouter } from "vue-router";

export type PickEntityModalType = {
  state: ModalState;
  pickedEntities: Entity[];
  acceptedEntityTypes?: Maybe<string>[];
};

const pickEntityModalState = ref<PickEntityModalType>({
  state: ModalState.Hide,
  pickedEntities: [],
  acceptedEntityTypes: [],
});

export const usePickEntityModal = () => {
  const updatePickEntityModal = (uploadModalInput: PickEntityModalType) => {
    pickEntityModalState.value = uploadModalInput;
  };

  const pickEntity = (pickedEntities: Entity[]) => {
    updatePickEntityModal({
      state: ModalState.Show,
      pickedEntities: pickedEntities,
    });
  };

  const closePickEntityModal = () => {
    updatePickEntityModal({
      state: ModalState.Hide,
      pickedEntities: [],
    });
  };

  const openPickEntityModal = (acceptedEntityTypes: Maybe<Entitytyping>[]) => {
    updatePickEntityModal({
      state: ModalState.Show,
      pickedEntities: [],
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
    const addItems = (entities: Entity[]) => {
      pickEntity(entities);
    };
    const { getEnqueuedItems } = useBulkOperations();
    const route = useRoute();
    const router = useRouter();

    const getItems = () => {
      const selectedEntities = getEnqueuedItems(route.name as Context);
      console.log(selectedEntities);
      addItems(selectedEntities as Entity[]);
    };

    router.beforeEach(() => {
      closePickEntityModal();
    });

    return {
      pickEntityModalState,
      closePickEntityModal,
      ModalState,
      SearchInputType,
      route,
      getItems,
      getEnqueuedItems,
    };
  },
});
</script>
