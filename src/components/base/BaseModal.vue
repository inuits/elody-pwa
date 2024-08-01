<template>
  <dialog ref="dialog" @close="hideModal" :class="modalStyle">
    <div class="flex justify-end p-2">
      <unicon
        v-show="!cancelButtonAvailabe"
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
import type { TypeModals } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";

const props = withDefaults(
  defineProps<{
    modalType: TypeModals;
    modalWidthStyle: string;
    modalHeightStyle?: string;
    iconHeight?: number;
    modalColor?: String;
    cancelButtonAvailabe?: boolean;
  }>(),
  {
    modalHeightStyle: "max-h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-neutral-white",
    cancelButtonAvailabe: false,
  }
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const cancelButtonAvailabe = ref<boolean>(props.cancelButtonAvailabe);
const { getModalInfo } = useBaseModal();
const dialog = ref<HTMLDialogElement>();
const modalStyle = computed(
  () => modalStyles[getModalInfo(props.modalType).modalPosition]
);

const modalStyles: { [key: string]: string } = {
  right: `${
    props.modalWidthStyle || "w-2/5"
  } h-screen max-h-screen absolute mr-0 my-0`,
  center: `${props.modalWidthStyle || "w-1/4"} ${props.modalHeightStyle}`,
  left: "",
};

watch(
  () => getModalInfo(props.modalType).open,
  (isModalOpen: boolean) => {
    if (isModalOpen) {
      dialog.value?.showModal();
      return;
    }
    dialog.value?.close();
  }
);

const hideModal = () => {
  emit("update:modalState", "hide");
  emit("hideModal", "hide");
};
</script>

<style scoped>
dialog {
  z-index: 100;
  max-width: 100vw;
  border: 0;
}

dialog::backdrop {
  background-color: theme("colors.accent.normal");
  opacity: 0.3;
}

dialog:focus {
  outline: none;
}
</style>
