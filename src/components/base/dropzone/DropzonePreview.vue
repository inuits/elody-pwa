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
      <div class="flex justify-between items-center">
        <div class="px-2">
          <!--          <base-progress-step-->
          <!--            v-for="(step, index) in steps"-->
          <!--            :key="index"-->
          <!--            :step-type="step"-->
          <!--          />-->
        </div>
        <a
          data-dz-remove
          class="cursor-pointer flex justify-center items-center bg-neutral-light rounded-lg w-10 h-8 mt-1 mr-2"
        >
          <unicon :name="Unicons.Trash.name" height="14" />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { Unicons } from "@/types";
import useUpload from "@/composables/useUpload";
import BaseProgressStep from "@/components/base/BaseProgressStep.vue";

const dropzonePreview = ref<HTMLDivElement>();

defineProps<{
  modelValue: HTMLDivElement | undefined;
  isValidationFile: boolean;
}>();

const { dryRunStatus } = useUpload();
// const steps = computed((): string[] =>
//   dryRunStatus.value === "loading"
//     ? ["loading"]
//     : dryRunStatus.value === "correctly-verified"
//       ? ["complete"]
//       : [],
// );

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: HTMLDivElement | undefined): void;
}>();

onMounted(async () => {
  emit("update:modelValue", dropzonePreview.value);
});
</script>

<style></style>
