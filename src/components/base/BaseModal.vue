<template>
  <dialog
    ref="dialog"
    @close="hideModal"
    :class="`${modalStyles[getModalInfo(modalType).modalPosition]}`"
  >
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
import { ref, onMounted, onUnmounted } from "vue";
import type { TypeModals } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import ClickEvent = JQuery.ClickEvent;

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

const dialog = ref<HTMLDialogElement>();
const cancelButtonAvailabe = ref<boolean>(props.cancelButtonAvailabe);
const { setModalElement, getModalInfo } = useBaseModal();

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
  right: "w-2/5 h-screen absolute mr-0 my-0",
  center: "t-[40vh] w-1/4",
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

const hideModal = () => {
  emit("update:modalState", "hide");
  emit("hideModal", "hide");
};
</script>

<style scoped>
dialog {
  z-index: 100;
}

dialog::backdrop {
  background-color: theme("colors.accent.normal");
  opacity: 0.3;
}
</style>
