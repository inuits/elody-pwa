<template>
  <div class="p-3 h-full">
    <dropzone />
  </div>
</template>
<script lang="ts">
const { clearDropzoneErrorMessages, clearDropzoneCounters } =
  useDropzoneHelper();
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import { useUploadModal } from "./UploadModal.vue";
import { defineComponent, watch } from "vue";
import Dropzone from "./Dropzone.vue";

export default defineComponent({
  name: "UploadModalImport",
  components: {
    Dropzone,
  },
  props: {
    hasDropzone: Boolean,
  },
  setup() {
    const { uploadModalState } = useUploadModal();

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
