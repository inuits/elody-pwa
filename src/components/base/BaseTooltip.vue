<template>
  <div>
    <div ref="activatorSlotRef" class="min-w-0">
      <slot
        name="activator"
        :on="{
          mouseenter: handlePointerEnter,
          mouseleave: hide,
          focusin: handleFocus,
          focusout: hide,
        }"
      ></slot>
    </div>

    <!--
      Teleport carries the v-if on its own; a <Transition> around a <Teleport>
      leaves the teleported node stuck in <body> with its leave classes applied,
      so the fade-in is a plain CSS animation and the removal is immediate.
    -->
    <Teleport
      :to="someModalIsOpened ? '.base-modal--opened' : 'body'"
      v-if="hasContent && visible"
    >
      <div
        ref="defaultSlotRef"
        :id="tooltipId"
        role="tooltip"
        class="base-tooltip z-tooltip"
        :style="{ maxWidth: maxWidth, ...floatingStyles }"
      >
        <slot> </slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useId,
  useSlots,
  watch,
  VNode,
} from "vue";
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
  maxWidth = "14rem",
  enableAutoPlacement = true,
} = defineProps<{
  position?: Placement;
  tooltipOffset?: number;
  maxWidth?: number | string;
  enableAutoPlacement?: boolean;
}>();

/** Supplementary info only: the tooltip never carries required information. */
const visible = ref(false);
const tooltipId = `base-tooltip-${useId()}`;

/** Pointer waits 300ms; keyboard focus shows at once (WCAG 1.4.13). */
const POINTER_DELAY_MS = 300;
let showTimeout: ReturnType<typeof setTimeout> | undefined;

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
  open: visible,
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

const clearShowTimeout = () => {
  if (showTimeout) clearTimeout(showTimeout);
  showTimeout = undefined;
};

const show = () => {
  visible.value = true;
};

const hide = () => {
  clearShowTimeout();
  visible.value = false;
};

const handlePointerEnter = () => {
  clearShowTimeout();
  showTimeout = setTimeout(show, POINTER_DELAY_MS);
};

const handleFocus = () => {
  clearShowTimeout();
  show();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") hide();
};

/**
 * The 23 call sites bind only `v-on="on"`, so the description is linked from
 * here: onto the activator's focusable descendant when there is one, else the
 * wrapper itself.
 */
const describedElement = (): HTMLElement | null => {
  const wrapper = activatorSlotRef.value;
  if (!wrapper) return null;
  return (
    wrapper.querySelector<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) ?? wrapper
  );
};

watch(visible, (isVisible) => {
  const element = describedElement();
  if (!element) return;

  if (isVisible) {
    element.setAttribute("aria-describedby", tooltipId);
    document.addEventListener("keydown", handleKeydown);
  } else {
    element.removeAttribute("aria-describedby");
    document.removeEventListener("keydown", handleKeydown);
  }
});

onBeforeUnmount(() => {
  clearShowTimeout();
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.base-tooltip {
  background-color: var(--color-surface-inverted);
  color: var(--color-text-on-inverted);
  font-size: var(--text-label);
  line-height: 1.35;
  border-radius: var(--radius-button);
  padding: var(--spacing-ds-4) var(--spacing-ds-6);
  box-shadow: var(--shadow-overlay);
  /* Supplementary only — the tooltip is never a hover target of its own. */
  pointer-events: none;
  animation: base-tooltip-in var(--transition-duration-ui) var(--ease-ui);
}

@keyframes base-tooltip-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
