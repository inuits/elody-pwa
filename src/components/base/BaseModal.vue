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
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
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
    modalHeightStyle: "h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-neutral-white",
    cancelButtonAvailabe: false,
  }
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const cancelButtonAvailabe = ref<boolean>(props.cancelButtonAvailabe);
const { getModalInfo, setModalElement } = useBaseModal();
const dialog = ref<HTMLDialogElement>();
const modalStyle = computed(
  () => modalStyles[getModalInfo(props.modalType).modalPosition]
);

onMounted(() => {
  setModalElement(dialog.value!!, props.modalType);
  dialog.value?.addEventListener("click", (event) => {
    closeDialogOnBackdropClick(event);
  });
});

onUnmounted(() => {
  dialog.value?.removeEventListener("click", (event) =>
    closeDialogOnBackdropClick(event)
  );
});

const modalStyles: { [key: string]: string } = {
  right: `${props.modalWidthStyle || "w-2/5"} ${
    props.modalHeightStyle || "h-screen"
  } absolute mr-0 my-0`,
  center: `t-[40vh] ${props.modalWidthStyle || "w-1/4"}`,
  left: "",
};

const closeDialogOnBackdropClick = (event: MouseEvent) => {
  if (!dialog.value) return;
  const rect = dialog.value.getBoundingClientRect();
  const isInDialog =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width;
  if (isInDialog) return;

  dialog.value.close();
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
  max-height: 100vh;
  max-width: 100vw;
}

dialog::backdrop {
  background-color: theme("colors.accent.normal");
  opacity: 0.3;
}
</style>
