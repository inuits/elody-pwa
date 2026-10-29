<template>
  <div
    role="dialog"
    :aria-label="title"
    class="bg-background-light rounded-overlay shadow-overlay p-3 text-table w-48"
  >
    <div
      v-if="loading"
      class="h-full w-full flex items-center justify-center py-4"
    >
      <spinner-loader theme="accent" dimensions="10" />
    </div>
    <div v-else-if="entity">
      <div class="flex justify-end items-center">
        <button
          type="button"
          class="viewer-button"
          :aria-label="t('actions.labels.close')"
          :title="t('actions.labels.close')"
          @click="$emit('close')"
        >
          <unicon :name="Unicons.Close.name" :height="18" />
        </button>
      </div>
      <div v-for="item of configuration" :key="item.key" class="pb-2">
        <p class="font-bold">{{ t(item.label) }}</p>
        <p>{{ entity.intialValues[item.key] || emptyValueLabel }}</p>
      </div>
      <router-link
        class="underline text-text-link hover:text-text-link-hover"
        :to="`/${entity.type}/${entity.id}`"
        target="_blank"
        >{{ t("map.open-in-new-tab") }}</router-link
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useEmptyValueLabel } from "@/composables/useEmptyValueLabel";

// The feature popup shared by WktMap, PointMap and HeatMap (map-viewer.md).
const props = defineProps<{
  entity?: { id: string; type: string; intialValues: Record<string, any> };
  configuration?: { key: string; label: string }[];
  loading: boolean;
}>();
const emit = defineEmits<{ (event: "close"): void }>();

const { t } = useI18n();
const emptyValueLabel = useEmptyValueLabel();

const title = computed(() => {
  const firstKey = props.configuration?.[0]?.key;
  return (firstKey && props.entity?.intialValues[firstKey]) || props.entity?.id;
});

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") emit("close");
};
onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>
