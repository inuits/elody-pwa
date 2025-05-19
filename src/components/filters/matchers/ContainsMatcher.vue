<template>
  <BaseInputTextNumberDatetime
    v-model="input"
    input-style="default"
    type="text"
    :placeholder="t('filters.matcher-placeholders.keyword')"
  />
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { defineEmits, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    filter: FilterListItem;
    lastTypedValue: string | number;
  }>(),
  {
    lastTypedValue: "",
  },
);

const emit = defineEmits<{
  (event: "updateValue", inputValue: string | number): void;
  (event: "newInputValue", inputValue: string | number): void;
}>();

const { t } = useI18n();

const input = ref<string | number>("");

const setVariablesFromInput = () => {
  input.value = props.filter.inputFromState?.value || "";
};

onMounted(() => {
  setVariablesFromInput();

  if (props.lastTypedValue) {
    input.value = props.lastTypedValue;
    emitNewValue();
  }
});

const emitNewValue = () => {
  emit("updateValue", input.value);
  emit("newInputValue", input.value);
};

watch(input, () => {
  emitNewValue();
});
</script>

<style></style>
