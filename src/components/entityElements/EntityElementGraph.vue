<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="flex flex-col h-full"
  >
    <template v-slot:actions />
    <template v-slot:content>
      <canvas
        v-if="!element.isCollapsed"
        class="bg-neutral-0"
        ref="canvasRef"
        id="chart"
      ></canvas>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import {
  GetGraphDataDocument,
  type GetGraphDataQueryVariables,
  type GraphElement,
} from "@/generated-types/queries";
import "chartjs-adapter-date-fns";
import Chart from "chart.js/auto";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { asString } from "@/helpers";
import { Colors } from "chart.js";
import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";

const props = defineProps<{
  element: GraphElement;
}>();

const entityId = computed(() => asString(useRoute().params["id"]));
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
  })
);
onResult((result) => {
  if (canvasRef.value === null || !result?.data?.GraphData) return;
  Chart.register(Colors);
  chart?.destroy();

  chart = new Chart(canvasRef.value, {
    type: props.element.type,
    data: result.data.GraphData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});

watch(
  () => canvasRef.value,
  () => {
    if (canvasRef.value && !props.element.isCollapsed) refetch();
  }
);
</script>
