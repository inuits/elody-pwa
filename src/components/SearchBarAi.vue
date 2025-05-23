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
      <button
        type="button"
        class="flex justify-center items-center h-10 w-10 p-2.5 text-sm font-medium text-neutral-white bg-accent-normal rounded-lg"
        @click="
          inputEnabled === false ? openSearchModalAI() : applyFilterToLibrary()
        "
      >
        <unicon :name="Unicons.EllipsisH.name"></unicon>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
  TypeModals,
  type AdvancedFilterInput,
  ModalStyle,
} from "@/generated-types/queries";
import { computed, inject, ref, watch, onBeforeMount } from "vue";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type AiSearchFilters,
  useAiSearch,
} from "@/composables/useAiSearch";

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
    event: "updateAiSearchFilters",
    filters: AiSearchFilters,
    isOpenModal: boolean,
  ): void;
}>();

const config = inject("config") as any;
const { openModal, getModalInfo } = useBaseModal();
const { getFiltersForAiSearch } = useAiSearch(config);
const inputValue = ref<string>("");
const entityTypeFilters = computed(() =>
  config.features.simpleSearch.simpleSearchEntityTypes?.map((type: string) => {
    return {
      match_exact: true,
      type: AdvancedFilterTypes.Type,
      value: type,
    };
  }),
);
onBeforeMount(() => applyFilterToLibrary());
const applyFilterToLibrary = () => {
  let filters: Array<AdvancedFilterInput> = [];
  if (entityTypeFilters.value !== undefined)
    filters = [...entityTypeFilters.value];
  const item_types = config.features.simpleSearch.itemTypes;
  const metadataKeys = config.features.simpleSearch.simpleSearchMetadataKey;
  for (let index in metadataKeys) {
    filters.push({
      key: [`elody:1|metadata.${metadataKeys[index]}.value`],
      value: inputValue.value,
      type: AdvancedFilterTypes.Text,
      operator: "or",
      match_exact: false,
    });
  }
  if (!item_types)
    return emit("updateFilters", filters, getModalInfo(TypeModals.SearchAi).open);
  const typeFilters = item_types.map((item_type: string) => {
    return {
      match_exact: true,
      type: AdvancedFilterTypes.Type,
      value: item_type,
    };
  });
  filters.push(...typeFilters);
  emit("updateFilters", filters, getModalInfo(TypeModals.SearchAi).open);
  emit(
    "updateAiSearchFilters",
    getFiltersForAiSearch(inputValue.value),
    getModalInfo(TypeModals.SearchAi).open,
  );
};

const openSearchModalAI = () => {
  openModal(TypeModals.SearchAi, ModalStyle.RightWide);
};

watch(
  () => getModalInfo(TypeModals.SearchAi).open,
  (modalIsOpen: boolean | undefined) => {
    if (!modalIsOpen) {
      inputValue.value = "";
    }
    applyFilterToLibrary();
  },
);
</script>
