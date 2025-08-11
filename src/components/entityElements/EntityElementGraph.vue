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
      <canvas
        v-show="!loading"
        class="bg-background-light"
        ref="canvasRef"
        id="chart"
      ></canvas>
      <p v-if="loading" class="p-4 text-center bg-background-light text-text-body">
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
import { GetGraphDataDocument } from "@/generated-types/queries";
import "chartjs-adapter-date-fns";
import Chart from "chart.js/auto";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { Colors } from "chart.js";
import { computed, inject, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";

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
const { onResult, refetch } = useQuery(
  GetGraphDataDocument,
  queryVariables,
  () => ({
    enabled: !props.element.isCollapsed,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  }),
);
onResult((result) => {
  if (canvasRef.value === null || !result?.data?.GraphData) return;
  Chart.register(Colors);
  chart?.destroy();

  chart = new Chart(canvasRef.value, {
    type: props.element.type,
    data: result.data.GraphData,
    options: {
      onResize: () => {
        for (let id in Chart.instances) Chart.instances[id].resize();
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  loading.value = false;
});

watch(
  () => canvasRef.value,
  () => {
    loading.value = true;
    if (canvasRef.value && !props.element.isCollapsed) refetch();
  },
);
</script>
