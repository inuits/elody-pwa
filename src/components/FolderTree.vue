<template>
  <div v-for="directory in directories" :key="`key-${directory.id}`">
    <folder-tree-line
      v-if="directories && directory && directory.parent === '/'"
      :directory="directory"
      :dictionary="directories"
      :default-open="false"
    />
  </div>
</template>
<script lang="ts">
import type { Directory } from "../queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import FolderTreeLine from "./FolderTreeLine.vue";

export default defineComponent({
  name: "FolderTree",
  components: {
    FolderTreeLine,
  },
  props: {
    directories: {
      type: Array as PropType<Directory[]>,
      required: true,
      default: () => [],
    },
  },
  setup() {},
});
</script>
