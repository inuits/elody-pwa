<template>
  <!-- The tree pattern (hierarchy-tree.md): treeitems with aria-expanded
       and aria-level; the checkbox rule holds one level up — here the title
       selects and the disclosure toggles, on separate buttons. -->
  <ul
    v-if="directory"
    :role="depth === 0 ? 'tree' : 'group'"
    class="folder-tree"
    :class="{
      'folder-tree--nested': depth !== 0,
      'ml-8': depth > 1,
    }"
  >
    <li
      data-test="li-tree"
      :data-test-depth="`depth-${depth}`"
      role="treeitem"
      :aria-level="depth + 1"
      :aria-expanded="hasSubDirectories() ? open : undefined"
      :aria-selected="
        !!(selectedDirectory && selectedDirectory.id === directory.id)
      "
      class="folder-tree__row flex items-center relative grow justify-between"
      :class="{
        'folder-tree__row--selected':
          selectedDirectory && selectedDirectory.id === directory.id,
      }"
    >
      <button
        type="button"
        class="folder-tree__select py-4 flex items-center grow mr-10 group"
        @click="updateSelectedDirectory && updateSelectedDirectory(directory)"
      >
        <span
          class="folder-tree__twig inline-block h-1px"
          :class="{ 'line-width': depth !== 0 }"
        />
        <span
          class="folder-tree__dot rounded-full circle inline-block mr-4 -ml-1 z-10"
        />
        <span
          v-show="open && depth !== 0"
          class="folder-tree__drop absolute w-1px h-3/6 left-8 top-2/4"
        />
        <span class="folder-tree__title inline-block mr-3">
          {{ directory.dir }}
        </span>
      </button>
      <button
        v-if="hasSubDirectories()"
        type="button"
        class="folder-tree__toggle"
        :aria-label="$t(open ? 'tree.collapse' : 'tree.expand')"
        @click="toggle"
      >
        <unicon
          :name="open ? Unicons.AngleUp.name : Unicons.AngleDown.name"
          height="16"
        />
      </button>
      <div v-else class="w-11" />
    </li>
    <loading-list v-if="loading" />
    <contractor-tree-line
      v-for="(subDirectory, index) in subDirectories"
      v-show="open"
      :key="subDirectory.id ? subDirectory.id : 'no-key'"
      :query-for-sub-directories="queryForSubDirectories"
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
import type { Directory } from "@/generated-types/queries";

import { useQuery } from "@vue/apollo-composable";
import LoadingList from "@/components/base/LoadingList.vue";
import { Unicons } from "@/types";

export default defineComponent({
  name: "ContractorTreeLine",
  components: { LoadingList },
  props: {
    queryForSubDirectories: {
      //Current directory
      type: Object,
      required: true,
    },
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
      props.queryForSubDirectories,
      { dir: `${props.directory.id}/` },
      () => ({
        enabled: fetchEnabled.value,
      }),
    );
    const subDirectories = ref<Directory[]>([]);

    onResult((value) => {
      if (value.data) {
        Object.keys(value.data).forEach((key) => {
          subDirectories.value = value.data[key] as Directory[];
        });
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
      "selectedDirectory",
    );

    return {
      Unicons,
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
.folder-tree__row {
  font-weight: 700;
  color: var(--color-text-body);
  border-right: 3px solid transparent;
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.folder-tree__row:hover {
  background-color: var(--color-surface-row-hover);
}

/* Selected = the accent wash, like every selected row in the system. */
.folder-tree__row--selected {
  background-color: var(--color-surface-editable-hover);
}

.folder-tree__select {
  cursor: pointer;
  text-align: left;
  min-width: 0;
}

.folder-tree__select:focus-visible,
.folder-tree__toggle:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
}

.folder-tree__title {
  font-size: var(--text-table);
}

.folder-tree__select:hover .folder-tree__title {
  color: var(--color-text-link-hover);
}

.folder-tree__twig,
.folder-tree__drop {
  background-color: var(--color-border-default);
}

.folder-tree__dot {
  background-color: var(--color-text-secondary);
}

.folder-tree__toggle {
  flex: none;
  width: 44px;
  padding: var(--spacing-ds-4);
  display: inline-flex;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
}

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
  border-left: 1px solid var(--color-border-default);
  position: absolute;
  height: 50%;
  top: 0;
  left: 0px;
}

.last-ul > li:after {
  content: "";
  border-left: 1px solid var(--color-border-default);
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
