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
      <p :name="textOff" class="textOf">{{ textOff }}</p>
      <p :name="textOn" class="textOn">{{ textOn }}</p>
    </div>
    <div v-if="label" class="ml-3 text-gray-700 font-medium">{{ label }}</div>
  </label>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: 'TextToggle',
    inheritAttrs: false,
    props: {
      label: { type: String, default: '' },
      checked: { type: Boolean, default: false },
      textOn: { type: String, required: true },
      textOf: { type: String, required: true },
    },
    emits: ['update:checked'],
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
    color: var(--color-main-dark);
  }
  .input:not(.checked) ~ .iconOn,
  .input.checked ~ .iconOff {
    color: var(--color-neutral-700);
  }
  .input.checked ~ .dot {
    transform: translateX(100%);
  }
</style>
