<template>
  <div :class="['flex', { 'p-4 bg-background-normal': inputEnabled }]">
    <div class="flex w-full bg-background-light rounded-lg">
      <input
        v-if="inputEnabled"
        type="text"
        class="w-full rounded-lg border-0"
        v-model="inputValue"
        :placeholder="t('search.search-placeholder')"
        @keydown.enter="submitSearch"
      />
    </div>
    <button
      type="button"
      :class="[
        'flex justify-center items-center h-10 w-10 p-2.5 text-sm font-medium text-neutral-white bg-accent-normal rounded-lg',
        { 'ml-2': inputEnabled },
      ]"
      @click="!inputEnabled ? openSearchModal() : submitSearch()"
    >
      <unicon :name="Unicons.SearchGlass.name"></unicon>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { ref } from "vue";
import { Unicons } from "@/types";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

withDefaults(
  defineProps<{
    inputEnabled?: boolean;
  }>(),
  {
    inputEnabled: false,
  },
);

const emit = defineEmits<{
  (event: "search", term: string): void;
}>();

const { t } = useI18n();
const { openModal } = useBaseModal();
const inputValue = ref<string>("");

const submitSearch = () => {
  emit("search", inputValue.value);
};

const openSearchModal = () => {
  openModal(TypeModals.Search, ModalStyle.CenterWide);
};
</script>
