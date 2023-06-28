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
        :filterType="(pickEntityModalState?.acceptedEntityTypes[0] as string)"
        :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
        :list-item-route-name="'SingleEntity'"
        :enable-bulk-operations="false"
        :enable-navigation="false"
        :bulk-operations-context="route.name as Context"
      />
    </div>
    <div class="w-full flex justify-end items-center p-6">
      <div
        :class="['rounded-md bg-accent-normal text-text-subtitle h-10 w-16 flex justify-center items-center cursor-pointer', {'opacity-30': !getEnqueuedItems(route.name as Context).length}]"
        @click="addItems()"
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
import { useFormHelper } from "@/composables/useFormHelper";
import type { FormContext } from "vee-validate";

export type PickEntityModalType = {
  state: ModalState;
  metaKey?: string | undefined;
  pickedEntities: Entity[];
  acceptedEntityTypes?: Maybe<string>[];
};

const pickEntityModalState = ref<PickEntityModalType>({
  state: ModalState.Hide,
  metaKey: undefined,
  pickedEntities: [],
  acceptedEntityTypes: [],
});

export const usePickEntityModal = () => {
  const updatePickEntityModal = (uploadModalInput: PickEntityModalType) => {
    pickEntityModalState.value = uploadModalInput;
  };

  const closePickEntityModal = () => {
    updatePickEntityModal({
      state: ModalState.Hide,
      pickedEntities: [],
      metaKey: undefined,
    });
  };

  const openPickEntityModal = (
    acceptedEntityTypes: Maybe<Entitytyping>[],
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

    const addItems = () => {
      const selectedEntities = getEnqueuedItems(route.name as Context);
      const id = route.params.id as string;
      const form: FormContext = getForm(id);
      const fieldKey = pickEntityModalState.value.metaKey;
      if (form && selectedEntities && fieldKey) {
        const currentValue = form.values[fieldKey];
        const newValue = addItemToList(
          currentValue,
          selectedEntities.map((e) => e.id)
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
