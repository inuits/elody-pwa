<template>
  <Teleport to="body">
    <div
      v-if="suggestion"
      :ref="showInTopLayer"
      popover="manual"
      @mousedown.prevent
      class="fixed z-[10000] w-72 max-h-64 overflow-y-auto rounded-md border border-neutral-30 bg-white shadow-lg py-1"
      :style="{
        left: `${suggestion.anchor.left}px`,
        top: `${suggestion.anchor.bottom + 4}px`,
        margin: 0,
        padding: '0.25rem 0',
      }"
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
        :ref="(element) => (optionElements[index] = element as HTMLElement)"
        :class="[
          'block w-full text-left px-3 py-2 text-sm truncate',
          index === highlightedIndex
            ? 'bg-accent-accent text-white'
            : 'hover:bg-neutral-20',
        ]"
        @mouseenter="highlightedIndex = index"
        @mousedown.prevent="pick(entity)"
      >
        {{ labelFor(entity) }}
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import { useSimpleSearch } from "@/composables/useSimpleSearch";
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Entitytyping,
  GetEntitiesDocument,
  SearchInputType,
} from "@/generated-types/queries";
import type { InlineSuggestionState } from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/inlineTagSuggestion";

const props = defineProps<{
  suggestion: InlineSuggestionState;
  customQuery?: string | null;
}>();

const emit = defineEmits<{ pick: [entity: any, label: string] }>();

const { t } = useI18n();
const { loadDocument } = useImport();
const { buildFilters } = useSimpleSearch();

const results = ref<any[]>([]);
const isLoading = ref<boolean>(false);
const highlightedIndex = ref<number>(0);
const optionElements = ref<HTMLElement[]>([]);

const metadataKeyOf = (filterKey: string): string => {
  const path = filterKey.split("|").pop() ?? "";
  const segments = path.split(".");
  return segments.length >= 2 ? segments[segments.length - 2] : path;
};

const labelKeys = ref<string[]>([]);

const labelKeysOf = (filters: AdvancedFilterInput[]): string[] => [
  ...new Set(
    filters
      .filter((filter) => filter.type === AdvancedFilterTypes.Text)
      .flatMap((filter) =>
        Array.isArray(filter.key) ? filter.key : filter.key ? [filter.key] : [],
      )
      .map(metadataKeyOf),
  ),
];

const labelFor = (entity: any): string => {
  const values = entity?.intialValues ?? {};
  for (const key of labelKeys.value) {
    if (values[key]) return values[key];
  }
  return entity?.id ?? "";
};

/**
 * A configuration whose taggableEntityType is BaseEntity tags ANY entity, so it reuses
 * the client's global simple-search setup: that already declares which types are
 * searchable and which metadata keys hold their titles, per client, with the right
 * schema prefix. Deriving the mode from BaseEntity means no second way to configure it.
 */
const filtersFor = (
  state: NonNullable<InlineSuggestionState>,
): AdvancedFilterInput[] | undefined => {
  const typed = state.configurations.filter(
    (configuration) =>
      configuration.taggableEntityType !== Entitytyping.BaseEntity,
  );

  if (typed.length) {
    if (typed.length !== state.configurations.length) {
      // BaseEntity brings its own type list; ANDing it with named types would
      // contradict itself, so this is a configuration mistake, not a case to merge.
      console.error(
        "[elody-tagging] a trigger character cannot mix BaseEntity with named entity types",
      );
      return undefined;
    }
    const keys = typed
      .map((configuration) => configuration.metadataFilterForTagContent)
      .filter(Boolean) as string[];
    if (keys.length !== typed.length) {
      console.error(
        "[elody-tagging] every configuration on this trigger needs metadataFilterForTagContent to search on",
      );
      return undefined;
    }
    return [
      // One query for all of them. Several types are a selection filter, which is
      // what lets the backend answer from the shared Typesense index and hydrate the
      // hits from each type's own collection (users and groups live apart).
      typed.length === 1
        ? {
            type: AdvancedFilterTypes.Type,
            value: typed[0].taggableEntityType,
            match_exact: true,
          }
        : {
            type: AdvancedFilterTypes.Selection,
            key: "type",
            value: typed.map(
              (configuration) => configuration.taggableEntityType,
            ),
            match_exact: true,
          },
      {
        type: AdvancedFilterTypes.Text,
        key: [...new Set(keys)],
        value: state.query,
        match_exact: false,
      },
    ];
  }

  const simpleSearchFilters = buildFilters(state.query);
  const hasTypeScope = simpleSearchFilters.some(
    (filter) => filter.key === "type",
  );
  if (!hasTypeScope) {
    console.error(
      "[elody-tagging] simple search has no readable item types configured, so a BaseEntity tag cannot be scoped",
    );
    return undefined;
  }
  return simpleSearchFilters;
};

