<template>
  <BaseButton
    bg-color="blue-50"
    bg-hover-color="blue-75"
    :icon="Unicons.EllipsisV.name"
    txt-color="blue-300"
    class="disabled:cursor-not-allowed disabled:opacity-50 w-10"
    @click="toggleContextMenu"
  />
  <div
    v-if="isDisplayingContextMenu"
    class="absolute top-40 left-76 z-10 mt-2 w-56 origin-top-right bg-neutral-0 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1"
  >
    <div role="none">
      <a
        @click="open()"
        :class="
          initialFilters.every((e) => {
            return e.isActive === false;
          })
            ? 'opacity-40 cursor-default'
            : 'hover:bg-neutral-50 cursor-pointer'
        "
        class="text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
        role="menuitem"
        tabindex="-1"
        id="menu-item-add"
      >
        <plus-circle-icon />
        {{ $t("saved-searches.new") }}
      </a>
      <a
        :class="
          !pickedSavedSearch
            ? 'opacity-40 cursor-default'
            : 'hover:bg-neutral-50 cursor-pointer'
        "
        class="text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
        role="menuitem"
        tabindex="-1"
        id="menu-item-add"
      >
        <BaseIcon class="w-6 h-6 cursor-pointer" :name="Unicons.Edit.name" />
        Edit label
      </a>
      <a
        @click="showConfirmation"
        :class="
          !pickedSavedSearch
            ? 'opacity-40 cursor-default'
            : 'hover:bg-neutral-50 cursor-pointer'
        "
        class="text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
        role="menuitem"
        tabindex="-1"
        id="menu-item-add"
      >
        <BaseIcon class="w-6 h-6 cursor-pointer" :name="Unicons.Trash.name" />
        Delete
      </a>

      <hr class="border-t-1 border-neutral-50" />

      <a
        v-for="(savedSearch, index) in savedSearches.slice(0, 5)"
        @click="pick(savedSearch)"
        :key="index"
        :class="
          pickedSavedSearch && pickedSavedSearch._key === savedSearch._key
            ? 'text-neutral-900 bg-blue-50'
            : ''
        "
        class="hover:bg-neutral-50 cursor-pointer pl-5 text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
        role="menuitem"
        tabindex="-1"
        :id="`menu-item-${item}`"
      >
        {{ savedSearch.metadata[0].value }}
      </a>

      <hr class="border-t-1 border-neutral-50" />

      <a
        class="hover:bg-neutral-50 cursor-pointer text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
        role="menuitem"
        tabindex="-1"
        id="menu-item-add"
      >
        <BaseIcon
          class="w-6 h-6 cursor-pointer"
          :name="Unicons.SearchGlass.name"
        />
        All filters
      </a>
    </div>
  </div>

  <ConfirmationModal
    v-show="confirmState === 'show'"
    v-model:confirmState="confirmState"
    :function="deleteSavedSearch"
  />

  <create-saved-search-modal
    @refetchSavedSearches="refetchSavedSearches"
    :initialFilters="initialFilters"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import BaseButton from "../components/base/BaseButton.vue";
import { Unicons } from "@/types";
import PlusCircleIcon from "../components/base/PlusCircleIcon.vue";
import { useMutation } from "@vue/apollo-composable";
import { SavedSearchesDocument, DeleteSavedSearchDocument } from "@/queries";
import type {
  SavedSearchesMutation,
  DeleteSavedSearchMutation,
} from "@/queries";
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";
import CreateSavedSearchModal from "@/components/CreateSavedSearchModal.vue";
import { FilterInList } from "@/composables/useFilterHelper";
import BaseIcon from "@/components/base/BaseIcon.vue";
import ConfirmationModal from "@/components/base/ConfirmationModal.vue";

const props = withDefaults(
  defineProps<{
    initialFilters: FilterInList[];
  }>(),
  {
    initialFilters: () => {
      return [];
    },
  }
);

const {
  openCreateModal,
  toggleContextMenu,
  isDisplayingContextMenu,
  pickedSavedSearch,
  savedSearches,
} = useSavedSearchHelper();

const { mutate, onDone } = useMutation<SavedSearchesMutation>(
  SavedSearchesDocument
);
const { mutate: deleteSavedSearchMutate, onDone: onDoneDelete } =
  useMutation<DeleteSavedSearchMutation>(DeleteSavedSearchDocument);

mutate();

onDone((result: any) => {
  savedSearches.value = result.data.savedSearches.results;
});

const refetchSavedSearches = () => {
  mutate();
};

const open = () => {
  if (
    !props.initialFilters.every((e) => {
      return e.isActive === false;
    })
  ) {
    openCreateModal();
  }
};

const deleteSavedSearch = async () => {
  deleteSavedSearchMutate({ uuid: pickedSavedSearch.value._key });
  onDoneDelete(() => {
    pickedSavedSearch.value = undefined;
    mutate();
  });
};
const confirmState = ref<"hidden" | "show">("hidden");

const showConfirmation = () => {
  confirmState.value = confirmState.value === "show" ? "hidden" : "show";
};

const pick = (savedSearch: any) => {
  pickedSavedSearch.value = savedSearch;
  isDisplayingContextMenu.value = false;
};
</script>
