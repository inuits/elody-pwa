<template>
  <modal
    :scroll="true"
    :modal-state="createModalState.state"
    @hide-modal="closeCreateModal"
  >
    <div class="p-6 bg-neutral-0 pb-20 w-full">
      <div>
        <label for="entities">Choose an entity to create...</label><br />
        <Dropdown v-model="selected" :options="Entitytyping" label="Type" />
      </div>
      <CreateEntityForm v-if="selected" :entity-type="selected" />
    </div>
  </modal>
</template>
<script lang="ts">
  import Dropdown from '@/components/base/Dropdown.vue';
  import Modal, { ModalState } from '@/components/base/Modal.vue';
  import { Entitytyping } from '@/queries';
  import { defineComponent, ref } from 'vue';
  import CreateEntityForm from './CreateEntityForm.vue';

  export type CreateModalType = {
    state: ModalState;
  };

  const createModalState = ref<CreateModalType>({
    state: 'hide',
  });

  export const useCreateModal = () => {
    const updateCreateModal = (CreateModalInput: CreateModalType) => {
      createModalState.value = CreateModalInput;
    };

    const closeCreateModal = () => {
      updateCreateModal({
        state: 'hide',
      });
    };

    const openCreateModal = () => {
      updateCreateModal({
        state: 'show',
      });
    };

    return {
      closeCreateModal,
      openCreateModal,
      createModalState,
    };
  };

  export default defineComponent({
    name: 'CreateEntity',
    components: { CreateEntityForm, Dropdown, Modal },
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
