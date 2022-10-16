<template>
  <label class="toggle flex items-center cursor-pointer">
    <div class="box">
      <input
        type="checkbox"
        class="input sr-only"
        :class="{ checked }"
        :checked="checked"
        @change="$emit('update:checked', $event.target.checked)"
      />
      <div class="dot"></div>
      <BaseIcon :name="iconOff" class="iconOff" />
      <BaseIcon :name="iconOn" class="iconOn" />
    </div>
    <div v-if="label" class="ml-3 text-gray-700 font-medium">{{ label }}</div>
  </label>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

export default defineComponent({
  name: "IconToggle",
  components: { BaseIcon },
  inheritAttrs: false,
  props: {
    label: { type: String, default: "" },
    checked: { type: Boolean, default: false },
    iconOff: { type: String as PropType<keyof Unicons>, required: true },
    iconOn: { type: String as PropType<keyof Unicons>, required: true },
  },
  emits: ["update:checked"],
});
</script>

<style lang="postcss" scoped>
.box {
  @apply block relative bg-neutral-20 rounded;
}
.iconOn,
.iconOff {
  @apply inline-block relative align-top h-9 p-2;
}
.dot {
  @apply absolute left-1 top-1 bg-neutral-20 w-9 rounded transition;
}
/* :checked doesn't work for whatever reason, as Vue doesn't apply the
     attribute at all */
.input.checked ~ .iconOn,
.input:not(.checked) ~ .iconOff {
  fill: var(--color-main-dark);
}
.input:not(.checked) ~ .iconOn,
.input.checked ~ .iconOff {
  fill: var(--color-neutral-700);
}
.input.checked ~ .dot {
  transform: translateX(100%);
}
</style>
