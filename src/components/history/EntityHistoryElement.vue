<template>
  <div class="w-full flex flex-col">
    <div v-for="(element, index) in elementList" :key="index">
      <entity-history-window
        v-if="element.__typename === 'WindowElement'"
        :element="element"
        :form-id="entity.id"
        :identifiers="identifiers"
        :entity-metadata="entity.intialValues"
        :entity-relations="entity.relationValues"
        :wysiwyg-diffs="wysiwygDiffs"
      />
      <div
        v-else-if="
          element.__typename === 'EntityListElement' && hasRelationDiff(element)
        "
        class="border-solid border-neutral-30 border-2 bg-background-light rounded-t-md mb-5"
      >
        <div
          class="border-solid border-neutral-30 border-b-2 rounded-t-md flex items-center justify-between p-2"
        >
          <h2>{{ $t(element.label) }}</h2>
        </div>
        <div class="p-2 w-full">
          <relation-diff-list
            v-if="relationDiffItemsFor(element).length"
            :items="relationDiffItemsFor(element)"
          />
          <p v-else class="text-text-light text-sm">
            {{ $t("history.no-items") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import EntityHistoryWindow from "@/components/history/EntityHistoryWindow.vue";
import RelationDiffList from "@/components/history/RelationDiffList.vue";
import type {
  RelationDiff,
  WysiwygDiff,
} from "@/composables/useHistoryComparisonData";

const props = defineProps<{
  elements: Record<string, any>;
  entity: {
    id: string;
    uuid?: string;
    intialValues?: Record<string, any>;
    relationValues?: Record<string, any>;
  };
  relationDiffs: RelationDiff[];
  wysiwygDiffs: WysiwygDiff[];
}>();

const elementList = computed(() =>
  Object.values(props.elements).filter(
    (value) => value && typeof value === "object",
  ),
);

const identifiers = computed<string[]>(() => {
  if (props.entity.intialValues?.identifiers)
    return props.entity.intialValues.identifiers;
  return [props.entity.uuid, props.entity.id];
});

const relationDiffFor = (element: any): RelationDiff | undefined =>
  props.relationDiffs.find((r) => r.relationType === element.relationType);

const hasRelationDiff = (element: any) => !!relationDiffFor(element);

const relationDiffItemsFor = (element: any) =>
  relationDiffFor(element)?.items ?? [];
</script>
