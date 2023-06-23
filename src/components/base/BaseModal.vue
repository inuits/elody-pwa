<template>
  <div
    v-show="modalState === ModalState.Show || modalState === ModalState.Loading"
    class="fixed h-full z-50"
    :class="[
      `${modalWidthStyle}`,
      {
        'inset-y-0 left-24': modalPosition === 'left',
        'inset-0 mx-auto': modalPosition === 'center',
        'inset-y-0 right-0': modalPosition === 'right',
      },
    ]"
  >
    <div>
      <div
        class="fixed backdrop-blur-sm bg-background-frosted"
        :class="
          modalPosition === 'left' ? 'left-24 right-0 inset-y-0' : 'inset-0'
        "
        aria-hidden="true"
        @click="hideModal"
      ></div>
      <div class="w-full transform" :class="modalHeight">
        <div class="bg-neutral-lightest" :class="modalHeight">
          <div :class="modalHeight">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, watch } from "vue";
import { ModalState } from "@/generated-types/queries";
export type ModalPosition = "center" | "left" | "right";

const props = withDefaults(
  defineProps<{
    modalState: ModalState;
    modalPosition: ModalPosition;
    modalWidthStyle: string;
    modalHeightStyle?: string;
  }>(),
  {
    modalHeightStyle: "h-[75vh] my-[12.5vh]",
  }
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const hideModal: () => void = () => {
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
