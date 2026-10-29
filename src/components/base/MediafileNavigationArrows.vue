<template>
  <div class="flex items-center gap-2">
    <button
      class="pointer-events-auto"
      type="button"
      data-testid="nav-prev-mediafile"
      :aria-label="$t('media-viewer.previous-file')"
      :title="$t('media-viewer.previous-file')"
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
      type="button"
      data-testid="nav-next-mediafile"
      :aria-label="$t('media-viewer.next-file')"
      :title="$t('media-viewer.next-file')"
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
