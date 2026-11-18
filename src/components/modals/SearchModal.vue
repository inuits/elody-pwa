<template>
  <BaseModal
    class="bg-surface md:mt-[10vh] md:mb-auto"
    :modal-type="TypeModals.Search"
    :cancel-button-availabe="false"
    :title="t('search.simple-search')"
    @hide-modal="closeModal(TypeModals.Search)"
  >
    <!-- the results scroll inside the modal, under the field -->
    <div class="flex flex-col gap-4 min-h-0 p-4">
      <search-bar
        :input-enabled="true"
        @search="handleSearch"
      />
      <div v-if="itemTypes.length > 1" class="flex flex-wrap gap-2">
        <button
          v-for="type in itemTypes"
          :key="type"
          type="button"
          data-testid="search-scope-chip"
          :aria-pressed="activeTypes.includes(type) ? 'true' : 'false'"
          class="px-3 py-1 rounded-chip border text-sm font-bold cursor-pointer first-letter:uppercase"
          :class="chipStyles[String(activeTypes.includes(type))]"
          @click="toggleType(type)"
        >
          {{ t(`entity-translations.${type.toLowerCase()}`, 2) }}
        </button>
      </div>
      <div
        v-if="isModalOpened && filters.length"
        class="max-h-[60vh] overflow-y-auto"
      >
        <base-library
          :bulk-operations-context="BulkOperationsContextEnum.SearchModal"
          list-item-route-name="SingleEntity"
          :enable-advanced-filters="false"
          :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
          :enable-bulk-operations="true"
          :filters="filters"
          :should-use-state-for-route="false"
          :is-search-library="true"
          :force-list-view="true"
          :entity-type="
            filters.find((filter) => filter.type === AdvancedFilterTypes.Type)
              ?.value || Entitytyping.BaseEntity
          "
        />
      </div>
    </div>
    <div
      data-testid="search-footer"
      class="flex items-center gap-4 px-4 py-2 border-t border-border-panel bg-surface-muted text-xs text-text-secondary max-md:hidden"
    >
      <span class="flex items-center gap-1">
        <kbd :class="keyHintClass">↵</kbd>{{ t("search.hint-search") }}
      </span>
      <span class="flex items-center gap-1">
        <kbd :class="keyHintClass">Esc</kbd>{{ t("search.hint-close") }}
      </span>
      <span class="ml-auto">{{ scopeLine }}</span>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {
  type AdvancedFilterInput,
  Entitytyping,
  SearchInputType,
  TypeModals,
  AdvancedFilterTypes,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import SearchBar from "@/components/SearchBar.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { computed, provide, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useSimpleSearch } from "@/composables/useSimpleSearch";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { closeModal, getModalInfo } = useBaseModal();
const { buildFilters, itemTypes } = useSimpleSearch();
const isModalOpened = ref<boolean>(false);
// the modal is the chrome: no grey well or band of the list's own (L25)
provide("InsidePanel", true);
const filters = ref<AdvancedFilterInput[]>([]);
const searchTerm = ref<string>("");
const activeTypes = ref<string[]>([...itemTypes.value]);

const chipStyles: Record<string, string> = {
  true: "bg-accent-normal border-accent-normal text-text-on-accent",
  false: "bg-transparent border-border-default text-text-secondary",
};
const keyHintClass =
  "px-1.5 border border-border-default rounded-sm font-sans text-text-body";

const scopeLine = computed(() =>
  activeTypes.value.length === itemTypes.value.length
    ? t("search.all-types")
    : t("search.types-active", {
        active: activeTypes.value.length,
        total: itemTypes.value.length,
      }),
);

const handleSearch = (term: string) => {
  searchTerm.value = term;
  filters.value = buildFilters(term, activeTypes.value);
  isModalOpened.value = true;
};

const toggleType = (type: string) => {
  const isActive = activeTypes.value.includes(type);
  if (isActive && activeTypes.value.length === 1) return;
  activeTypes.value = isActive
    ? activeTypes.value.filter((activeType) => activeType !== type)
    : itemTypes.value.filter(
        (itemType) => itemType === type || activeTypes.value.includes(itemType),
      );
  if (searchTerm.value) handleSearch(searchTerm.value);
};

watch(
  () => getModalInfo(TypeModals.Search).open,
  (modalIsOpen: boolean | undefined) => {
    if (!modalIsOpen) {
      filters.value = [];
      searchTerm.value = "";
      activeTypes.value = [...itemTypes.value];
      isModalOpened.value = false;
    }
  },
);
</script>
