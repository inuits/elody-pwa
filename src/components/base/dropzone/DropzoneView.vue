<template>
  <!-- The zone is focusable and Enter opens the file dialog; dropzone.js
       binds the click itself (upload.md). -->
  <div
    ref="dropzoneView"
    role="button"
    tabindex="0"
    :aria-label="$t('upload.zone-label')"
    class="dropzone-zone"
    :class="[
      { 'flex justify-center items-center': fileCount === 0 },
      style,
    ]"
    @keydown.enter.prevent="dropzoneView?.click()"
  >
    <div v-show="fileCount === 0" class="text-center inline-block">
      <div class="dz-message" data-dz-message>
        <div class="text-body">
          {{ $t(dropzoneLabel) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const dropzoneView = ref<HTMLDivElement>();

withDefaults(
  defineProps<{
    modelValue: HTMLDivElement | undefined;
    dropzoneLabel: string;
    isValidation: boolean;
    fileCount: number;
    style: string;
  }>(),
  {
    style: "",
    isValidation: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(() => {
  emit("update:modelValue", dropzoneView.value);
});
</script>

<style scoped>
/* Dashed 2px on the dashed-border token, 8px radius, pale surface. */
.dropzone-zone {
  width: 100%;
  height: 100%;
  border: 2px dashed var(--color-border-dashed);
  border-radius: var(--radius-card);
  background-color: var(--color-surface-muted);
}

.dropzone-zone:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}
</style>
