<template>
  <button
    :class="[
      `bg-${bgColor} flex justify-center p-2.5 rounded transition-colors duration-300`,
      loading ? `text-${bgColor}` : `text-${txtColor} hover:bg-${bgHoverColor}`,
      label ? `pl-1.5` : ``,
    ]"
  >
    <unicon
      v-if="icon"
      :name="icon"
      height="16"
      :fill="loading ? 'var(--colors-neutral-20)' : 'var(--colors-neutral-700)'"
    />
    <span v-if="label" class="text-sm ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'BaseButton',
    props: {
      label: {
        type: [String],
        required: false,
        default: undefined,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      icon: {
        type: String as PropType<keyof Unicons>,
        required: false,
        default: undefined,
      },
      bgColor: {
        type: String,
        default: 'neutral-20',
      },
      bgHoverColor: {
        type: String,
        default: 'neutral-70',
      },
      txtColor: {
        type: String,
        default: 'neutral-700',
      },
    },
  });
</script>
