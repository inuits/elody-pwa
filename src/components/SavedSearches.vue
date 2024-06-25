<template>
  <div v-show="auth.isAuthenticated.value === true">
    <div role="none">
      <base-context-menu-item
        @clicked="updateSelectedSearch()"
        :label="$t('saved-searches.save-changes')"
        :icon="Unicons.Save.name"
        :disable="isNoChangesOriginal(pickedSavedSearch, initialFilters)"
      />

      <base-context-menu-item
        @clicked="handleOpenModal"
        :label="$t('saved-searches.new')"
        :icon="Unicons.PlusCircle.name"
        :disable="!hasActiveFilters"
      />

      <base-context-menu-item
        @clicked="openEditModal()"
        :label="$t('saved-searches.edit-label')"
        :icon="Unicons.Edit.name"
        :disable="!pickedSavedSearch"
      />

      <base-context-menu-item
        @clicked="resetSelectedSavedSearch()"
        :label="$t('saved-searches.reset')"
        :icon="Unicons.Redo.name"
        :disable="!pickedSavedSearch"
      />

      <base-context-menu-item
        @clicked="showConfirmation()"
        :label="$t('saved-searches.delete')"
        :icon="Unicons.Trash.name"
        :disable="!pickedSavedSearch"
      />

      <hr class="border-t-1 border-neutral-50" />

      <base-context-menu-item
        v-for="(savedSearch, index) in savedSearches.slice(0, 5)"
        :key="index"
        @clicked="pick(savedSearch)"
        :label="savedSearch.metadata[0]?.value"
        :highlight="
          pickedSavedSearch
            ? pickedSavedSearch._key === savedSearch._key
            : false
        "
      />

      <hr class="border-t-1 border-neutral-50" />

      <base-context-menu-item
        @clicked="openSearchSavedSearchesModal()"
        :icon="Unicons.SearchGlass.name"
        :label="$t('saved-searches.all-filters')"
      />
    </div>
  </div>

  <create-saved-search-modal />
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useMutation } from "@vue/apollo-composable";
import {
  SavedSearchesDocument,
  DeleteSavedSearchDocument,
  PatchSavedSearchDefinitionDocument,
  GetSavedSearchByIdDocument,
  TypeModals,
  type Definition,
} from "@/generated-types/queries";
import type {
  SavedSearchesMutation,
  DeleteSavedSearchMutation,
  PatchSavedSearchDefinitionMutation,
  GetSavedSearchByIdMutation,
} from "@/generated-types/queries";
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";
import CreateSavedSearchModal from "@/components/CreateSavedSearchModal.vue";
import BaseContextMenuItem from "./base/BaseContextMenuItem.vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useBaseModal } from "@/composables/useBaseModal";
const { openModal } = useBaseModal();
const auth = useAuth();

const props = withDefaults(
  defineProps<{
    activeFilters: any[];
    hasActiveFilters: boolean;
  }>(),
  {
    activeFilters: () => [],
    hasActiveFilters: false,
  }
);

const handleOpenModal = () => {
  console.log("triggered", new Date());
  openModal(TypeModals.SaveSearch, undefined, "center");
};

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

// const { mutate, onDone } = useMutation<SavedSearchesMutation>(
//   SavedSearchesDocument
// );

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

// mutate();

// onDone((result: any) => {
//   savedSearches.value = result.data.savedSearches.results;
// });

// const refetchSavedSearches = () => {
//   mutate();
// };

// const deleteSavedSearch = () => {
//   deleteSavedSearchMutate({ uuid: pickedSavedSearch.value?._key });
//   onDoneDelete(() => {
//     setPickedSavedSearch(undefined);
//     mutate();
//     emit("removedSelectedSearch");
//   });
// };

const showConfirmation = () => {
  // TODO:
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
    props.initialFilters.forEach((filter: any) => {
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
