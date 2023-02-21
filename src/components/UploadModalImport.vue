<template>
  <div class="flex flex-col w-full my-2 p-5 flex-grow">
    <div class="bg-neutral-0 mb-4 rounded py-5 pl-5 h-full">
      <folder-tree :directories="directories" />
    </div>
  </div>
  <div class="w-full flex flex-col sticky bottom-0 p-5 bg-neutral-30 z-10">
    <BaseButton
      bg-color="blue-400"
      txt-color="neutral-0"
      :label="$t('upload.import')"
      bg-hover-color="blue-100"
      @click="doImport()"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, provide, ref } from "vue";
import type { Ref, PropType } from "vue";
import FolderTree from "./FolderTree.vue";
import BaseButton from "./base/BaseButton.vue";
import { useMutation } from "@vue/apollo-composable";
import { PostStartImportDocument } from "../generated-types/queries";
import type { Directory } from "../generated-types/queries";
import useUploadModal from "@/composables/useUploadModal";

export default defineComponent({
  name: "UploadModalImport",
  components: {
    FolderTree,
    BaseButton,
  },
  props: {
    directories: {
      type: Array as PropType<Directory[]>,
      required: true,
      default: () => [],
    },
    hasDropzone: Boolean,
  },
  setup() {
    const { mutate } = useMutation(PostStartImportDocument);
    const selectedDirectory = ref<Directory | undefined>();
    const uploadModal = useUploadModal();

    const updateSelectedDirectory = (directory: Directory) => {
      selectedDirectory.value = directory;
    };

    provide<(directory: Directory) => void>(
      "updateSelectedDirectory",
      updateSelectedDirectory
    );

    provide<Ref<Directory | undefined>>("selectedDirectory", selectedDirectory);

    const doImport = () => {
      if (selectedDirectory.value && selectedDirectory.value.id) {
        mutate({
          folder: selectedDirectory.value.id,
        });
        uploadModal.closeUploadModal();
      }
    };

    return {
      doImport,
    };
  },
});
</script>
