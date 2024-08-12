<template>
  <span :class="[entitiesLoading ? 'animate-pulse' : '']">
    <span v-if="entitiesLoading" class="w-[19px] h-[19px]"></span>
    {{ entitiesLoading ? "" : totalEntityCount }}
  </span>
</template>

<script lang="ts" setup>
import {
  Entitytyping,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import { inject, onMounted, watch } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { useTotalCount } from "@/composables/useTotalCount";

const props = defineProps<{
  filters: AdvancedFilterInput[];
  entityType: Entitytyping;
}>();

const apolloClient = inject(DefaultApolloClient);

const {
  setEntityType,
  setAdvancedFilters,
  getEntitiesTotalCount,
  entitiesLoading,
  totalEntityCount,
} = useTotalCount(apolloClient as ApolloClient<any>);

onMounted(() => {
  if (!props.filters?.length || !props.entityType) return;

  setEntityType(props.entityType);
  setAdvancedFilters(props.filters);
  getEntitiesTotalCount();
});

watch(
  () => props.entityType,
  () => {
    if (!props.entityType) return;
    setEntityType(props.entityType);
    getEntitiesTotalCount();
  }
);

watch(
  () => props.filters,
  () => {
    if (!props.filters?.length) return;
    setAdvancedFilters(props.filters);
    getEntitiesTotalCount();
  },
  { deep: true }
);
</script>
