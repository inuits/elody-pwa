<template>
  <div
    class="flex items-center gap-2 px-3 min-h-(--control-height) rounded-pill border border-border-default bg-surface text-text-muted hover:border-input-border-hover has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-(length:--focus-ring-width) has-[input:focus-visible]:outline-(color:--color-focus-ring) has-[input:focus-visible]:outline-offset-(length:--focus-ring-offset)"
  >
    <!-- the pill carries the focus ring (as the filter input box, L22) -->
    <unicon
      :name="Unicons.SearchGlass.name"
      height="14"
      aria-hidden="true"
      class="shrink-0"
    />
    <input
      v-model="model"
      type="text"
      :aria-label="label"
      :placeholder="placeholder"
      :autofocus="autofocus"
      class="w-full min-w-0 p-0 border-0 bg-transparent text-input text-text-body placeholder:text-text-placeholder focus:ring-0 focus-visible:!outline-none"
    />
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";

defineProps<{ label: string; placeholder?: string; autofocus?: boolean }>();
const model = defineModel<string>({ default: "" });
</script>
