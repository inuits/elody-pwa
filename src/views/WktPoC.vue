<template>
  <div class="px-8">
    <BaseInputTextNumberDatetime
      v-model:model-value="wkt"
      type="textarea"
      input-style="default"
    />
    <WktOpenLayer :wkt="wkt" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import WktOpenLayer from "@/components/poc/WktOpenLayer.vue";

const wkt = ref<string>(
  "MULTIPOLYGON Z(((60.0 55.0 300, 80.0 55.0 350, 80.0 42.0 400, 60.0 42.0 320, 60.0 55.0 300)), ((69.0 43.5 750, 80.0 43.5 800, 80.0 39.0 900, 69.0 39.0 850, 69.0 43.5 750)), ((55.0 45.0 200, 70.0 45.0 250, 70.0 37.0 300, 55.0 37.0 280, 55.0 45.0 200)))",
);
</script>
