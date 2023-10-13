<template>
  <div class="text-sm pl-4">
    <p class="text-text-light w-full">{{ t(label || "") }}</p>
    <div v-if="Array.isArray(readableValue)">
      <div v-for="item in readableValue" :key="item">
        <p v-if="!stringIsUrl(item)">{{ item }}</p>
        <a v-else class="underline" target="_blank" :href="item">{{ item }}</a>
      </div>
      <div v-if="readableValue.length == 0">-</div>
    </div>
    <div v-else>
      <a
        v-if="stringIsUrl(readableValue)"
        class="underline"
        target="_blank"
        :href="readableValue"
        >{{ readableValue }}</a
      >
      <p v-else-if="stringIsHtml(readableValue)" v-html="readableValue"></p>
      <p v-else>{{ (readableValue as string) || "-" }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Unit } from "@/generated-types/queries";
import {
  convertUnitToReadbleFormat,
  stringIsUrl,
  stringIsHtml,
} from "@/helpers";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  label?: string;
  value?: any;
  unit?: string;
}>();

const { t } = useI18n();

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});
</script>
