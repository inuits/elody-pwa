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

      <!-- TODO(savedSearch): save selected to session/local storage and show it there -->
      <!-- <template v-if="!entitiesLoading">
        <base-context-menu-item
          v-for="(savedSearch, index) in entitiesList.slice(0, 5)"
          :key="index"
          @clicked="selectFilter(savedSearch)"
          :label="savedSearch.title"
          :highlight="selectedFilter?.id === savedSearch.id"
        />
      </template>

      <hr class="border-t-1 border-neutral-50" v-if="entitiesList.length > 0" /> -->

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
import { TypeModals, Entitytyping } from "@/generated-types/queries";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { computed, onMounted } from "vue";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useRouter } from "vue-router";
import { goToEntityPage } from "@/helpers";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { openModal, closeModal } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const {
  setActiveFilter,
  getActiveFilter,
  deleteSavedSearch,
  initialize,
  saveExistedSearch,
  fetchSavedSearchById,
} = useSaveSearchHepler();
const { setEntityType } = useQueryVariablesFactory();

const router = useRouter();

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
    undefined,
    context
  );
};

const saveChanges = async () => {
  if (!selectedFilter.value) return;
  const savedFilter = await fetchSavedSearchById(selectedFilter.value.id);
  await saveExistedSearch(savedFilter, props.activeFilters);
  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityUpdated.title"),
    t("notifications.success.entityUpdated.description")
  );
};

const updateLabel = async () => {
  if (!selectedFilter.value) return;
  const savedFilterEntity = await fetchSavedSearchById(selectedFilter.value.id);
  goToEntityPage(savedFilterEntity, "SingleEntity", router);
};

const createNew = () => {
  handleOpenModal([
    {
      key: "applicableType",
      value: props.entityType,
    },
    {
      key: "filters",
      value: getDeepCopy(props.activeFilters),
    },
  ]);
};

// TODO(savedSearch): should be used once selected filters will be saved in session/local storage
const selectFilter = async (filter: any) => {
  setActiveFilter(getDeepCopy(filter));
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
    translationKey: "delete-entity",
    openImmediately: true,
  });
};

const deleteFilter = async () => {
  if (!selectedFilter.value) return;
  await deleteSavedSearch(selectedFilter.value.id);
  setActiveFilter(null);
  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityDeleted.title"),
    t("notifications.success.entityDeleted.description")
  );
};

const openFindAllFiltersModal = () => {
  setEntityType(Entitytyping.SavedSearch);
  openModal(TypeModals.SaveSearchPicker, undefined, "right");
};
</script>
