<template>
  <div v-for="directory in data?.Directories" :key="directory.id">
    <folder-tree-line
      v-if="data?.Directories && directory && directory.parent === '/'"
      :directory="directory"
      :dictionary="data?.Directories"
      :default-open="false"
    />
  </div>
</template>
<script lang="ts">
import type { Directory } from "@/queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import FolderTreeLine from "./FolderTreeLine.vue";

export default defineComponent({
  name: "FolderTree",
  components: {
    FolderTreeLine,
  },
  props: {
    data: {
      type: Array as PropType<Directory[]>,
      required: true,
      default: () => [],
    },
  },
  setup() {},
});
</script>
