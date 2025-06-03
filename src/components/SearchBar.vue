<template>
  <div :class="['flex', { 'p-4 bg-neutral-lightest': inputEnabled }]">
    <div class="flex w-full bg-neutral-0 rounded-lg">
      <input
        v-if="inputEnabled"
        type="text"
        class="w-full rounded-lg border-0"
        v-model="inputValue"
        @keydown.enter="applyFilterToLibrary"
      />
    </div>
    <button
      type="button"
      :class="[
        'flex justify-center items-center h-10 w-10 p-2.5 text-sm font-medium text-neutral-white bg-accent-normal rounded-lg',
        { 'ml-2': inputEnabled },
      ]"
      @click="!inputEnabled ? openSearchModal() : applyFilterToLibrary()"
    >
      <unicon :name="Unicons.SearchGlass.name"></unicon>
    </button>
  </div>
</template>

<script lang="ts" setup>
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Entitytyping,
  ModalStyle,
  Permission,
  TypeModals,
  Operator,
} from "@/generated-types/queries";
import { computed, inject, ref, watch } from "vue";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type AdvancedSearchFilters,
  useAdvancedSearch,
} from "@/composables/useAdvancedSearch";
import { usePermissions } from "@/composables/usePermissions";

withDefaults(
  defineProps<{
    inputEnabled?: boolean;
  }>(),
  {
    inputEnabled: false,
  },
);

const emit = defineEmits<{
  (
    event: "updateFilters",
    filters: AdvancedFilterInput[],
    isOpenModal: boolean,
  ): void;
  (
    event: "updateAdvancedSearchFilters",
    filters: AdvancedSearchFilters[],
    isOpenModal: boolean,
  ): void;
}>();

const config = inject("config") as any;
const { openModal, getModalInfo } = useBaseModal();
const { getFiltersForAdvancedSearch } = useAdvancedSearch(config);
const { can } = usePermissions();
const inputValue = ref<string>("");
const entityTypeFilters = computed(() =>
  config.features.simpleSearch.itemTypes
    ?.filter((type: string) => {
      return !!can(Permission.Canread, type as Entitytyping);
    })
    .map((type: string) => {
      return {
        match_exact: true,
        type: AdvancedFilterTypes.Type,
        value: type,
      };
    }),
);

const applyFilterToLibrary = () => {
  let filters: Array<AdvancedFilterInput> = [];
  if (entityTypeFilters.value !== undefined)
    filters = [...entityTypeFilters.value];
  const metadataKeys = config.features.simpleSearch.simpleSearchMetadataKey;
  for (let index in metadataKeys) {
    filters.push({
      key: [`elody:1|metadata.${metadataKeys[index]}.value`],
      value: inputValue.value,
      type: AdvancedFilterTypes.Text,
      operator: Operator.Or,
      match_exact: false,
    });
  }

  emit("updateFilters", filters, getModalInfo(TypeModals.Search).open);
  emit(
    "updateAdvancedSearchFilters",
    getFiltersForAdvancedSearch(inputValue.value),
    getModalInfo(TypeModals.Search).open,
  );
};

const openSearchModal = () => {
  openModal(TypeModals.Search, ModalStyle.CenterWide);
};

watch(
  () => getModalInfo(TypeModals.Search).open,
  (modalIsOpen: boolean | undefined) => {
    if (!modalIsOpen) {
      inputValue.value = "";
      emit("updateFilters", [], modalIsOpen);
    }
  },
);
</script>
