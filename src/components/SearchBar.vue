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
        class="
          flex
          justify-center
          items-center
          h-10
          w-10
          p-2.5
          text-sm
          font-medium
          text-neutral-white
          bg-accent-normal
          rounded-lg
        "
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
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  AdvancedFilterInput,
  AdvancedFilterTypes,
  ModalState,
  TypeModals,
} from "@/generated-types/queries";
import { computed, inject, ref, watch } from "vue";

const props = withDefaults(
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
  config.features.simpleSearch.simpleSearchEntityTypes.map((type: string) => {
    return {
      match_exact: true,
      type: AdvancedFilterTypes.Type,
      value: type,
    };
  })
);

const applyFilterToLibrary = () => {
  const filters = [...entityTypeFilters.value];
  const metadataKey = config.features.simpleSearch.simpleSearchMetadataKey;
  filters.push({
    key: metadataKey,
    value: inputValue.value,
    type: AdvancedFilterTypes.Text,
    match_exact: false,
    parent_key: "metadata",
  });
  emit("updateFilters", filters);
};

const openSearchModal = () => {
  openModal(TypeModals.Search, undefined, "right");
};

watch(
  () => getModalInfo(TypeModals.Search).state,
  (modalState: ModalState) => {
    if (modalState !== ModalState.Show) {
      inputValue.value = "";
    }
  }
);
</script>
