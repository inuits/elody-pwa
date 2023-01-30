<template>
  <ul
    v-if="directory"
    class="border-neutral-700"
    :class="{
      'border-l': depth !== 0,
      'ml-8': depth > 1,
    }"
  >
    <li
      data-test="li-tree"
      :data-test-depth="`depth-${depth}`"
      class="text-neutral-700 font-bold flex items-center relative flex-grow justify-between border-neutral-50 hover:border-blue-500 border-r-4"
      :class="{
        'bg-blue-75':
          selectedDirectory && selectedDirectory.id === directory.id,
      }"
    >
      <div
        class="py-4 flex items-center flex-grow mr-10 group cursor-pointer"
        @click="updateSelectedDirectory && updateSelectedDirectory(directory)"
      >
        <span
          class="inline-block h-1px bg-neutral-700 group=hover:bg-blue-500"
          :class="{ 'line-width': depth !== 0 }"
        />
        <span
          class="rounded-full bg-neutral-700 circle inline-block mr-4 -ml-1 z-10 group-hover:bg-blue-500"
        />
        <span
          v-show="open && depth !== 0"
          class="absolute w-1px h-3/6 bg-neutral-700 left-8 top-2/4 group-hover:bg-blue-500"
        />
        <span class="inline-block mr-3 group-hover:text-blue-500"
          >{{ directory.dir }}
        </span>
      </div>
      <div
        class="flex-grow-0"
        :class="{ 'w-11': !hasSubDirectories() }"
        @click="toggle"
      >
        <a
          v-if="hasSubDirectories()"
          class="inline-block cursor-pointer transform duration-200 px-4 w-11 h-full"
          :class="{
            'rotate-0': open,
            'rotate-180': !open,
          }"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0.707107 5.70711C0.316582 5.31658 0.316582 4.68342 0.707107 4.29289L4.24264 0.757359C4.63316 0.366835 5.26633 0.366835 5.65685 0.757359L9.19239 4.29289C9.58291 4.68342 9.58291 5.31658 9.19239 5.70711C8.80186 6.09763 8.1687 6.09763 7.77817 5.70711L4.94975 2.87868L2.12132 5.70711C1.7308 6.09763 1.09763 6.09763 0.707107 5.70711Z"
              fill="#19265C"
            />
          </svg>
        </a>
      </div>
    </li>
    <loading-list v-if="loading" />
    <contractor-tree-line
      v-for="(subDirectory, index) in subDirectories"
      v-show="open"
      :key="subDirectory.id ? subDirectory.id : 'no-key'"
      :directory="subDirectory"
      :dictionary="dictionary"
      :default-open="false"
      :depth="depth + 1"
      :parent-id="subDirectory.id ? subDirectory.id : undefined"
      :class="{
        '-mt-0': index === 0,
        'last-ul': index === subDirectories.length - 1,
      }"
    />
  </ul>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import type { PropType } from "vue";
import { GetDirectoriesDocument } from "@/generated-types/queries";
import type { Directory } from "@/generated-types/queries";

import { useQuery } from "@vue/apollo-composable";
import LoadingList from "@/components/base/LoadingList.vue";

export default defineComponent({
  name: "ContractorTreeLine",
  components: { LoadingList },
  props: {
    directory: {
      //Current directory
      type: Object as PropType<Directory>,
      required: true,
    },
    dictionary: {
      //All directories
      type: Object as PropType<Directory[]>,
      required: true,
      default: () => {},
    },
    defaultOpen: {
      type: Boolean,
      required: true,
    },
    depth: {
      type: Number,
      required: false,
      default: 0,
    },
    parentId: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const open = ref<boolean>(props.defaultOpen);
    const fetchEnabled = ref(false);
    const { result, refetch, onResult, loading } = useQuery(
      GetDirectoriesDocument,
      { dir: `${props.directory.id}/` },
      () => ({
        enabled: fetchEnabled.value,
      })
    );
    const subDirectories = ref<Directory[]>([]);

    onResult((value) => {
      if (value.data) {
        subDirectories.value = value.data.Directories as Directory[];
      }
    });

    const hasSubDirectories = () => props.directory.has_subdirs;

    const toggle = () => {
      if (open.value) {
        open.value = !open.value;
      } else if (hasSubDirectories()) {
        open.value = !open.value;
        if (!fetchEnabled.value) fetchEnabled.value = true;
        else refetch({ dir: `${props.directory.id}/` });
      }
    };

    const updateSelectedDirectory = inject<
      (contractor: Directory) => void | undefined
    >("updateSelectedDirectory");

    const selectedDirectory = inject<Directory | undefined>(
      "selectedDirectory"
    );

    return {
      open,
      toggle,
      hasSubDirectories,
      updateSelectedDirectory,
      selectedDirectory,
      result,
      subDirectories,
      loading,
    };
  },
});
</script>

<style scoped>
.h-1px {
  height: 1px;
}

.w-1px {
  width: 1px;
}

.last-ul li {
  position: relative;
}

.last-ul {
  border-left: 0;
}

.last-ul > li:before {
  content: "";
  border-left: 1px solid #253858;
  position: absolute;
  height: 50%;
  top: 0;
  left: 0px;
}

.last-ul > li:after {
  content: "";
  border-left: 1px solid #253858;
  position: absolute;
  height: 2rem;
  top: -2rem;
  left: 0px;
}

.circle {
  width: 10px;
  flex-basis: 10px;
  height: 10px;
  flex-grow: 0;
  flex-shrink: 0;
}

.line-width {
  flex-basis: 2rem;
  flex-grow: 0;
  flex-shrink: 0;
}

.hover-effect:hover {
  position: relative;
}
.hover-effect:hover:before {
  background-color: red;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  content: "";
  position: absolute;
}
</style>
