<template>
  <BaseModal
    :modal-state="pickEntityModalState.state"
    modal-position="right"
    modal-width-style="w-10/12"
    @hide-modal="closePickEntityModal"
  >
    <div
      v-if="pickEntityModalState.state === ModalState.Show"
      class="flex flex-col w-full h-full overflow-auto py-6"
    >
      <BaseLibrary
        :bulk-operations-context="route.name as Context"
        :search-input-type-on-drawer="
          pickEntityModalState.acceptedEntityTypes.length > 0
            ? pickEntityModalState.acceptedEntityTypes[0] !== 'mediafile'
              ? SearchInputType.AdvancedInputType
              : SearchInputType.AdvancedInputMediaFilesType
            : SearchInputType.AdvancedInputType
        "
        :filter-type="pickEntityModalState.acceptedEntityTypes.length > 0 ? (pickEntityModalState.acceptedEntityTypes[0] as string) : undefined"
        :confirm-selection-button="true"
        :enable-navigation="false"
        list-item-route-name="SingleEntity"
        @confirm-selection="(selectedItems) => addItems(selectedItems)"
      />
    </div>
  </BaseModal>
</template>

<script lang="ts">
import {
  type Context,
  useBulkOperations,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import type { Entity } from "@/generated-types/queries";
import type { FormContext } from "vee-validate";
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import BaseModal from "./base/BaseModal.vue";
import { defineComponent, ref } from "vue";
import { Entitytyping, ModalState } from "@/generated-types/queries";
import { SearchInputType } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

export type PickEntityModalType = {
  state: ModalState;
  metaKey?: string | undefined;
  pickedEntities: Entity[];
  acceptedEntityTypes: string[];
};

const pickEntityModalState = ref<PickEntityModalType>({
  state: ModalState.Hide,
  metaKey: undefined,
  pickedEntities: [],
  acceptedEntityTypes: [],
});

export const usePickEntityModal = () => {
  const route = useRoute();
  const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

  const updatePickEntityModal = (uploadModalInput: PickEntityModalType) => {
    pickEntityModalState.value = uploadModalInput;
  };

  const closePickEntityModal = () => {
    updatePickEntityModal({
      state: ModalState.Hide,
      pickedEntities: [],
      acceptedEntityTypes: [],
      metaKey: undefined,
    });
    dequeueAllItemsForBulkProcessing(route.name as Context);
  };

  const openPickEntityModal = (
    acceptedEntityTypes: Entitytyping[],
    metaKey: string | undefined = undefined
  ) => {
    updatePickEntityModal({
      state: ModalState.Show,
      pickedEntities: [],
      acceptedEntityTypes: acceptedEntityTypes,
      metaKey,
    });
  };

  return {
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
    const { closePickEntityModal, pickEntityModalState } = usePickEntityModal();
    const { getEnqueuedItems } = useBulkOperations();
    const { getForm } = useFormHelper();
    const route = useRoute();
    const router = useRouter();

    const addItemToList = (
      currentValue: string[],
      items: string[]
    ): string[] => {
      const returnList = [...currentValue];
      items.forEach((item: string) => {
        if (currentValue.includes(item)) {
          console.warn("This item was already added, skipping");
          return;
        }
        returnList.push(item);
      });
      return returnList;
    };

    const addItems = (selectedItems: InBulkProcessableItem[]) => {
      const id = route.params.id as string;
      const form: FormContext = getForm(id);
      const fieldKey = pickEntityModalState.value.metaKey;
      if (form && selectedItems && fieldKey) {
        const currentValue = form.values[fieldKey];
        const newValue = addItemToList(
          currentValue,
          selectedItems.map((i) => i.id)
        );
        form.setFieldValue(fieldKey, newValue);
        closePickEntityModal();
      }
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
      addItems,
      getEnqueuedItems,
    };
  },
});
</script>
