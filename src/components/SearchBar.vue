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
          inputEnabled === false ? openSearchModal() : applyFilterToLibrary()
        "
      >
        <unicon :name="Unicons.SearchGlass.name"></unicon>
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

withDefaults(
  defineProps<{
    inputEnabled?: boolean;
  }>(),
  {
    inputEnabled: false,
  }
);

const emit = defineEmits<{
  (event: "updateFilters", filters: AdvancedFilterInput[]): void;
}>();

const config = inject("config") as any;
const { openModal, getModalInfo } = useBaseModal();
const inputValue = ref<string>("");
const entityTypeFilters = computed(() =>
  config.features.simpleSearch.simpleSearchEntityTypes?.map((type: string) => {
    return {
      match_exact: true,
      type: AdvancedFilterTypes.Type,
      value: type,
    };
  })
);
onBeforeMount(() => applyFilterToLibrary());
const applyFilterToLibrary = () => {
  let filters: object[];
  if (entityTypeFilters.value !== undefined)
    filters = [...entityTypeFilters.value];
  else filters = [];
  const item_types = config.features.simpleSearch.itemTypes;
  const metadataKeys = config.features.simpleSearch.simpleSearchMetadataKey;
  for (let index in metadataKeys) {
    filters.push({
      key: [`elody:1|metadata.${metadataKeys[index]}.value`],
      value: inputValue.value,
      type: AdvancedFilterTypes.Text,
      match_exact: false,
      parent_key: "metadata",
      operator: "or",
    });
    if (item_types)
      filters.forEach((filter) => (filter["item_types"] = item_types));
  }
  emit("updateFilters", filters);
};

const openSearchModal = () => {
  openModal(TypeModals.Search, ModalStyle.RightWide);
};

watch(
  () => getModalInfo(TypeModals.Search).open,
  (modalIsOpen: boolean | undefined) => {
    if (!modalIsOpen) {
      inputValue.value = "";
      applyFilterToLibrary();
    }
  }
);
</script>
