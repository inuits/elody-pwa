<template>
  <div class="w-full flex flex-col">
    <div v-for="entry in elementList" :key="entry.key">
      <entity-history-window
        v-if="entry.value.__typename === 'WindowElement'"
        :element="entry.value"
        :form-id="entity.id"
        :identifiers="identifiers"
        :entity-metadata="entity.intialValues"
        :entity-relations="entity.relationValues"
        :wysiwyg-diffs="wysiwygDiffs"
        :relation-diffs="relationDiffs"
      />
      <history-relation-diff
        v-else-if="
          entry.value.__typename === 'EntityListElement' &&
          hasRelationDiff(relationDiffs, entry.value)
        "
        :label="entry.value.label"
        :items="relationDiffItemsFor(relationDiffs, entry.value)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import EntityHistoryWindow from "@/components/history/EntityHistoryWindow.vue";
import HistoryRelationDiff from "@/components/history/HistoryRelationDiff.vue";
import {
  hasRelationDiff,
  relationDiffItemsFor,
  type RelationDiff,
  type WysiwygDiff,
} from "@/composables/useHistoryComparisonData";
import { useRoute } from "vue-router";

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
  Object.entries(props.elements)
    .filter(([, value]) => value && typeof value === "object")
    .map(([key, value]) => ({ key, value })),
);

const route = useRoute();

const identifiers = computed<string[]>(() => {
  return [route.params.id];
  if (props.entity.intialValues?.identifiers)
    return props.entity.intialValues.identifiers;
  return [props.entity.uuid, props.entity.id];
});
</script>
