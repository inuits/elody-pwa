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
import { type PromGraphElement } from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";

const props = defineProps<{
  element: PromGraphElement;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

watch(
  () => canvasRef.value,
  () => {
    if (canvasRef.value && !props.element.isCollapsed) fetchGraphData();
  }
);

const fetchGraphData = () => {
  // Chart.registry.plugins.register(ChartDatasourcePrometheusPlugin);
  Chart.register(Colors);

  if (canvasRef.value !== null) {
    if (props.element.label === "panel-labels.reading-amount") {
      new Chart(canvasRef.value, {
        type: "bar",
        data: {
          labels: [
            "do 12 okt",
            "vr 13 okt",
            "za 14 okt",
            "zo 15 okt",
            "ma 16 okt",
            "di 17 okt",
            "wo 18 okt",
          ],
          datasets: [
            {
              label: "lezingen",
              data: [45098, 32867, 29272, 20972, 41218, 40030, 37145],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    if (props.element.label === "panel-labels.duplicate-messages-amount") {
      new Chart(canvasRef.value, {
        type: "bar",
        data: {
          labels: [
            "do 12 okt",
            "vr 13 okt",
            "za 14 okt",
            "zo 15 okt",
            "ma 16 okt",
            "di 17 okt",
            "wo 18 okt",
          ],
          datasets: [
            {
              label: "dubbele lezingen",
              data: [0, 0, 0, 0, 0, 0, 0],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    if (props.element.label === "panel-labels.average-filesize") {
      new Chart(canvasRef.value, {
        type: "bar",
        data: {
          labels: [
            "do 12 okt",
            "vr 13 okt",
            "za 14 okt",
            "zo 15 okt",
            "ma 16 okt",
            "di 17 okt",
            "wo 18 okt",
          ],
          datasets: [
            {
              label: "anpr (kb)",
              data: [712, 750, 803, 696, 734, 768, 703],
              borderWidth: 1,
            },
            {
              label: "overview (kb)",
              data: [912, 954, 1001, 870, 890, 954, 902],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }
};
</script>
