<template>
  <div>
    <div role="none">
      <base-context-menu-item
        @clicked="saveChanges"
        :label="$t('saved-searches.save-changes')"
        :icon="Unicons.Save.name"
        :disable="!selectedFilter?.id"
      />

      <base-context-menu-item
        @clicked="createNew"
        :label="$t('saved-searches.new')"
        :icon="Unicons.PlusCircle.name"
        :disable="!hasActiveFilters && !selectedFilter"
      />

      <base-context-menu-item
        @clicked="updateLabel"
        :label="$t('saved-searches.edit-label')"
        :icon="Unicons.Edit.name"
        :disable="!selectedFilter"
      />

      <base-context-menu-item
        @clicked="deleteFilter"
        :label="$t('saved-searches.delete')"
        :icon="Unicons.Trash.name"
        :disable="!selectedFilter"
      />

      <hr class="border-t-1 border-neutral-50" />

      <!-- <base-context-menu-item
        v-for="(savedSearch, index) in savedSearches.slice(0, 5)"
        :key="index"
        @clicked="pick(savedSearch)"
        :label="savedSearch.metadata[0]?.value"
        :highlight="
          pickedSavedSearch
            ? pickedSavedSearch._key === savedSearch._key
            : false
        "
      /> -->

      <base-context-menu-item
        @clicked="selectFilter"
        :label="'my fancy filter'"
        :highlight="selectedFilter?.id === 2424"
      />

      <hr class="border-t-1 border-neutral-50" />

      <base-context-menu-item
        @clicked="openFindAllFiltersModal"
        :icon="Unicons.SearchGlass.name"
        :label="$t('saved-searches.all-filters')"
      />
    </div>
  </div>
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
  Entitytyping,
} from "@/generated-types/queries";
import type {
  SavedSearchesMutation,
  DeleteSavedSearchMutation,
  PatchSavedSearchDefinitionMutation,
  GetSavedSearchByIdMutation,
} from "@/generated-types/queries";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ref, computed } from "vue";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";

const props = withDefaults(
  defineProps<{
    activeFilters: any[];
    savedSearches?: any[];
    hasActiveFilters: boolean;
  }>(),
  {
    activeFilters: () => [],
    savedSearches: () => [],
    hasActiveFilters: false,
  }
);
const emit = defineEmits(["applyFilter", "deleteFilter"]);

const { openModal } = useBaseModal();
const { setActiveFilter, getActiveFilter, setFilterToEdit } =
  useSaveSearchHepler();
const { setEntityType } = useQueryVariablesFactory();

const selectedFilter = computed(() => {
  return getActiveFilter();
});

const getDeepCopy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

const handleOpenModal = () => {
  openModal(TypeModals.SaveSearch, undefined, "center");
};

const saveChanges = () => {
  setActiveFilter(selectedFilter.value);
  // TODO(savedSearch): saveCurrentFilter
  // TODO(savedSearch): show notification
};

const updateLabel = () => {
  setFilterToEdit(getDeepCopy(selectedFilter.value));
  handleOpenModal();
};

const createNew = () => {
  setFilterToEdit({
    title: "",
    value: props.activeFilters,
  });
  handleOpenModal();
};

const selectFilter = (filter: any) => {
  // TODO(savedSearch): pass real filter as the argument to setActiveFilter
  setActiveFilter({
    id: 2424,
    title: "my new fancy filter",
    value: [
      {
        type: "type",
        value: "asset",
        match_exact: true,
      },
      {
        type: "text",
        key: ["elody:1|metadata.title.value"],
        value: "text",
        match_exact: false,
      },
    ],
  });
  emit("applyFilter", selectedFilter.value.value);
};

const deleteFilter = () => {
  // TODO(savedSearch): call delete the filter
  // TODO(savedSearch): show a notification 'deleted'
  emit("deleteFilter");
};

const openFindAllFiltersModal = () => {
  setEntityType(Entitytyping.Asset);
  openModal(TypeModals.SaveSearchPicker, undefined, "right");
};

// const { mutate, onDone } = useMutation<SavedSearchesMutation>(
//   SavedSearchesDocument
// );

// const { mutate: deleteSavedSearchMutate, onDone: onDoneDelete } =
//   useMutation<DeleteSavedSearchMutation>(DeleteSavedSearchDocument);

// const {
//   mutate: patchSavedSearchDefinitionMutate,
//   onDone: onDonePatchDefinition,
// } = useMutation<PatchSavedSearchDefinitionMutation>(
//   PatchSavedSearchDefinitionDocument
// );

// const { mutate: getByIdMutate, onDone: onDoneGetById } =
//   useMutation<GetSavedSearchByIdMutation>(GetSavedSearchByIdDocument);

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

// const showConfirmation = () => {
//   // TODO:
// };

// const pick = (savedSearch: any) => {
//   setPickedSavedSearch(savedSearch);
// };

// const resetSelectedSavedSearch = () => {
//   getByIdMutate({ uuid: pickedSavedSearch.value?._key });
//   onDoneGetById((res) => {
//     pick(res?.data?.getSavedSearchById);
//   });
// };
</script>
