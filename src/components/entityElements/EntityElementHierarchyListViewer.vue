<template>
  <entity-element-wrapper
    v-if="showHierarchyList"
    :isCollapsed="element.isCollapsed"
    :entity-id="entityId"
    :label="element.label"
    :use-vshow-instead-of-vif="true"
    class="flex flex-col h-full"
  >
    <template v-slot:content>
      <div class="mx-1 mb-1 pb-1 bg-neutral-lightest">
        <div
          v-show="isLoading"
          class="min-h-[20rem] w-full flex justify-center items-center"
        >
          <spinner-loader theme="accent" />
        </div>
        <BaseLibrary
          v-if="!isLoading && hierachyList.length > 0"
          list-item-route-name="SingleEntity"
          :baseLibraryMode="BaseLibraryModes.NormalBaseLibrary"
          :enable-advanced-filters="false"
          :enable-bulk-operations="false"
          :is-search-library="true"
          :predefinedEntities="hierachyList"
          :ignore-fetching-data="true"
          :has-sticky-bars="false"
        />
        <div
          v-if="!isLoading && hierachyList.length === 0"
          class="p-2 w-full flex justify-center items-center"
        >
          {{ t("search.noresult") }}
        </div>
      </div>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import type { Entitytyping } from "@/generated-types/queries";
import {
  BaseLibraryModes,
  type HierarchyListElement,
  type HierarchyRelationListOutput,
} from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { ref, onMounted, watch, provide } from "vue";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import { useFormHelper } from "@/composables/useFormHelper";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useI18n } from "vue-i18n";
import { usePermissions } from "@/composables/usePermissions";

const props = defineProps<{
  element: HierarchyListElement;
  entityId: string;
  can?: string[];
}>();

provide("mediafileViewerContext", props.element.customQuery);

const { loadDocument } = useImport();
const { getForm } = useFormHelper();
const { t } = useI18n();
const { fetchAdvancedPermission, setExtraVariables } = usePermissions();

const query = ref<any>(null);
const isLoading = ref<boolean>(true);
const hierachyList = ref<any[]>([]);
const showHierarchyList = ref<boolean>(false);

const getQuery = async () => {
  if (query.value) return query.value;
  return await loadDocument(props.element.customQuery);
};

const fetchAllHierarchy = async () => {
  const hierarchyList = props.element
    .hierarchyRelationList as HierarchyRelationListOutput[];

  if (!Array.isArray(hierarchyList) || hierarchyList.length === 0) {
    return;
  }

  const entityForm = getForm(props.entityId);
  if (!entityForm) return;

  const entities = [];

  try {
    for (const [index, relation] of hierarchyList.entries()) {
      const entityId =
        index === 0
          ? entityForm.values.relationValues[relation.key][0].key
          : entities[index - 1].relationValues[relation.key][0].key;

      if (!entityId) break;

      const entity = await fetchEntity(entityId, relation.entityType);
      if (!entity) break;

      entities.push(entity);
    }
  } finally {
    isLoading.value = false;
  }

  hierachyList.value = entities.reverse();
};

const fetchEntity = async (id: string, type: Entitytyping) => {
  const query = await getQuery();

  return apolloClient
    .query({
      query: query,
      variables: {
        id,
        preferredLanguage: "en",
        type,
      },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      return result.data.Entity;
    })
    .catch(() => {
      isLoading.value = false;
    });
};

onMounted(async () => {
  fetchAllHierarchy();
  await checkHierarchyListPermission();
});

const updatePermissionVariables = () => {
  setExtraVariables({
    parentEntityId: props.entityId,
    childEntityId: "",
  });
};

const checkHierarchyListPermission = async () => {
  if (!props.can) {
    showHierarchyList.value = true;
    return;
  }

  showHierarchyList.value = await fetchAdvancedPermission(props.can);
};

watch(
  () => props.entityId,
  () => {
    updatePermissionVariables();
  },
  { immediate: true },
);
</script>
