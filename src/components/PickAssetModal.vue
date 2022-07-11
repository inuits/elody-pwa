<template>
  <modal
    :large="true"
    :scroll="false"
    :modal-state="pickAssetModalState.state"
    @hide-modal="closePickAssetModal"
  >
    <div
      v-if="pickAssetModalState.state !== 'hide'"
      class="bg-neutral-20 w-full h-full flex flex-col overflow-auto"
    >
      <AssetLibrary
        :enable-selection="true"
        :accepted-entity-types="pickAssetModalState.acceptedEntityTypes"
        @add-selection="addItem"
      />
    </div>
  </modal>
</template>
<script lang="ts">
  import Modal, { ModalState } from './base/Modal.vue';
  import { defineComponent, ref, watch } from 'vue';
  import AssetLibrary from '@/components/AssetLibrary.vue';
  import { Entity } from '@/queries';

  export type PickAssetModalType = {
    state: ModalState;
    pickedAsset: Entity | undefined;
    acceptedEntityTypes?: string[];
  };

  const pickAssetModalState = ref<PickAssetModalType>({
    state: 'hide',
    pickedAsset: undefined,
    acceptedEntityTypes: [],
  });

  export const usePickAssetModal = (cb?: (_value: Entity) => void) => {
    const updatePickAssetModal = (uploadModalInput: PickAssetModalType) => {
      pickAssetModalState.value = uploadModalInput;
    };
    const callBack = ref<((_value: Entity) => void) | undefined>(cb ? cb : undefined);

    const pickAsset = (pickedAsset: Entity) => {
      updatePickAssetModal({
        state: 'hide',
        pickedAsset: pickedAsset,
      });
    };

    const closePickAssetModal = () => {
      updatePickAssetModal({
        state: 'hide',
        pickedAsset: undefined,
      });
    };

    const openPickAssetModal = (acceptedEntityTypes: string[]) => {
      updatePickAssetModal({
        state: 'show',
        pickedAsset: undefined,
        acceptedEntityTypes: acceptedEntityTypes,
      });
    };

    return {
      pickAsset,
      closePickAssetModal,
      openPickAssetModal,
      pickAssetModalState,
    };
  };

  export default defineComponent({
    name: 'PickAssetModal',
    components: {
      Modal,
      AssetLibrary,
    },
    setup() {
      const { pickAsset, closePickAssetModal, pickAssetModalState } = usePickAssetModal();
      const addItem = async (asset: Entity) => {
        pickAsset(asset);
      };

      return {
        addItem,
        pickAssetModalState,
        closePickAssetModal,
      };
    },
  });
</script>
