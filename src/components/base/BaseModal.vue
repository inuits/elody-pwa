<template>
  <dialog
    ref="dialog"
    @close="hideModal"
    :class="[
      {
        'grid grid-rows-[max-content_1fr] base-modal--opened': getModalInfo(
          props.modalType,
        ).open,
        'rounded-xl':
          currentModalStyle === ModalStyle.Center ||
          currentModalStyle === ModalStyle.CenterWide,
      },
      modalStyle,
      `@container/modal`,
    ]"
  >
    <div v-if="!cancelButtonAvailabe" class="flex justify-end p-2">
      <unicon
        :name="Unicons.Close.name"
        :height="iconHeight"
        class="cursor-pointer"
        @click="hideModal"
      />
    </div>
    <slot />
  </dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { type TypeModals, ModalStyle } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";

const props = withDefaults(
  defineProps<{
    modalType: TypeModals;
    modalHeightStyle?: string;
    iconHeight?: number;
    modalColor?: string;
    cancelButtonAvailabe?: boolean;
  }>(),
  {
    modalHeightStyle: "max-h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-background-light",
    cancelButtonAvailabe: false,
  },
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const { currentModalStyle, getModalInfo } = useBaseModal();
const dialog = ref<HTMLDialogElement>();
const modalStyle = computed(() => modalStyles[currentModalStyle.value]);

const modalStyles: { [key: string]: string } = {
  right: `min-w-[40vw] w-fit h-screen max-h-screen mr-0 my-0`,
  rightWide: `min-w-[80vw] w-fit h-screen max-h-screen mr-0 my-0`,
  center: `min-w-[50vw] w-fit m-auto ${props.modalHeightStyle}`,
  centerWide: `min-w-[80vw] w-fit m-auto max-h-[90vh]`,
  left: "",
};

watch(
  () => getModalInfo(props.modalType).open,
  (isModalOpen: boolean) => {
    if (isModalOpen) {
      dialog.value?.showModal();
      document.body.classList.add("overflow-hidden");
      return;
    }
    dialog.value?.close();
    document.body.classList.remove("overflow-hidden");
  },
);

const hideModal = () => {
  emit("update:modalState", "hide");
  emit("hideModal", "hide");
  useModalActions().resetAllProperties();
};
</script>

<style scoped>
dialog {
  max-width: 100vw;
  border: 0;
}

dialog::backdrop {
  background-color: var(--color-accent-normal);
  opacity: 0.3;
}

dialog:focus {
  outline: none;
}
</style>
