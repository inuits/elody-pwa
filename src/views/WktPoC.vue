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

const wkt = ref<string>("");
</script>
