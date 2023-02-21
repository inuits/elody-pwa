<template>
  <div class="p-3 h-full">
    <dropzone />
  </div>
</template>
<script lang="ts">
import Dropzone from "./Dropzone.vue";
import useDropzoneHelper from "../composables/useDropzoneHelper";
import { defineComponent, watch } from "vue";
import { uploadModalState } from "@/composables/useUploadModal";

const { clearDropzoneErrorMessages, clearDropzoneCounters } =
  useDropzoneHelper();

export default defineComponent({
  name: "UploadModalImport",
  components: {
    Dropzone,
  },
  props: {
    hasDropzone: Boolean,
  },
  setup() {
    watch(
      () => uploadModalState.value.state,
      () => {
        clearDropzoneCounters();
        clearDropzoneErrorMessages();
      }
    );

    return {};
  },
});
</script>
