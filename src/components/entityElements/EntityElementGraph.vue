<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :entity-id="entityId"
    :label="element.label"
    class="flex flex-col h-full"
    @toggle-element-collapse="
      (entityId, elementLabel) =>
        emit('toggleElementCollapse', entityId, elementLabel)
    "
  >
    <template v-slot:actions />
    <template v-slot:content>
      <div class="relative flex-1 min-h-0">
        <canvas
          v-show="!loading"
          class="bg-background-light"
          ref="canvasRef"
          id="chart"
        ></canvas>
      </div>
      <p
        v-if="loading"
        class="p-4 text-center bg-background-light text-text-body"
      >
        loading...
      </p>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import type {
  GetGraphDataQueryVariables,
  GraphElement,
} from "@/generated-types/queries";
import { fetchDocuments } from "@/composables/useDocumentFetcher";
import "chartjs-adapter-date-fns";
import Chart from "chart.js/auto";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { Colors } from "chart.js";
import { computed, inject, ref, watch, onMounted } from "vue";
import { apolloClient } from "@/main";

const props = defineProps<{
  element: GraphElement;
}>();

const emit = defineEmits<{
  (
    event: "toggleElementCollapse",
    entityId: string,
    elementLabel: string,
  ): void;
}>();

const loading = ref<boolean>(true);
const entityId = computed(() => inject("entityFormData").id);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const queryVariables: GetGraphDataQueryVariables = {
  id: entityId.value,
  graph: {
    datasource: props.element.datasource,
    dataset: {
      labels: props.element.dataset.labels,
      filter: {
        key: props.element.dataset.filter?.key,
        values: props.element.dataset.filter?.values,
      },
    },
    timeUnit: props.element.timeUnit,
    datapoints: props.element.datapoints,
    convert_to: props.element.convert_to,
  },
};

const fetchGraphData = async () => {
  if (props.element.isCollapsed || canvasRef.value === null) return;

  const documents = await fetchDocuments();
  const result = await apolloClient.query({
    query: documents.GetGraphDataDocument,
    variables: queryVariables,
    fetchPolicy: "no-cache",
  });

  if (canvasRef.value === null || !result?.data?.GraphData) return;
  Chart.register(Colors);
  chart?.destroy();

  try {
    chart = new Chart(canvasRef.value, {
      type: props.element.type,
      data: result.data.GraphData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    loading.value = false;
  } catch (error) {
    console.error("Error creating chart:", error);
    loading.value = false;
  }

  loading.value = false;
};

onMounted(() => fetchGraphData());

watch(
  () => canvasRef.value,
  () => {
    loading.value = true;
    if (canvasRef.value && !props.element.isCollapsed) fetchGraphData();
  },
);
</script>
