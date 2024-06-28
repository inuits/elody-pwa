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
        @clicked="openDeleteModal"
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
      <template v-if="!entitiesLoading">
        <base-context-menu-item
          v-for="(savedSearch, index) in entitiesList.slice(0, 5)"
          :key="index"
          @clicked="selectFilter(savedSearch)"
          :label="savedSearch.title"
          :highlight="selectedFilter?.id === savedSearch.id"
        />
      </template>

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
import {
  TypeModals,
  Entitytyping,
  ModalChoices,
} from "@/generated-types/queries";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { computed, onMounted } from "vue";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";
import { useConfirmModal } from "@/composables/useConfirmModal";
// import { provideApolloClient, useMutation } from "@vue/apollo-composable";
const props = withDefaults(
  defineProps<{
    activeFilters: any[];
    savedSearches?: any[];
    hasActiveFilters: boolean;
    entityType: Entitytyping;
  }>(),
  {
    activeFilters: () => [],
    savedSearches: () => [],
    hasActiveFilters: false,
  }
);

const { openModal, closeModal } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const {
  setActiveFilter,
  getActiveFilter,
  setFilterToEdit,
  deleteSavedSearch,
  initialize,
  entitiesList,
  entitiesLoading,
} = useSaveSearchHepler();
const { setEntityType } = useQueryVariablesFactory();

const selectedFilter = computed(() => {
  return getActiveFilter();
});

const getDeepCopy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

onMounted(() => {
  initialize(props.entityType);
});

const handleOpenModal = (context: any = undefined) => {
  openModal(
    TypeModals.SaveSearch,
    undefined,
    "center",
    "GetSaveSearchForm",
    undefined,
    context
  );
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
  openModal(
    TypeModals.SaveSearch,
    ModalChoices.Import,
    "center",
    "GetSaveSearchForm",
    undefined,
    [
      {
        key: "applicableType",
        value: props.entityType,
      },
      {
        key: "filters",
        // TODO(savedSearch): probably not necessary to make deep copy as it will not changed before saved in the backend
        value: getDeepCopy(props.activeFilters),
      },
    ]
  );
};

const selectFilter = async (filter: any) => {
  setActiveFilter(filter);
};

const openDeleteModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: deleteFilter,
    },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.Confirm);
      },
    },
    // TODO(savedSearch): translation (?)
    translationKey: "delete-entity",
    openImmediately: true,
  });
};

const deleteFilter = async () => {
  // TODO(savedSearch): show a notification 'deleted'
  await deleteSavedSearch(selectedFilter.value.id);
  setActiveFilter(null);
};

const openFindAllFiltersModal = () => {
  setEntityType(Entitytyping.SavedSearch);
  openModal(TypeModals.SaveSearchPicker, undefined, "right");
};
</script>
