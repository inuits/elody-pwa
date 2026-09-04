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
      v-else
      :content-width="layout.contentWidth"
      :content-height="layout.contentHeight"
      :edges="canvasEdges"
    >
      <PipelineGhostNode
        v-if="processedEntities.length === 0"
        variant="empty"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        @add="emit('addComponent')"
      />
      <template v-else>
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
          @add-consumer="(port) => emit('addConsumer', port)"
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
        <PipelineGhostNode
          v-if="suggestion"
          variant="suggestion"
          class="absolute"
          :style="{
            left: `${layout.positions[GHOST_ID]?.x ?? 0}px`,
            top: `${layout.positions[GHOST_ID]?.y ?? 0}px`,
          }"
          :name="suggestion.name"
          :consumes="suggestion.consumes"
          @add="emit('addComponent')"
        />
      </template>
    </PipelineCanvas>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import {
  BaseLibraryModes,
  type Entity,
  RelationActions,
} from "@/generated-types/queries";
import ListItem from "@/components/ListItem.vue";
import PipelineCanvas from "@/components/library/view-modes/pipeline/PipelineCanvas.vue";
import PipelineNode from "@/components/library/view-modes/pipeline/PipelineNode.vue";
import PipelineGhostNode from "@/components/library/view-modes/pipeline/PipelineGhostNode.vue";
import {
  layoutPipeline,
  PIPELINE_CARD_WIDTH,
} from "@/components/library/view-modes/composables/usePipelineLayout";
import { buildPipelineGraph } from "@/components/library/view-modes/composables/useEntityPipelineGraph";
import { pipelineViewConfigFrom } from "@/components/library/view-modes/composables/usePipelineViewConfig";
import { useEntityListHelpers } from "@/components/library/view-modes/composables/useEntityListHelpers";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  enrichDynamicFormConfig,
  formatTeaserMetadata,
  getMappedSlug,
} from "@/helpers";
import type { Context } from "@/composables/useBulkOperations";
import type { ConfigItem } from "@/generated-types/queries";

// Pipeline view mode: the same entities the table and grid render, positioned
// as a left-to-right flow computed from metadata the entities already carry.
// A view mode, not an editor — no positions are persisted, cards are the
// existing ListItem, and add/configure/connect stay in their existing flows.
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
    // top shape-matching catalog suggestion for the ghost card; the host
    // passes it in — this view mode does no catalog querying of its own
    suggestion?: { name: string; consumes?: string; afterId?: string } | null;
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
    suggestion: null,
  },
);

import type { PipelinePort } from "@/components/library/view-modes/composables/useEntityPipelineGraph";

const emit = defineEmits<{
  (event: "addComponent"): void;
  (event: "addConsumer", port: PipelinePort): void;
}>();

const GHOST_ID = "__pipeline-suggestion__";
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

// The declared view-mode config: which relations are edges, and the page
// size. The connections/contracts metadata names are fixed platform
// conventions, not configuration.
const viewConfig = computed(() => pipelineViewConfigFrom(props.config));

// A pipeline shows the whole chain — no pager, like the map mode. The limit
// is a real number (config override or the default 1000), because a literal
// 0 is an empty page to the backing store, not "everything".
const paginationLimit = computed<number>(() =>
  viewConfig.value.paginationLimit > 0 ? viewConfig.value.paginationLimit : 1000,
);
onMounted(() => props.setPaginationLimit?.(paginationLimit.value, true));
onUnmounted(() => props.setPaginationLimit?.(20, true));

const processedEntities = computed(() => {
  const parentId = props.parentEntityIdentifiers[0];

  return refEntities.value.map((entity) => {
    const relation = findRelation(
      entity.id,
      props.relationType as string,
      parentId,
    );

    let enrichedTeaserMetadata = entity.teaserMetadata;
    let enrichedIntialValues = entity.intialValues;
    if ((entity as any).dynamicFormConfig?.panels) {
      const relationObj =
        relation !== "no-relation-found"
          ? (relation as { relation: any }).relation
          : null;
      const result = enrichDynamicFormConfig(
        entity.teaserMetadata,
        entity.intialValues,
        (entity as any).dynamicFormConfig,
        relationObj,
      );
      enrichedTeaserMetadata = result.teaserMetadata;
      enrichedIntialValues = result.intialValues;
    }

    return {
      originalEntity: entity,
      id: entity.id,
      type: entity.type,
      contextMenu: getContextMenu(entity),
      entityTypename: getMappedSlug(entity),
      teaserMetadata: formatTeaserMetadata(
        enrichedTeaserMetadata,
        enrichedIntialValues,
      ),
      intialValues: enrichedIntialValues,
      relationValues: entity.relationValues,
      isDisabled: isEntityDisabled(entity),
      relation,
      values: enrichedIntialValues as Record<string, any>,
    };
  });
});

const graph = computed(() =>
  buildPipelineGraph(
    processedEntities.value.map((item) => ({
      id: item.id,
      entity: item.originalEntity,
      values: item.values,
      relation:
        item.relation !== "no-relation-found"
          ? (item.relation as any)
          : undefined,
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

const layout = computed(() => {
  const nodes = graph.value.nodes.map((node) => ({
    id: node.id,
    height: heightOf(node.id),
    sources: node.sources,
  }));
  if (props.suggestion && processedEntities.value.length > 0) {
    const after =
      props.suggestion.afterId &&
      nodes.some((n) => n.id === props.suggestion!.afterId)
        ? [props.suggestion.afterId]
        : [nodes[nodes.length - 1].id];
    nodes.push({ id: GHOST_ID, height: heightOf(GHOST_ID), sources: after });
  }
  return layoutPipeline(nodes);
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

const canvasEdges = computed(() => {
  const edges = graph.value.edges
    .filter(
      (edge) =>
        layout.value.positions[edge.from] && layout.value.positions[edge.to],
    )
    .map((edge) => {
      const { inputs } = portsOf(edge.to);
      const producerPorts = portsOf(edge.from).outputs;
      return {
        id: edge.id,
        x1: layout.value.positions[edge.from].x + cardWidth,
        y1: portCentreY(
          edge.from,
          producerPorts.length > 0 ? producerPorts : [{ id: edge.fromPort }],
          edge.fromPort,
        ),
        x2: layout.value.positions[edge.to].x,
        y2: portCentreY(
          edge.to,
          inputs.length > 0 ? inputs : [{ id: edge.toPort }],
          edge.toPort,
        ),
        status: edge.status,
        label: edge.label,
      };
    });

  const ghostPosition = layout.value.positions[GHOST_ID];
  if (props.suggestion && ghostPosition) {
    const sourceId =
      props.suggestion.afterId &&
      layout.value.positions[props.suggestion.afterId]
        ? props.suggestion.afterId
        : processedEntities.value[processedEntities.value.length - 1]?.id;
    const sourcePosition = sourceId
      ? layout.value.positions[sourceId]
      : undefined;
    if (sourceId && sourcePosition) {
      edges.push({
        id: `${sourceId}->${GHOST_ID}`,
        x1: sourcePosition.x + cardWidth,
        y1: sourcePosition.y + heightOf(sourceId) / 2,
        x2: ghostPosition.x,
        y2: ghostPosition.y + heightOf(GHOST_ID) / 2,
        status: "suggested" as const,
        label: undefined,
      });
    }
  }
  return edges;
});

</script>
