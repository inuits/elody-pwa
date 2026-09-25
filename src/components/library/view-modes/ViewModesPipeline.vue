<template>
  <div class="h-full" data-cy="view-modes-pipeline">
    <div
      v-if="entitiesLoading && processedEntities.length === 0"
      class="flex gap-6 p-10"
    >
      <div
        v-for="index in 3"
        :key="`pipeline-skeleton-${index}`"
        class="w-[272px] h-40 rounded border border-accent-highlight bg-background-light animate-pulse"
      ></div>
    </div>
    <PipelineCanvas
      v-else-if="processedEntities.length > 0"
      :content-width="layout.contentWidth"
      :content-height="layout.contentHeight"
      :edges="canvasEdges"
      :focus="flowStart"
    >
      <PipelineNode
        v-for="item in processedEntities"
        :key="item.id"
        :x="layout.positions[item.id]?.x ?? 0"
        :y="layout.positions[item.id]?.y ?? 0"
        :width="cardWidth"
        :card-height="heightOf(item.id)"
        :inputs="portsOf(item.id).inputs"
        :outputs="portsOf(item.id).outputs"
        @measured="(height) => setMeasuredHeight(item.id, height)"
      >
        <ListItem
          :item-id="item.id"
          :item-type="item.type"
          :bulk-operations-context="bulkOperationsContext"
          :context-menu-actions="item.contextMenu"
          :entityTypename="item.entityTypename"
          :teaser-metadata="item.teaserMetadata"
          :intialValues="item.intialValues"
          :relationValues="item.relationValues"
          :loading="entitiesLoading"
          :is-disabled="item.isDisabled"
          :relation="item.relation"
          :relation-type="relationType"
          :has-selection="enableSelection"
          :base-library-mode="baseLibraryMode"
          :is-enable-navigation="enableNavigation"
          view-mode="pipeline"
          :refetch-entities="refetchEntities"
          :preview-component-enabled="false"
          :preview-component-current-active="false"
          :preview-component-feature-enabled="false"
        />
      </PipelineNode>
    </PipelineCanvas>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import {
  BaseLibraryModes,
  type ConfigItem,
  type Entity,
  RelationActions,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import PipelineCanvas from "@/components/library/view-modes/pipeline/PipelineCanvas.vue";
import PipelineNode from "@/components/library/view-modes/pipeline/PipelineNode.vue";
import {
  layoutPipeline,
  PIPELINE_CARD_WIDTH,
} from "@/components/library/view-modes/composables/usePipelineLayout";
import { buildPipelineGraph } from "@/components/library/view-modes/composables/useEntityPipelineGraph";
import { pipelineViewConfigFrom } from "@/components/library/view-modes/composables/usePipelineViewConfig";
import { useEntityListHelpers } from "@/components/library/view-modes/composables/useEntityListHelpers";
import { useFormHelper } from "@/composables/useFormHelper";
import { formatTeaserMetadata, getMappedSlug } from "@/helpers";
import type { Context } from "@/composables/useBulkOperations";

// Pipeline view mode: the same entities the list and grid render, positioned
// as a left-to-right flow along the relations the view config declares
// (`edgeRelations`). A view mode, not an editor — no positions are persisted
// and the cards are the existing ListItem.
const props = withDefaults(
  defineProps<{
    entities: Entity[];
    entitiesLoading: boolean;
    bulkOperationsContext: Context | undefined;
    listItemRouteName: string;
    openEntityInDetailModal?: boolean;
    enableNavigation?: boolean;
    parentEntityIdentifiers?: string[];
    relationType?: string;
    enableSelection?: boolean;
    baseLibraryMode?: BaseLibraryModes;
    config?: ConfigItem[];
    refetchEntities?: () => Promise<void>;
    setPaginationLimit?: (limit: number, forceFetch?: boolean) => void;
    allowedActionsOnRelations?: RelationActions[];
  }>(),
  {
    openEntityInDetailModal: false,
    enableNavigation: true,
    parentEntityIdentifiers: () => [],
    relationType: undefined,
    enableSelection: true,
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    config: undefined,
    refetchEntities: undefined,
    setPaginationLimit: undefined,
    allowedActionsOnRelations: () => [],
  },
);

const cardWidth = PIPELINE_CARD_WIDTH;
const DEFAULT_CARD_HEIGHT = 160;

const refEntities = ref<Entity[]>(props.entities);
watch(
  () => props.entities,
  (newValue) => (refEntities.value = newValue ?? []),
  { immediate: true },
);

const { findRelation } = useFormHelper();
const { isEntityDisabled, getContextMenu } = useEntityListHelpers(
  props,
  refEntities,
  ref(false),
  () => {},
);

const viewConfig = computed(() => pipelineViewConfigFrom(props.config));

// A pipeline shows the whole flow — no pager, like the map mode.
onMounted(() =>
  props.setPaginationLimit?.(viewConfig.value.paginationLimit, true),
);
onUnmounted(() => props.setPaginationLimit?.(20, true));

const processedEntities = computed(() => {
  const parentId = props.parentEntityIdentifiers[0];
  return refEntities.value.map((entity) => ({
    originalEntity: entity,
    id: entity.id,
    type: entity.type,
    contextMenu: getContextMenu(entity),
    entityTypename: getMappedSlug(entity),
    teaserMetadata: formatTeaserMetadata(
      entity.teaserMetadata,
      entity.intialValues,
    ),
    intialValues: entity.intialValues,
    relationValues: entity.relationValues,
    isDisabled: isEntityDisabled(entity),
    relation: findRelation(entity.id, props.relationType as string, parentId),
  }));
});

const graph = computed(() =>
  buildPipelineGraph(
    processedEntities.value.map((item) => ({
      id: item.id,
      entity: item.originalEntity,
    })),
    viewConfig.value,
  ),
);

const portsOf = (id: string) => {
  const node = graph.value.nodes.find((n) => n.id === id);
  return { inputs: node?.inputs ?? [], outputs: node?.outputs ?? [] };
};

// Heights are measured, not guessed: nodes report their rendered height and
// the layout recomputes so edges land on real port dots.
const measuredHeights = reactive<Record<string, number>>({});
const setMeasuredHeight = (id: string, height: number) => {
  if (measuredHeights[id] !== height) measuredHeights[id] = height;
};
const heightOf = (id: string) => measuredHeights[id] ?? DEFAULT_CARD_HEIGHT;

const layout = computed(() =>
  layoutPipeline(
    graph.value.nodes.map((node) => ({
      id: node.id,
      height: heightOf(node.id),
      sources: node.sources,
    })),
  ),
);

// The first card of the first column: where a reader starts following the
// flow, and what the canvas keeps in view when everything does not fit.
const flowStart = computed(() => {
  const root = graph.value.nodes.find(
    (node) => layout.value.positions[node.id]?.col === 0,
  );
  const position = root && layout.value.positions[root.id];
  if (!root || !position) return undefined;
  return {
    x: position.x + cardWidth / 2,
    y: position.y + heightOf(root.id) / 2,
  };
});

const portCentreY = (
  nodeId: string,
  ports: { id: string }[],
  portId: string,
): number => {
  const position = layout.value.positions[nodeId];
  if (!position) return 0;
  const index = Math.max(
    0,
    ports.findIndex((port) => port.id === portId),
  );
  const count = Math.max(1, ports.length);
  return position.y + (heightOf(nodeId) * (index + 0.5)) / count;
};

const canvasEdges = computed(() =>
  graph.value.edges
    .filter(
      (edge) =>
        layout.value.positions[edge.from] && layout.value.positions[edge.to],
    )
    .map((edge) => {
      const outputs = portsOf(edge.from).outputs;
      return {
        id: edge.id,
        x1: layout.value.positions[edge.from].x + cardWidth,
        y1: portCentreY(edge.from, outputs, outputs[0]?.id ?? ""),
        x2: layout.value.positions[edge.to].x,
        y2: portCentreY(edge.to, portsOf(edge.to).inputs, edge.relationType),
      };
    }),
);
</script>
