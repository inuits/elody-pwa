<template>
  <div class="grid grid-cols-2 gap-x-6">
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
import { computed, inject, type Ref } from "vue";
import type { ColumnList, Entity, Entitytyping } from "@/generated-types/queries";
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
  {}
);

const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (event: "togglePreviewComponent", entityId: string): void;
}>();

const injectedParent = inject<Ref<Entity | null>>("ParentEntityProvider");

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
      (val: any) => val?.__typename === "WindowElementPanel"
    );

    if (nestedPanel) {
      return nestedPanel;
    }
  }

  return null;
});

const { diffedResults } = useEntityDiff(props, injectedParent, panel);

const columnConfigs = computed(() => ({
  previousVersion: {
    entity: diffedResults.value?.previousVersion,
    props: {
      identifiers: [props.entityId],
      previewLabel: "panel-labels.history-old-version",
    }
  },
  currentVersion: {
    entity: diffedResults.value?.currentVersion,
    props: {
      identifiers: [props.parentEntityId],
      previewLabel: "panel-labels.history-new-version",
    }
  }
}));
</script>