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
import { ref, watch } from "vue";
import Chart from "chart.js/auto";
import { Colors } from "chart.js";
import "chartjs-adapter-date-fns";
import ChartDatasourcePrometheusPlugin from "chartjs-plugin-datasource-prometheus";
import { type PromGraphElement, PanelType } from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { getValueForPanelMetadata } from "@/helpers";
import { useRoute } from "vue-router";

const props = defineProps<{
  element: PromGraphElement;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const route = useRoute();

watch(
  () => canvasRef.value,
  () => {
    if (canvasRef.value && !props.element.isCollapsed) fetchGraphData();
  }
);

const getQueries = (): string[] => {
  const queries = props.element.query;
  const pattern = /\$intialValues\.(\w+)/;
  const formattedQueries: string[] = [];
  queries.forEach((query: string) => {
    const matches: RegExpExecArray | null = pattern.exec(query);
    if (matches) {
      const desiredWordBehind: string = matches[1];
      const valueFromMetadata = getValueForPanelMetadata(
        PanelType.Metadata,
        desiredWordBehind,
        route.params.id
      );
      formattedQueries.push(query.replace(pattern, valueFromMetadata));
    } else {
      formattedQueries.push(query);
    }
  });
  return formattedQueries;
};

const fetchGraphData = () => {
  Chart.registry.plugins.register(ChartDatasourcePrometheusPlugin);
  Chart.register(Colors);
  if (canvasRef.value !== null) {
    const chart: Chart = new Chart(canvasRef.value, {
      type: "bar",
      plugins: [ChartDatasourcePrometheusPlugin],
      options: {
        plugins: {
          colors: {
            forceOverride: true,
          },
          legend: {
            display: false,
          },
          "datasource-prometheus": {
            prometheus: {
              endpoint: "/api/prom",
              baseURL: "/", // default value
            },
            query: getQueries(),
            timeRange: {
              type: "relative",
              start: -120 * 60 * 60 * 1000,
              end: 0,
              step: 86400,
            },
          },
        },
      },
    });
    if (props.element.label === "panel-labels.average-filesize") {
      chart.options.plugins.legend.display = true;
    }
  }
};
</script>
