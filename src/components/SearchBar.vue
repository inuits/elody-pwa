<template>
  <div :class="['flex', { 'p-4 bg-background-normal': inputEnabled }]">
    <!-- One pill, not an input beside a coloured block: the pill shape marks
         an action that only starts something reversible (entity-picker.md). -->
    <div v-if="inputEnabled" class="search-pill">
      <unicon
        class="search-pill__icon"
        :name="Unicons.SearchGlass.name"
        height="18"
      />
      <input
        type="text"
        class="search-pill__input"
        v-model="inputValue"
        :placeholder="t('search.search-placeholder')"
        @keydown.enter="submitSearch"
      />
      <button
        type="button"
        class="search-pill__submit"
        :aria-label="t('search.search-placeholder')"
        @click="submitSearch"
      >
        {{ t("search.submit") }}
      </button>
    </div>
    <button
      v-else
      type="button"
      class="search-pill search-pill--trigger"
      :aria-label="t('search.search-placeholder')"
      @click="openSearchModal"
    >
      <unicon :name="Unicons.SearchGlass.name" height="18" />
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

<style scoped>
.search-pill {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-4);
  width: 100%;
  padding: var(--spacing-ds-2) var(--spacing-ds-4) var(--spacing-ds-2)
    var(--spacing-ds-8);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-pill);
}

.search-pill:focus-within {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.search-pill__icon {
  flex: none;
  color: var(--color-text-subtle);
}

.search-pill__input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font-size: var(--text-value);
  color: var(--color-text-body);
}

.search-pill__input:focus {
  outline: none;
}

.search-pill__input::placeholder {
  color: var(--color-text-placeholder);
}

.search-pill__submit {
  flex: none;
  padding: var(--spacing-ds-2) var(--spacing-ds-8);
  border-radius: var(--radius-pill);
  background-color: var(--color-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-ui);
  font-weight: 700;
}

.search-pill__submit:focus-visible,
.search-pill--trigger:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.search-pill--trigger {
  width: auto;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--spacing-ds-4);
}

.search-pill--trigger:hover {
  background-color: var(--color-surface-editable-hover);
}
</style>
