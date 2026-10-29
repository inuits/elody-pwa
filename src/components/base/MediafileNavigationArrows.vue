<template>
  <div class="flex items-center gap-2">
    <button
      class="pointer-events-auto"
      data-testid="nav-prev-mediafile"
      @click="$emit('previous')"
    >
      <unicon
        :name="Unicons.ArrowCircleLeft.name"
        height="20"
        class="text-neutral-700 cursor-pointer"
      />
    </button>
    <button
      class="pointer-events-auto"
      data-testid="nav-next-mediafile"
      @click="$emit('next')"
    >
      <unicon
        :name="Unicons.ArrowCircleRight.name"
        height="20"
        class="text-neutral-700 cursor-pointer"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";

defineEmits<{
  (event: "previous"): void;
  (event: "next"): void;
}>();
</script>
