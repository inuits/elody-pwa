<template>
  <div :class="[{ 'grid-cols-2': isMultipleColumn }, 'grid gap-x-6']">
    <div v-for="(config, side) in columnConfigs" :key="'history_column' + side">
      <entity-column
        v-if="config.entity"
        v-bind="config.props"
        :entity="config.entity"
        :entity-type="entityType"
        :column-list="columnList"
        @close-preview-component="emit('closePreviewComponent')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  ColumnList,
  Entity,
  Entitytyping,
} from "@/generated-types/queries";
import EntityColumn from "@/components/EntityColumn.vue";
import { useEntityDiff } from "@/composables/useEntityDiff";

const props = withDefaults(
  defineProps<{
    entity: Entity;
    entities: Entity[];
    entityId: string;
    parentEntityId: string;
    entityType: Entitytyping;
    columnList: ColumnList;
  }>(),
  {},
);

const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (event: "togglePreviewComponent", entityId: string): void;
}>();

const isMultipleColumn = ref<boolean>(true);

const panel = computed(() => {
  const elements = props.columnList?.column?.elements;
  if (!elements) return null;

  for (const key in elements) {
    const el = (elements as any)[key];
    if (!el) continue;

    if (el.__typename === "WindowElementPanel") {
      return el;
    }

    const nestedPanel = Object.values(el).find(
      (val: any) => val?.__typename === "WindowElementPanel",
    );

    if (nestedPanel) {
      return nestedPanel;
    }
  }

  return null;
});

const { diffedResults } = useEntityDiff(props, panel);

const columnConfigs = computed(() => {
  if (!diffedResults.value) return null;

  const { previousVersion, selectedVersion } = diffedResults.value;

  const hasPrevious =
    previousVersion && Object.keys(previousVersion).length > 0;
  const columns: { previous?: any; selected?: any  } = {}

  if (hasPrevious) {
    columns.previous = {
      entity: previousVersion,
      props: {
        identifiers: [previousVersion.id],
        previewLabel: "panel-labels.history-previous-version",
      },
    };
  }
  columns.selected = {
    entity: selectedVersion,
    props: {
      identifiers: [selectedVersion.id],
      previewLabel: hasPrevious
        ? "panel-labels.history-selected-version"
        : "panel-labels.history-original-version",
    },
  };

  isMultipleColumn.value = hasPrevious;
  return columns;
});
</script>
