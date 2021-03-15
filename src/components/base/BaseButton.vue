<template>
  <button
    class="bg-neutral-20 flex justify-center  p-2.5 rounded  transition-colors duration-300"
    :class="{
      'pl-1.5': label,
      'text-neutral-20': loading,
      'text-neutral-700 hover:bg-neutral-70': !loading,
    }"
  >
    <unicon
      v-if="icon"
      :name="icon"
      height="16"
      :fill="
        loading
          ? tailwindConfig.theme.colors.neutral[20]
          : tailwindConfig.theme.colors.neutral[700]
      "
    />
    <span v-if="label" class="text-sm ml-0.5 leading-4">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { IncludedIcons } from "../../main"
//@ts-ignore
import tailwindConfig from "../../../tailwind.config.js"

export default defineComponent({
  name: "BaseButton",
  props: {
    label: {
      type: String,
      required: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String as PropType<IncludedIcons>,
      required: false,
    },
  },

  setup: () => {
    return {
      tailwindConfig,
    }
  },
})
</script>
