<template>
  <button
    v-if="!inputEnabled"
    type="button"
    data-testid="search-trigger"
    aria-haspopup="dialog"
    :aria-label="t('library.search')"
    class="flex items-center justify-center shrink-0 size-(--control-height) rounded-round bg-accent text-text-on-accent cursor-pointer hover:bg-accent-hover"
    @click="openSearchModal"
  >
    <unicon :name="Unicons.SearchGlass.name" height="14" aria-hidden="true" />
  </button>
  <div v-else class="flex items-center gap-2">
    <!-- modal.md: first focus on the field, not the close cross -->
    <BaseSearchPill
      v-model="inputValue"
      class="flex-1"
      :label="t('library.search')"
      :placeholder="t('search.search-placeholder')"
      autofocus
      @keydown.enter="submitSearch"
    />
    <BaseVirtualKeyboard
      v-if="virtualKeyboardLayouts"
      class="flex items-center"
      :input="inputValue"
      :layouts="virtualKeyboardLayouts"
      :keyboard-class="keyboardClass"
      @on-change="inputValue = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { computed, inject, onUnmounted, ref, useId, watch } from "vue";
import debounce from "lodash.debounce";
import { Unicons } from "@/types";
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
import BaseSearchPill from "@/components/base/BaseSearchPill.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { trackSearch } from "@/analytics/usageAnalytics";

const props = withDefaults(
  defineProps<{
    inputEnabled?: boolean;
    debounceMs?: number;
  }>(),
  {
    inputEnabled: false,
    debounceMs: 250,
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

const debouncedSearch = debounce(
  (term: string) => emit("search", term),
  props.debounceMs,
);

watch(inputValue, (term) => {
  if (props.inputEnabled) debouncedSearch(term);
});

onUnmounted(() => debouncedSearch.cancel());

const submitSearch = () => {
  debouncedSearch.cancel();
  trackSearch(inputValue.value, { scope: "header" });
  emit("search", inputValue.value);
};

const openSearchModal = () => {
  openModal(TypeModals.Search, ModalStyle.CenterWide);
};
</script>
