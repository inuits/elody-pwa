<template>
  <div
    v-show="modalState === ModalState.Show || modalState === ModalState.Loading"
    class="fixed overflow-y-auto"
    :class="{
      'inset-0': modalPosition === 'center',
      'z-10': modalPosition === 'left',
      'left-24 right-0 inset-y-0': modalPosition !== 'center',
      'z-50': modalPosition !== 'left',
    }"
  >
    <div
      :class="{
        'flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0':
          modalPosition === 'center',
      }"
    >
      <div
        class="fixed backdrop-blur-sm frosted-background"
        :class="
          modalPosition === 'left' ? 'left-24 right-0 inset-y-0' : 'inset-0'
        "
        aria-hidden="true"
        @click="hideModal"
      ></div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="inline-block align-bottom bg-neutral-0 text-left overflow-hidden shadow-xl transform transition-all sm:w-11/12"
        :class="{
          'rounded-lg sm:align-middle sm:my-8': modalPosition === 'center',
          'h-screen sm:align-top sm:m-0': modalPosition !== 'center',
          'float-right': modalPosition === 'right',
          'sm:max-w-4xl': !large,
          'h-screen-90': large && modalPosition === 'center',
          'overflow-y-scroll': scroll,
        }"
      >
        <div class="bg-neutral-0 h-full">
          <div class="sm:flex sm:items-start h-full">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ModalState } from "@/composables/modalFactory";
import { toRefs, watch } from "vue";


export type ModalPosition = "center" | "left" | "right";

const props = withDefaults(
  defineProps<{
    modalState: ModalState;
    modalPosition?: ModalPosition;
    large: boolean;
    scroll: boolean;
  }>(),
  {
    modalState: ModalState.Hide,
    modelPostion: "center",
    large: false,
    scroll: false,
  }
);

const emit = defineEmits(["update:modalState", "hideModal"]);

const hideModal: () => void = () => {
  emit("update:modalState", "hide");
  emit("hideModal", "hide");
};

const { modalState } = toRefs(props);

watch(modalState, (value: ModalState) => {
  if (value == ModalState.Show|| value == ModalState.Loading) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
});
</script>

<style scoped>
.h-screen-90 {
  height: 90vh;
}

.frosted-background {
  background-color: var(--color-background-frosted);
}
</style>
