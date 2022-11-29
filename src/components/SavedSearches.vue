<template>
  <div
    v-show="
      !loading &&
      auth.isAuthenticated.value === true &&
      determinePermission('read-saved-search')
    "
  >
    <base-context-menu
      extra-class="absolute top-40 left-76 z-10"
      id="context-saved-search"
    >
      <div role="none">
        <a
          @click="updateSelectedSearch()"
          :class="
            isNoChangesOriginal(pickedSavedSearch, initialFilters)
              ? 'opacity-40 cursor-default'
              : 'hover:bg-neutral-50 cursor-pointer'
          "
          class="text-gray-700 block px-4 py-2 text-sm flex items-center gap-2"
          role="menuitem"
          tabindex="-1"
          id="menu-item-add"
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('patch-saved-search')
          "
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
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('create-saved-search')
          "
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
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('patch-saved-search')
          "
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
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('delete-saved-search')
          "
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
          :id="`menu-item-${index}`"
        >
          {{ savedSearch.metadata[0]?.value }}
        </a>

        <hr class="border-t-1 border-neutral-50" />

        <a
          @click="openSearchSavedSearchesModal()"
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
    </base-context-menu>
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
import { Unicons } from "@/types";
import PlusCircleIcon from "../components/base/PlusCircleIcon.vue";
import { useMutation } from "@vue/apollo-composable";
import {
  SavedSearchesDocument,
  DeleteSavedSearchDocument,
  PatchSavedSearchDefinitionDocument,
  GetSavedSearchByIdDocument,
  type Definition,
  type Maybe,
} from "@/queries";
import type {
  SavedSearchesMutation,
  DeleteSavedSearchMutation,
  PatchSavedSearchDefinitionMutation,
  GetSavedSearchByIdMutation,
} from "@/queries";
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";
import CreateSavedSearchModal from "@/components/CreateSavedSearchModal.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import ConfirmationModal from "@/components/base/ConfirmationModal.vue";
import BaseContextMenu from "./base/BaseContextMenu.vue";
import type { FilterInList } from "@/composables/useFilterHelper";
import { usePermissions } from "../composables/usePermissions";
import { useAuth } from "session-vue-3-oidc-library";

const { determinePermission, loading } = usePermissions();
const auth = useAuth();

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
  isDisplayingContextMenu,
  pickedSavedSearch,
  savedSearches,
  openSearchSavedSearchesModal,
  clearTypename,
  setPickedSavedSearch,
  isNoChangesOriginal,
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
  deleteSavedSearchMutate({ uuid: pickedSavedSearch.value?._key });
  onDoneDelete(() => {
    setPickedSavedSearch(undefined);
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
  setPickedSavedSearch(savedSearch);
  isDisplayingContextMenu.value = false;
};

const resetSelectedSavedSearch = () => {
  getByIdMutate({ uuid: pickedSavedSearch.value?._key });
  onDoneGetById((res) => {
    pick(res?.data?.getSavedSearchById);
  });
};

const updateSelectedSearch = () => {
  if (pickedSavedSearch.value) {
    var definition: Array<Definition> = [];
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
      setPickedSavedSearch(res.data.patchSavedSearchDefinition);
      refetchSavedSearches();
    });
  }
};
</script>
