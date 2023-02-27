<template>
  <div
    ref="dropzoneView"
    class="bg-neutral-white w-full inline-block border-dashed border-[3px] border-text-light rounded-xl"
    :class="[
      fileCount === 0 ? 'flex justify-center items-center cursor-pointer' : '',
      `${style}`,
    ]"
  >
    <div v-show="fileCount === 0" class="inline-block w-9/12 text-center">
      <div class="dz-message" data-dz-message>
        <span class="text-body">
          {{ $t("dropzone.drag-add") }}
        </span>
      </div>
    </div>

    <div
      v-if="finishedUploading"
      class="w-full px-5 text-left border-4 border-neutral-500 py-5 rounded-md"
    >
      <div class="flex justify-between">
        <div class="text-lg text-center pb-8 text-red-dark">
          {{ failed }} {{ $t("dropzone.failed") }}
        </div>
        <div class="text-lg text-center pb-8 text-green-default">
          {{ success }} {{ $t("dropzone.success") }}
        </div>
      </div>
      <div
        class="text-red-dark truncate"
        v-for="errorMessage in errorMessages"
        :key="errorMessage.toString()"
      >
        - {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import { onMounted, ref } from "vue";

const { finishedUploading, success, failed, errorMessages } =
  useDropzoneHelper();
const dropzoneView = ref<HTMLDivElement>();

withDefaults(
  defineProps<{
    modelValue: HTMLDivElement | undefined;
    fileCount: number;
    style: string;
  }>(),
  {
    style: "",
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(() => {
  emit("update:modelValue", dropzoneView.value);
});
</script>

<style></style>
