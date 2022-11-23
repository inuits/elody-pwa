<template>
  <BaseButton
    bg-color="blue-50"
    bg-hover-color="blue-75"
    :icon="Unicons.EllipsisV.name"
    txt-color="blue-300"
    class="disabled:cursor-not-allowed disabled:opacity-50 w-10"
    @click="toggleContextMenu"
    id="contextSavedSearches"
  />
  <div
    v-show="isDisplayingContextMenu"
    class="absolute top-40 left-76 z-10 mt-2 w-56 origin-top-right bg-neutral-0 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1"
  >
    <div role="none">
      <a
        @click="updateSelectedSearch()"
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
        <BaseIcon class="w-6 h-6 cursor-pointer" :name="Unicons.Save.name" />
        {{ $t("saved-searches.save-changes") }}
      </a>

      <a
        @click="openCreate()"
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
        @click="openEdit()"
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
        {{ $t("saved-searches.edit-label") }}
      </a>

      <a
        @click="resetSelectedSavedSearch()"
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
        <BaseIcon class="w-6 h-6 cursor-pointer" :name="Unicons.Redo.name" />
        {{ $t("saved-searches.reset") }}
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
        {{ $t("saved-searches.delete") }}
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
        @click="openSearchSavedSearchesModal"
        class="hover:bg-neutral-50 cursor-pointer text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
        role="menuitem"
        tabindex="-1"
        id="menu-item-add"
      >
        <BaseIcon
          class="w-6 h-6 cursor-pointer"
          :name="Unicons.SearchGlass.name"
        />
        {{ $t("saved-searches.all-filters") }}
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
import {
  SavedSearchesDocument,
  DeleteSavedSearchDocument,
  PatchSavedSearchDefinitionDocument,
  GetSavedSearchByIdDocument,
} from "@/queries";
import type {
  SavedSearchesMutation,
  DeleteSavedSearchMutation,
  PatchSavedSearchDefinitionMutation,
  GetSavedSearchByIdMutation,
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

const emit = defineEmits(["removedSelectedSearch"]);

const {
  openEditModal,
  openCreateModal,
  toggleContextMenu,
  isDisplayingContextMenu,
  pickedSavedSearch,
  savedSearches,
  openSearchSavedSearchesModal,
  clearTypename
} = useSavedSearchHelper();

const { mutate, onDone } = useMutation<SavedSearchesMutation>(
  SavedSearchesDocument
);

const { mutate: deleteSavedSearchMutate, onDone: onDoneDelete } =
  useMutation<DeleteSavedSearchMutation>(DeleteSavedSearchDocument);

const {
  mutate: patchSavedSearchDefinitionMutate,
  onDone: onDonePatchDefinition,
} = useMutation<PatchSavedSearchDefinitionMutation>(
  PatchSavedSearchDefinitionDocument
);

const { mutate: getByIdMutate, onDone: onDoneGetById } =
  useMutation<GetSavedSearchByIdMutation>(GetSavedSearchByIdDocument);

mutate();

onDone((result: any) => {
  savedSearches.value = result.data.savedSearches.results;
});

const refetchSavedSearches = () => {
  mutate();
};

const openCreate = () => {
  if (
    !props.initialFilters.every((e) => {
      return e.isActive === false;
    })
  ) {
    openCreateModal();
  }
};

const openEdit = () => {
  if (pickedSavedSearch.value) {
    openEditModal();
  }
};

const deleteSavedSearch = () => {
  deleteSavedSearchMutate({ uuid: pickedSavedSearch.value._key });
  onDoneDelete(() => {
    pickedSavedSearch.value = undefined;
    mutate();
    emit("removedSelectedSearch");
  });
};
const confirmState = ref<"hidden" | "show">("hidden");

const showConfirmation = () => {
  if (pickedSavedSearch.value) {
    confirmState.value = confirmState.value === "show" ? "hidden" : "show";
  }
};

const pick = (savedSearch: any) => {
  pickedSavedSearch.value = savedSearch;
  isDisplayingContextMenu.value = false;
};

const resetSelectedSavedSearch = () => {
  getByIdMutate({ uuid: pickedSavedSearch.value._key });
  onDoneGetById((res) => {
    pick(res.data.getSavedSearchById);
  });
};

const updateSelectedSearch = () => {
  if (pickedSavedSearch.value) {
    var definition = [];
    props.initialFilters.forEach((filter: FilterInList) => {
      if (filter.isActive) {
        clearTypename(filter.input);
        definition.push(filter.input);
      }
    });
    patchSavedSearchDefinitionMutate({
      uuid: pickedSavedSearch.value._key,
      definition: definition,
    });
    onDonePatchDefinition((res: any) => {
      pickedSavedSearch.value = res.data.patchSavedSearchDefinition;
      refetchSavedSearches();
    });
  }
};

window.addEventListener("click", function (e) {
  if (
    !(
      document.getElementById("contextSavedSearches") &&
      document.getElementById("contextSavedSearches").contains(e.target)
    )
  ) {
    isDisplayingContextMenu.value = false;
  }
});
</script>
