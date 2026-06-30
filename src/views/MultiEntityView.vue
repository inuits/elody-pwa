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
import { asString, getMappedSlug, getTitleOrNameFromEntity } from "@/helpers";
import { useImport } from "@/composables/useImport";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import MultiEntityColumn from "@/components/MultiEntityColumn.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const route = useRoute();
const { t } = useI18n();
const { loadDocument } = useImport();
const config: any = inject("config");
const {
  setRootRoute,
  clearBreadcrumbPath,
  getRouteBreadcrumbsOfEntity,
  iterateOverBreadcrumbs,
} = useBreadcrumbs(config);

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
  const breadcrumbsConfig: any[] = (route.meta as any)?.breadcrumbs ?? [];
  const primaryEntity =
    entities.value.find((entity) => entity.id === id.value) ??
    entities.value[0];
  if (!primaryEntity) return;

  clearBreadcrumbPath();
  setCurrentCrumb(breadcrumbsConfig, primaryEntity);

  let routeBreadcrumbs = breadcrumbsConfig.filter((entry) => !entry?.current);
  let parentEntity: any = primaryEntity;
  while (routeBreadcrumbs?.length && parentEntity) {
    parentEntity = await iterateOverBreadcrumbs(
      [parentEntity.id],
      routeBreadcrumbs,
      true,
      parentEntity,
    );
    if (!parentEntity) break;
    routeBreadcrumbs = getRouteBreadcrumbsOfEntity(getMappedSlug(parentEntity));
  }
};

const setCurrentCrumb = (
  breadcrumbsConfig: any[],
  primaryEntity: BaseEntity,
) => {
  const currentConfig = breadcrumbsConfig.find((entry) => entry?.current);

  const titleEntity =
    (currentConfig?.title?.type && findEntityByType(currentConfig.title.type)) ||
    primaryEntity;
  const title =
    (currentConfig?.title?.key &&
      (titleEntity as any)?.intialValues?.[currentConfig.title.key]) ||
    getTitleOrNameFromEntity(primaryEntity as any);

  const pill = currentConfig?.pillLabel
    ? {
        formatter: "pill",
        label: t(currentConfig.pillLabel),
        translationKey: t(currentConfig.pillLabel),
      }
    : (primaryEntity as any).intialValues?.typePillLabel;

  setRootRoute(primaryEntity.id, title, pill);
};

const findEntityByType = (type: string): BaseEntity | undefined => {
  const wanted = type.toLowerCase();
  return (
    entities.value.find((entity) => entity.type?.toLowerCase() === wanted) ??
    entities.value.find((entity) =>
      entity.type?.toLowerCase().startsWith(wanted),
    )
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
