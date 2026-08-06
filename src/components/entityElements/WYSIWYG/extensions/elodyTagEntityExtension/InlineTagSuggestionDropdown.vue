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
            ? 'bg-accent-normal text-white'
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
  /** Query name from the tagging configuration, resolved by name at runtime. */
  customQuery?: string | null;
}>();

const emit = defineEmits<{ pick: [entity: any, label: string] }>();

const { t } = useI18n();
const { loadDocument } = useImport();
// At setup top level: useSimpleSearch injects the app config, and inject() resolves to
// undefined once called from inside the async search().
const { buildFilters } = useSimpleSearch();

const results = ref<any[]>([]);
const isLoading = ref<boolean>(false);
const highlightedIndex = ref<number>(0);
/** Only to scroll the highlighted option into view when navigating past the fold. */
const optionElements = ref<HTMLElement[]>([]);

/** "vlacc:1|properties.name.value" -> "name" */
const metadataKeyOf = (filterKey: string): string => {
  const path = filterKey.split("|").pop() ?? "";
  const segments = path.split(".");
  return segments.length >= 2 ? segments[segments.length - 2] : path;
};

/**
 * The metadata keys the current search matched on, in filter order — the same keys the
 * label is read from, since a client filters on exactly the fields holding an entity's
 * title. Derived per search rather than hardcoded: which keys those are is entirely
 * client configuration (the typed case names one in metadataFilterForTagContent, the
 * cross-type case gets the client's whole simpleSearchMetadataKey list), and none of
 * those names belong in the shared PWA.
 */
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
 *
 * Returns undefined when the search cannot be scoped, rather than falling back to an
 * unscoped one that would trawl every type in the database.
 */
const filtersFor = (
  state: NonNullable<InlineSuggestionState>,
): AdvancedFilterInput[] | undefined => {
  if (state.configuration.taggableEntityType !== Entitytyping.BaseEntity) {
    // A typed configuration has nothing else to search on, so a missing key would mean
    // a text filter with no key: every entity of the type, whatever was typed.
    if (!state.configuration.metadataFilterForTagContent) {
      console.error(
        `[elody-tagging] configuration for "${state.configuration.tag}" needs metadataFilterForTagContent to search on`,
      );
      return undefined;
    }
    return [
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
    ];
  }

  // buildFilters emits its own selection filter on `type`, so adding the Type filter
  // above would AND `type == BaseEntity` against it and match nothing.
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

/**
 * Sequences the searches: the watcher fires per keystroke, and without this whichever
 * request resolved LAST won, so a fast typist could be left looking at results for a
 * stale prefix — and Enter would then tag the wrong entity.
 */
let latestSearch = 0;

const search = async (state: NonNullable<InlineSuggestionState>) => {
  const thisSearch = ++latestSearch;
  const isStale = () => thisSearch !== latestSearch;
  isLoading.value = true;
  highlightedIndex.value = 0;
  try {
    // GetEntitiesDocument is imported rather than looked up by name: loadDocument
    // resolves `${name}Document`, and the generated export is capitalised, so
    // loadDocument("getEntities") returns undefined.
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
        type: state.configuration.taggableEntityType as Entitytyping,
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
    // Not unconditional: an overtaken request must not clear the spinner while the
    // request the user is actually waiting for is still in flight.
    if (!isStale()) isLoading.value = false;
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

/**
 * Keyboard selection.
 *
 * Capture phase on document, not @tiptap/suggestion's own onKeyDown: that hook lives in
 * the extension, which has no access to the fetched results or the highlighted index —
 * those are this component's state. Capture runs before ProseMirror's own keydown
 * listener on the editor element, so stopping propagation here keeps Enter from
 * inserting a hard break and the arrows from moving the caret.
 *
 * Only listening while open is free: the host renders this component with v-if on the
 * suggestion state, so mounted == dropdown visible.
 */
const onKeyDown = (event: KeyboardEvent) => {
  if (!results.value.length) return;

  const move = (delta: number) => {
    // Wraps, so holding one arrow key cannot dead-end at either edge.
    highlightedIndex.value =
      (highlightedIndex.value + delta + results.value.length) %
      results.value.length;
    // Optional call: jsdom does not implement scrollIntoView, and scrolling is cosmetic.
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
  } catch {
    // Already shown; harmless.
  }
};
</script>
