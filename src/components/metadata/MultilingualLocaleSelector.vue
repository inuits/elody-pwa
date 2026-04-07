<template>
  <AdvancedDropdown
    v-if="multilingual?.isEnabled?.value && multilingual?.showSelector"
    v-model:model-value="multilingual.selectedLocale.value"
    :options="multilingual.localeOptions.value"
    :clearable="false"
    label-position="inline"
    style-type="defaultWithLightBorder"
  />
</template>

<script lang="ts" setup>
import { inject } from "vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import {
  getMultilingualProvideKey,
  type MultilingualFieldProvide,
} from "@/composables/useMultilingualField";

const props = defineProps<{
  fieldKey: string;
}>();

const multilingual = inject<MultilingualFieldProvide>(
  getMultilingualProvideKey(props.fieldKey),
  undefined,
);
</script>
