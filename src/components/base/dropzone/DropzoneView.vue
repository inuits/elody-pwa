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
          {{ $t(dropzoneLabel) }}
        </span>
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
    dropzoneHelper: object;
    dropzoneLabel: string;
    fileCount: number;
    style: string;
  }>(),
  {
    style: "",
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
