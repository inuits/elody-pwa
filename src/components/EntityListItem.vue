<template>
  <li
    class="
    flex justify-between	px-8 py-4 bg-neutral-0 hover:bg-neutral-10 border border-neutral-30 mb-2 rounded cursor-pointer transition-colors duration-300 hover:shadow-sm
    "
    :class="{ 'animate-pulse': loading }"
  >
    <div class="flex flex-col">
      <span
        class="rounded font-base text-xs"
        :class="{
          'bg-neutral-20 text-neutral-20': loading,
          'text-neutral-60': !loading,
        }"
      >
        Asset name
      </span>
      <span
        class="mt-0.5 rounded font-base text-sm"
        :class="{
          'bg-neutral-20 text-neutral-20': loading,
          'text-neutral-700': !loading,
        }"
      >
        {{ title }}
      </span>
    </div>
    <div class="flex flex-row">
      <BaseButton
        :loading="loading"
        :icon="IncludedIcons.Download"
        label="Download asset"
      />
      <BaseButton :loading="loading" class="ml-2" :icon="IncludedIcons.Eye" />
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import BaseButton from "./base/BaseButton.vue"
import { IncludedIcons } from "./../main"

export default defineComponent({
  name: "EntityListItem",
  components: {
    BaseButton,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  setup: () => {
    return {
      IncludedIcons,
    }
  },
})
</script>
