<template>
  <div class="text-sm">
    <div v-if="Array.isArray(readableValue)">
      <div v-for="item in readableValue" :key="item">
        <p v-if="!stringIsUrl(item)">{{ item }}</p>
        <a v-else class="underline" target="_blank" :href="item">{{
          t(linkText) || item
        }}</a>
      </div>
      <div v-if="readableValue.length == 0">-</div>
    </div>
    <div v-else>
      <div class="flex items-center" v-if="stringIsUrl(readableValue)">
        <div class="pr-2">
          <unicon
            v-if="linkIcon && Unicons[linkIcon]"
            :name="Unicons[linkIcon].name"
            height="12"
          />
          <CustomIcon v-else-if="linkIcon" :icon="linkIcon" :size="12" />
        </div>
        <a class="underline" target="_blank" :href="readableValue">{{
          t(linkText) || readableValue
        }}</a>
      </div>

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
import { Unicons } from "@/types";
import CustomIcon from "@/components/CustomIcon.vue";

const props = defineProps<{
  label?: string;
  value?: any;
  unit?: string;
  linkText?: string;
  linkIcon?: string;
}>();

const { t } = useI18n();

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, props.value ?? "");
});
</script>