let latestSearch = 0;

const search = async (state: NonNullable<InlineSuggestionState>) => {
  const thisSearch = ++latestSearch;
  const isStale = () => thisSearch !== latestSearch;
  isLoading.value = true;
  highlightedIndex.value = 0;
  try {
    const document = props.customQuery
      ? await loadDocument(props.customQuery)
      : GetEntitiesDocument;
    if (!document) {
      console.error(
        `[elody-tagging] tagging customQuery "${props.customQuery}" does not exist`,
      );
      results.value = [];
      return;
    }
    const filters = filtersFor(state);
    if (!filters) {
      results.value = [];
      return;
    }
    labelKeys.value = labelKeysOf(filters);

    const response = await apolloClient.query({
      query: document,
      variables: {
        // Only the advanced filters decide what is searched; the backend derives the
        // collection from them, so this stays the first configured type.
        type: state.configurations[0].taggableEntityType as Entitytyping,
        limit: 10,
        skip: 1,
        searchValue: { value: "", isAsc: true },
        advancedSearchValue: [],
        searchInputType: SearchInputType.AdvancedInputType,
        advancedFilterInputs: filters,
      },
      fetchPolicy: "no-cache",
    });
    if (isStale()) return;
    results.value = response.data?.Entities?.results ?? [];
  } catch (error) {
    if (isStale()) return;
    console.error("[elody-tagging] inline suggestion search failed", error);
    results.value = [];
  } finally {
    if (!isStale()) isLoading.value = false;
  }
};

watch(
  () => [
    props.suggestion?.query,
    props.suggestion?.configurations.map((configuration) => configuration.tag).join(),
  ],
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

const onKeyDown = (event: KeyboardEvent) => {
  if (!results.value.length) return;

  const move = (delta: number) => {
    highlightedIndex.value =
      (highlightedIndex.value + delta + results.value.length) %
      results.value.length;
    optionElements.value[highlightedIndex.value]?.scrollIntoView?.({
      block: "nearest",
    });
  };

  if (event.key === "ArrowDown") move(1);
  else if (event.key === "ArrowUp") move(-1);
  else if (event.key === "Enter" || event.key === "Tab") {
    const entity = results.value[highlightedIndex.value];
    if (!entity) return;
    pick(entity);
  } else return;

  event.preventDefault();
  event.stopPropagation();
};

onMounted(() => document.addEventListener("keydown", onKeyDown, true));
onUnmounted(() => document.removeEventListener("keydown", onKeyDown, true));

/**
 * The composer can live inside a <dialog> opened with showModal(), which puts it in the
 * browser's top layer — and nothing in the normal stacking context can paint above that,
 * no matter how high its z-index. popover="manual" puts the dropdown in the top layer
 * too, without stealing focus the way showModal() would (a typeahead must keep the
 * caret in the editor). Shown after the dialog, so it stacks above it.
 */
const showInTopLayer = (element: any) => {
  if (typeof element?.showPopover !== "function") return; // no popover support: plain z-index
  try {
    element.showPopover();
  } catch {}
};
</script>
