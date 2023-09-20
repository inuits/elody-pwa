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
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
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

const getQuery = () => {
  const pattern = /\$intialValues\.(\w+)/;
  const matches: RegExpExecArray | null = pattern.exec(props.element.query);
  if (matches) {
    const desiredWordBehind: string = matches[1];
    const valueFromMetadata = getValueForPanelMetadata(
      PanelType.Metadata,
      desiredWordBehind,
      useRoute().params.id
    );
    return props.element.query.replace(pattern, valueFromMetadata);
  } else {
    return props.element.query;
  }
};

onMounted(() => {
  Chart.registry.plugins.register(ChartDatasourcePrometheusPlugin);
  if (canvasRef.value !== null) {
    new Chart(canvasRef.value, {
      type: "line",
      plugins: [ChartDatasourcePrometheusPlugin],
      options: {
        plugins: {
          "datasource-prometheus": {
            prometheus: {
              endpoint: "/api/prom",
              baseURL: "/", // default value
            },
            query: getQuery(),
            timeRange: {
              type: "relative",
              // from 12 hours ago to now
              start: -12 * 60 * 60 * 1000,
              end: 0,
              step: 2000,
            },
          },
        },
      },
    });
  }
});
</script>
