<template>
  <div v-show="modalState === ModalState.Show || modalState === ModalState.Loading"
      class="fixed h-full z-50"
      :class="[
    `${modalWidthStyle}`,
    {
      'inset-y-0 left-80': modalPosition === 'left',
      'inset-0 mx-auto': modalPosition === 'center',
      'inset-y-0 right-0': modalPosition === 'right',
    },
  ]"
  >
    <div>
      <div
          class="fixed backdrop-blur-sm bg-background-frosted"
          :class="
        modalPosition === 'left' ? 'left-80 right-0 inset-y-0' : 'inset-0'
      "
          aria-hidden="true"
          @click="hideModal"
      ></div>
      <div class="w-full transform" :class="[modalHeight, modalColor] ">
        <div :class="modalHeight">
          <div class="flex justify-end p-2">
            <unicon
                :name="Unicons.Close.name"
                :height="iconHeight"
                class="cursor-pointer"
                @click="hideModal"
            />
          </div>
          <slot/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, watch, onMounted, onUnmounted } from "vue";
import { ModalState } from "@/generated-types/queries";
import { Unicons } from "@/types";
export type ModalPosition = "center" | "left" | "right";

const props = withDefaults(
  defineProps<{
    modalState: ModalState;
    modalPosition: ModalPosition;
    modalWidthStyle: string;
    modalHeightStyle?: string;
    iconHeight?: number;
    modalColor?: String;
  }>(),
  {
    modalHeightStyle: "h-[75vh] my-[12.5vh]",
    iconHeight: 18,
    modalColor: "bg-neutral-white"
  }
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const hideOnEscape = (e) => {
  if(e.key === "Escape") hideModal();
}
const keyDownEvent = window.addEventListener('keydown', hideOnEscape)
onMounted(() => keyDownEvent);
onUnmounted(() => keyDownEvent);

const hideModal = () => {
  emit("update:modalState", "hide");
  emit("hideModal", "hide");
};

const { modalState } = toRefs(props);

const modalHeight = computed<string>(() =>
  props.modalPosition === "center" ? props.modalHeightStyle : "h-screen"
);

watch(modalState, (value: ModalState) => {
  if (value == ModalState.Show || value == ModalState.Loading)
    document.body.classList.add("overflow-hidden");
  else document.body.classList.remove("overflow-hidden");
});
</script>
