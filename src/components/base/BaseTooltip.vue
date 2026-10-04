<template>
  <div class="">
    <div ref="activatorSlotRef" class="min-w-0">
      <slot
        name="activator"
        :on="{
          mouseenter: show,
          mouseleave: hide,
          focusin: show,
          focusout: hide,
          keydown: hideOnEscape,
        }"
        :described-by="tooltipId"
      ></slot>
    </div>

    <Transition>
      <Teleport
        :to="someModalIsOpened ? modalTeleportTarget() : 'body'"
        v-if="hasContent && hover"
      >
        <div
          ref="defaultSlotRef"
          v-if="hasContent && hover"
          :id="tooltipId"
          role="tooltip"
          class="shadow-overlay rounded-button bg-surface-inverted text-neutral-white text-label px-2 py-1 z-tooltip"
          :style="{ maxWidth: maxWidth, ...floatingStyles }"
        >
          <slot> </slot>
        </div>
      </Teleport>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useSlots, VNode } from "vue";
import {
  offset,
  useFloating,
  type Placement,
  autoPlacement,
} from "@floating-ui/vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { modalTeleportTarget } from "@/composables/useModalTeleportTarget";

const {
  position = "top-end",
  tooltipOffset = 0,
  maxWidth = "14rem",
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

// Design system: inverted surface, shown after 300ms on hover and on focus,
// dismissed on Escape; never interactive content.
const SHOW_DELAY_MS = 300;
const tooltipId = `tooltip-${useId()}`;
let showTimer: ReturnType<typeof setTimeout> | undefined;

const clearShowTimer = () => {
  if (showTimer) clearTimeout(showTimer);
  showTimer = undefined;
};

const show = () => {
  clearShowTimer();
  showTimer = setTimeout(() => {
    hover.value = true;
  }, SHOW_DELAY_MS);
};

const hide = () => {
  clearShowTimer();
  hover.value = false;
};

const hideOnEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") hide();
};

onBeforeUnmount(clearShowTimer);
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
