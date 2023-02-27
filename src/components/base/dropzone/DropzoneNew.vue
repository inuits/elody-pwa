<template>
  <dropzone-view
    v-model="dropzoneView"
    :file-count="fileCount"
    :style="viewStyle"
  />
  <dropzone-preview v-model="dropzonePreview" />
</template>

<script lang="ts" setup>
import type { DropzoneFile } from "dropzone";
import DropzonePreview from "@/components/base/dropzone/DropzonePreview.vue";
import DropzoneView from "@/components/base/dropzone/DropzoneView.vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import { onMounted, ref } from "vue";

const { initDropzone } = useDropzoneHelper();
const dropzoneView = ref<HTMLDivElement>();
const dropzonePreview = ref<HTMLDivElement>();
const filesInDropzone = ref<DropzoneFile[]>([]);
const fileCount = ref<number>(0);

withDefaults(
  defineProps<{
    viewStyle: string;
  }>(),
  {
    viewStyle: "",
  }
);

const emit = defineEmits<{
  (event: "updateFilesInDropzone", filesInDropzone: DropzoneFile[]): void;
}>();

onMounted(() => {
  const dropzone = initDropzone(dropzoneView.value!, dropzonePreview.value!);

  dropzone.on("addedfile", () => dropzoneEventHandler());
  dropzone.on("removedfile", () => dropzoneEventHandler());

  const dropzoneEventHandler = () => {
    filesInDropzone.value = dropzone.files;
    fileCount.value = dropzone.files.length;

    emit("updateFilesInDropzone", filesInDropzone.value);
  };
});
</script>

<style></style>
