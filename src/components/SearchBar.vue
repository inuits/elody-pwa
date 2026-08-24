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
      <BaseVirtualKeyboard
        v-if="inputEnabled && virtualKeyboardLayouts"
        class="flex items-center pr-2"
        :input="inputValue"
        :layouts="virtualKeyboardLayouts"
        :keyboard-class="keyboardClass"
        @on-change="inputValue = $event"
      />
    </div>
    <button
      type="button"
      :class="[
        'flex justify-center items-center h-10 w-10 p-2.5 text-sm font-medium text-neutral-white bg-accent-normal rounded-lg cursor-pointer',
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
import { computed, inject, ref, useId } from "vue";
import { Unicons } from "@/types";
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
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
const config = inject<any>("config", undefined);
const inputValue = ref<string>("");

const virtualKeyboardLayouts = computed(
  () => config?.features?.simpleSearch?.virtualKeyboardLayouts ?? null,
);

const keyboardClass = `virtual-keyboard-search-${useId()}`;

const submitSearch = () => {
  emit("search", inputValue.value);
};

const openSearchModal = () => {
  openModal(TypeModals.Search, ModalStyle.CenterWide);
};
</script>
