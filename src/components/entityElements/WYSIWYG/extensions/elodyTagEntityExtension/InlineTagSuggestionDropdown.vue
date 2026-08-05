<template>
  <Teleport to="body">
    <Transition name="suggestion">
      <div
        v-if="suggestion && position"
        class="fixed z-[10000] w-72 max-h-64 overflow-y-auto rounded-md border border-neutral-30 bg-white shadow-lg py-1"
        :style="{ left: `${position.left}px`, top: `${position.top}px` }"
      >
        <p v-if="isLoading" class="px-3 py-2 text-sm text-text-placeholder">
          {{ t("comments.loading") }}
        </p>
        <p
          v-else-if="!results.length"
          class="px-3 py-2 text-sm text-text-placeholder italic"
        >
          {{ t("search.noresult-nofilters") }}
        </p>
        <button
          v-for="(entity, index) in results"
          :key="entity.id"
          :class="[
            'block w-full text-left px-3 py-2 text-sm truncate',
            index === highlightedIndex
              ? 'bg-accent-normal text-white'
              : 'hover:bg-neutral-20',
          ]"
          @mouseenter="highlightedIndex = index"
          @click="pick(entity)"
        >
          {{ labelFor(entity) }}
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import {
  AdvancedFilterTypes,
  SearchInputType,
  type Entitytyping,
} from "@/generated-types/queries";
import type { InlineSuggestionState } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/inlineTagSuggestion";

const props = defineProps<{
  suggestion: InlineSuggestionState;
  /** Query name from the tagging configuration, resolved by name at runtime. */
  customQuery?: string | null;
}>();

const emit = defineEmits<{ pick: [entity: any, label: string] }>();

const { t } = useI18n();
const { loadDocument } = useImport();

const results = ref<any[]>([]);
const isLoading = ref<boolean>(false);
const highlightedIndex = ref<number>(0);

const position = computed(() => {
  const rect = props.suggestion?.clientRect;
  if (!rect) return undefined;
  return { left: rect.left, top: rect.bottom + 4 };
});

/**
 * The configuration's metadataFilterForTagContent is a schema-prefixed filter key such
 * as "vlacc:1|properties.name.value"; its last dotted segment is the metadata key that
 * holds the display label.
 */
const labelKey = computed<string>(() => {
  const filter = props.suggestion?.configuration.metadataFilterForTagContent;
  if (!filter) return "title";
  const path = filter.split("|").pop() ?? "";
  const segments = path.split(".");
  // properties.<key>.value -> <key>
  return segments.length >= 2 ? segments[segments.length - 2] : path;
});

const labelFor = (entity: any): string =>
  entity?.intialValues?.[labelKey.value] ??
  entity?.intialValues?.title ??
  entity?.id ??
  "";

const search = async (state: NonNullable<InlineSuggestionState>) => {
  isLoading.value = true;
  highlightedIndex.value = 0;
  try {
    const document = await loadDocument(props.customQuery || "getEntities");
    const response = await apolloClient.query({
      query: document,
      variables: {
        type: state.configuration.taggableEntityType as Entitytyping,
        limit: 10,
        skip: 1,
        searchValue: { value: "", isAsc: true },
        advancedSearchValue: [],
        searchInputType: SearchInputType.AdvancedInputType,
        advancedFilterInputs: [
          {
            type: AdvancedFilterTypes.Type,
            value: state.configuration.taggableEntityType,
            match_exact: true,
          },
          {
            type: AdvancedFilterTypes.Text,
            key: [state.configuration.metadataFilterForTagContent],
            value: state.query,
            match_exact: false,
          },
        ],
      },
      fetchPolicy: "no-cache",
    });
    results.value = response.data?.Entities?.results ?? [];
  } catch (error) {
    console.error("[elody-tagging] inline suggestion search failed", error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [props.suggestion?.query, props.suggestion?.configuration.tag],
  () => {
    if (!props.suggestion) {
      results.value = [];
      return;
    }
    search(props.suggestion);
  },
  { immediate: true },
);

const pick = (entity: any) => emit("pick", entity, labelFor(entity));
</script>

<style scoped>
.suggestion-enter-active,
.suggestion-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.suggestion-enter-from,
.suggestion-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
