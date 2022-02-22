<template>
  <modal
    :large="true"
    :scroll="false"
    :modal-state="pickAssetModalState.state"
    @hide-modal="closePickAssetModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col">
      <AssetLibrary :enable-selection="true" @add-selection="addItem" />
    </div>
  </modal>
</template>
<script lang="ts">
  import Modal, { ModalState } from './base/Modal.vue';
  import { defineComponent, ref } from 'vue';
  import AssetLibrary from '@/components/AssetLibrary.vue';
  import { useMutation } from '@vue/apollo-composable';
  // import { AddComponentDocument, RelationType } from '@/queries';

  export type PickAssetModalType = {
    state: ModalState;
  };

  const pickAssetModalState = ref<PickAssetModalType>({
    state: 'hide',
  });

  export const usePickAssetModal = () => {
    const updatePickAssetModal = (uploadModalInput: PickAssetModalType) => {
      pickAssetModalState.value = uploadModalInput;
    };

    const closePickAssetModal = () => {
      updatePickAssetModal({
        state: 'hide',
      });
    };

    const openPickAssetModal = () => {
      updatePickAssetModal({
        state: 'show',
      });
    };

    return {
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
    props: {
      entityId: {
        type: String,
        required: true,
      },
    },
    emits: ['updateEntity'],
    setup(props, { emit }) {
      const { closePickAssetModal, pickAssetModalState } = usePickAssetModal();
      // const { mutate } = useMutation(AddComponentDocument);
      const addItem = async (id: string) => {
        // await mutate({
        //   id: props.entityId,
        //   relations: [{ type: RelationType.Components, key: id }],
        // });
        emit('updateEntity');
        closePickAssetModal();
      };

      return {
        addItem,
        pickAssetModalState,
        closePickAssetModal,
      };
    },
  });
</script>
