<template>
  <div
    v-show="!loading &&
      auth.isAuthenticated.value === true &&
      determinePermission('read-saved-search')
    "
  >
    <base-context-menu
      extra-class="absolute top-40 left-76 z-10"
      id="context-saved-search"
    >
      <div role="none">
        <base-context-menu-item
          @clicked="updateSelectedSearch()"
          :label="$t('saved-searches.save-changes')"
          :icon="Unicons.Save.name"
          :disable="isNoChangesOriginal(pickedSavedSearch, initialFilters)"
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('patch-saved-search')
          "
        />

        <base-context-menu-item
          @clicked="openCreateModal()"
          :label="$t('saved-searches.new')"
          :icon="Unicons.PlusCircle.name"
          :disable="
            initialFilters.every((e) => {
              return e.isActive === false;
            })
          "
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('create-saved-search')
          "
        />

        <base-context-menu-item
          @clicked="openEditModal()"
          :label="$t('saved-searches.edit-label')"
          :icon="Unicons.Edit.name"
          :disable="!pickedSavedSearch"
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('patch-saved-search')
          "
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
          v-show="
            auth.isAuthenticated.value === true &&
            determinePermission('create-saved-search')
          "
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
import { useMutation } from "@vue/apollo-composable";
import {
  SavedSearchesDocument,
  DeleteSavedSearchDocument,
  PatchSavedSearchDefinitionDocument,
  GetSavedSearchByIdDocument,
  type Definition,
} from "@/queries";
import type {
  SavedSearchesMutation,
  DeleteSavedSearchMutation,
  PatchSavedSearchDefinitionMutation,
  GetSavedSearchByIdMutation,
} from "@/queries";
import { useSavedSearchHelper } from "../composables/useSavedSearchHelper";
import CreateSavedSearchModal from "@/components/CreateSavedSearchModal.vue";
import ConfirmationModal from "@/components/base/ConfirmationModal.vue";
import BaseContextMenu from "./base/BaseContextMenu.vue";
import BaseContextMenuItem from "./base/BaseContextMenuItem.vue";
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
  confirmState.value = confirmState.value === "show" ? "hidden" : "show";
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
