<template>
  <div class="p-3 h-full">
    <dropzone />
  </div>
</template>

<script lang="ts" setup>
import Dropzone from "./Dropzone.vue";
import useDropzoneHelper from "../composables/useDropzoneHelper";
import { uploadModalState } from "@/composables/useUploadModal";
import { watch } from "vue";

const { clearDropzoneErrorMessages, clearDropzoneCounters } =
  useDropzoneHelper();

watch(
  () => uploadModalState.value.state,
  () => {
    clearDropzoneCounters();
    clearDropzoneErrorMessages();
  }
);
</script>
