<template>
  <div
    ref="dropzoneView"
    :class="[
      'bg-background-light w-full h-full border-dashed border-[3px] border-text-light rounded-xl',
      { 'flex justify-center items-center': fileCount === 0 },
      style,
    ]"
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

const props = withDefaults(
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

<style></style>
