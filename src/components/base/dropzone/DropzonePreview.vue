<template>
  <div class="hidden">
    <div
      ref="dropzonePreview"
      class="dz-file-preview flex border border-neutral-light rounded-md w-full mi-h-28 flex-row items-right mb-2 hover:bg-blue-default10 p-3 relative"
    >
      <div
        class="flex justify-center items-center bg-neutral-light rounded-lg w-10 h-8 mt-1 mr-2"
      >
        <unicon :name="Unicons.Image.name" class="fill-text-body" height="16" />
      </div>

      <div class="dz-filename text-blue text-sm mt-2 ml-6 pr-6 w-full">
        <span
          class="inline-block w-full break-words text-text-body"
          data-dz-name
        ></span>
      </div>

      <a
        data-dz-remove
        class="cursor-pointer flex justify-center items-center bg-neutral-light rounded-lg w-10 h-8 mt-1 mr-2"
      >
        <svg
          width="9"
          height="11"
          viewBox="0 0 7 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3V8H1.5V3H5.5ZM4.75 0H2.25L1.75 0.5H0V1.5H7V0.5H5.25L4.75 0ZM6.5 2H0.5V8C0.5 8.55 0.95 9 1.5 9H5.5C6.05 9 6.5 8.55 6.5 8V2Z"
            class="fill-text-body"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { Unicons } from "@/types";

const dropzonePreview = ref<HTMLDivElement>();

defineProps<{
  modelValue: HTMLDivElement | undefined;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(async () => {
  emit("update:modelValue", dropzonePreview.value);
});
</script>

<style></style>
