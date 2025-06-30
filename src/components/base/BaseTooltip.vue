<template>
  <div class="">
    <div ref="activatorSlotRef" class="min-w-0">
      <slot
        name="activator"
        :on="{
          mouseenter: handleMouseOver,
          mouseleave: handleMouseLeave,
        }"
      ></slot>
    </div>

    <Transition>
      <Teleport
        :to="someModalIsOpened ? '.base-modal--opened' : 'body'"
        v-if="hasContent && hover"
      >
        <div
          ref="defaultSlotRef"
          v-if="hasContent && hover"
          :class="`shadow-lg rounded bg-neutral-0 max-w-${maxWidth} p-2 z-[1000]`"
          :style="floatingStyles"
        >
          <slot> </slot>
        </div>
      </Teleport>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, VNode } from "vue";
import {
  offset,
  useFloating,
  type Placement,
  autoPlacement,
} from "@floating-ui/vue";
import { useBaseModal } from "@/composables/useBaseModal";

const {
  position = "top-end",
  tooltipOffset = 0,
  maxWidth = 56,
  enableAutoPlacement = true,
} = defineProps<{
  position: Placement;
  tooltipOffset: number;
  maxWidth?: number | string;
  enableAutoPlacement?: boolean;
}>();
const hover = ref(false);

const defaultSlotRef = ref<HTMLElement | null>(null);
const activatorSlotRef = ref<HTMLElement | null>(null);
const { someModalIsOpened } = useBaseModal();

const slots = useSlots();

const { floatingStyles } = useFloating(activatorSlotRef, defaultSlotRef, {
  placement: position,
  middleware: [
    offset(tooltipOffset),
    ...(enableAutoPlacement
      ? [autoPlacement({ placement: position, autoPlacement: true })]
      : []),
  ],
  open: hover,
});

const hasSlotContent = (slot: any, props = {}) => !isSlotEmpty(slot, props);

const isSlotEmpty = (slot: any, props = {}) => isVNodeEmpty(slot?.(props));

const asArray = (arg: any) =>
  Array.isArray(arg) ? arg : arg != null ? [arg] : [];

const isVNodeEmpty = (parentVNode: VNode[]): boolean =>
  !parentVNode ||
  asArray(parentVNode).every((vNode) => {
    if (vNode.children !== null) {
      if (typeof vNode.children === "string") {
        return vNode.children.trim() === "";
      }

      if (Array.isArray(vNode.children)) {
        return isVNodeEmpty(vNode.children);
      }
    }

    return vNode.type === Comment;
  });

const hasContent = computed(() => {
  return hasSlotContent(slots.default);
});

const handleMouseOver = () => {
  hover.value = true;
};

const handleMouseLeave = () => {
  hover.value = false;
};
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
