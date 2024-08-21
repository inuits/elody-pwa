<template>
  <dialog
    ref="dialog"
    @close="hideModal"
    :class="[
      {
        'grid grid-rows-[max-content_1fr]': getModalInfo(props.modalType).open,
      },
      modalStyle,
    ]"
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
import { ref, computed, watch } from "vue";
import type { TypeModals } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";

const props = withDefaults(
  defineProps<{
    modalType: TypeModals;
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

const { currentModalStyle, getModalInfo } = useBaseModal();
const dialog = ref<HTMLDialogElement>();
const modalStyle = computed(() => modalStyles[currentModalStyle.value]);

const modalStyles: { [key: string]: string } = {
  right: `w-2/5 h-screen max-h-screen mr-0 my-0`,
  rightWide: `w-10/12 h-screen max-h-screen mr-0 my-0`,
  center: `w-1/2 ${props.modalHeightStyle}`,
  centerWide: `w-10/12 max-h-screen`,
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
  }
);

const hideModal = () => {
  emit("update:modalState", "hide");
  emit("hideModal", "hide");
};
</script>

<style scoped>
dialog {
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
