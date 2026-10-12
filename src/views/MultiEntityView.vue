<template>
  <div class="h-full w-full bg-background-normal overflow-y-auto p-4">
    <div
      v-if="loading"
      class="min-h-[30vh] flex justify-center items-center"
    >
      <spinner-loader theme="accent" />
    </div>
    <div
      v-else-if="!entities.length"
      class="min-h-[30vh] flex justify-center items-center text-text-light"
    >
      {{ t("multi-entity.no-results") }}
    </div>
    <div
      v-else
      class="flex flex-col lg:flex-row gap-4 h-full items-stretch"
    >
      <multi-entity-column
        v-for="entity in entities"
        :key="`${entity.id}:${renderVersions[entity.id] ?? 0}`"
        :entity="entity"
        :refetch="loadEntities"
        class="flex-1 min-w-0"
        @mutated-entity-updated="onMutatedEntityUpdated"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import type { ApolloClient } from "@apollo/client/core";
import type { BaseEntity, Entity } from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { asString } from "@/helpers";
import { useImport } from "@/composables/useImport";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import MultiEntityColumn from "@/components/MultiEntityColumn.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const route = useRoute();
const { t } = useI18n();
const { loadDocument } = useImport();
const config: any = inject("config");
const { determineBreadcrumbsFromRouteConfig } = useBreadcrumbs(config);

const entities = ref<BaseEntity[]>([]);
const loading = ref<boolean>(true);
const renderVersions = ref<Record<string, number>>({});

const id = computed(() => asString(route.params["id"]));
const queryName = computed<string | undefined>(
  () => (route.meta as any)?.queries?.getMultiEntity,
);

const fetchEntities = async (): Promise<BaseEntity[]> => {
  if (!queryName.value) return [];
  const document = await loadDocument(queryName.value);
  if (!document) return [];
  const result = await (apolloClient as ApolloClient<any>).query({
    query: document,
    variables: { id: id.value },
    fetchPolicy: "no-cache",
  });
  const data = Object.values(result.data ?? {})[0];
  return (Array.isArray(data) ? data : []).filter(Boolean) as BaseEntity[];
};

const loadEntities = async () => {
  loading.value = true;
  try {
    entities.value = await fetchEntities();
    await determineBreadcrumbs();
  } catch (error) {
    console.error("Failed to load multi-entity overview:", error);
    entities.value = [];
  } finally {
    loading.value = false;
  }
};

const determineBreadcrumbs = async () => {
  const primaryEntity =
    entities.value.find((entity) => entity.id === id.value) ??
    entities.value[0];
  if (!primaryEntity) return;
  await determineBreadcrumbsFromRouteConfig(
    (route.meta as any)?.breadcrumbs ?? [],
    primaryEntity as Entity,
    entities.value as Entity[],
  );
};

const onMutatedEntityUpdated = async (mutatedEntity: Entity) => {
  try {
    const refreshed = await fetchEntities();
    const updated = refreshed.find((e) => e.id === mutatedEntity.id);
    const index = entities.value.findIndex((e) => e.id === mutatedEntity.id);
    if (updated && index !== -1) {
      entities.value[index] = updated;
      renderVersions.value[mutatedEntity.id] =
        (renderVersions.value[mutatedEntity.id] ?? 0) + 1;
    }
  } catch (error) {
    console.error("Failed to refresh entity after save:", error);
  }
};

onMounted(loadEntities);
watch(id, loadEntities);
</script>
