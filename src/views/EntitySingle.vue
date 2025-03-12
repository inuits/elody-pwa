<template>
  <div>
    <div
      v-if="!loading && entity"
      class="h-full w-full flex bg-neutral-lightest z-2 overflow-y-scroll pb-4"
    >
      <entity-form
        v-if="intialValues != 'no-values' && relationValues != 'no-values'"
        :key="entity.id"
        :intial-values="intialValues"
        :relation-values="relationValues"
        :uuid="entity.uuid"
        :id="entity.id"
        :type="entityType"
        :delete-query-options="entity.deleteQueryOptions"
      >
        <entity-column
          v-if="columnList != 'no-values'"
          :columnList="columnList"
          :identifiers="identifiers"
          :id="entity.id"
          :entity-type="entity.__typename"
        ></entity-column>
      </entity-form>
    </div>
    <div
      v-else-if="loading && viewOnly"
      class="min-h-[30vh] flex justify-center items-center"
    >
      <spinner-loader theme="accent" />
    </div>
    <div
      v-else
      class="h-full w-full flex bg-neutral-0 animate-pulse text-neutral-20 z-2"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  GetEntityByIdDocument,
  Permission,
  type ColumnList,
  type GetEntityByIdQueryVariables,
  type IntialValues,
  type GetEntityByIdQuery,
  type BaseEntity,
  type MediaFileEntity,
  type Column,
  MediaFileElementTypes,
  type EntityListElement,
  type SingleMediaFileElement,
  type Entity,
} from "@/generated-types/queries";
import EntityColumn from "@/components/EntityColumn.vue";
import EntityForm from "@/components/EntityForm.vue";
import {
  asString,
  getTitleOrNameFromEntity,
  getMappedSlug,
  mapUrlToEntityType,
  determineDefaultIntialValues,
} from "@/helpers";
import { reactive, ref, watch, inject, computed, onBeforeMount } from "vue";
import { auth } from "@/main";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { usePermissions } from "@/composables/usePermissions";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, onBeforeRouteUpdate, useRouter } from "vue-router";
import useEntitySingle from "@/composables/useEntitySingle";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const config: any = inject("config");
const router = useRouter();
const route = useRoute();

const { locale, t } = useI18n();
const { fetchUpdateAndDeletePermission } = usePermissions();
const {
  clearBreadcrumbPath,
  getRouteBreadcrumbsOfEntity,
  setRootRoute,
  iterateOverBreadcrumbs,
} = useBreadcrumbs(config);
const {
  isEdit,
  hideEditToggle,
  disableEditMode,
  showEditToggle,
  setRefetchFn,
} = useEditMode();

const {
  mediafileSelectionState,
  addMediafileSelectionStateContext,
  setEntityMediafiles,
} = useEntityMediafileSelector();
const mediafileViewerContexts = ref<string[]>([]);

const props = withDefaults(
  defineProps<{
    entityId?: string;
    entityType?: string;
    viewOnly: boolean;
  }>(),
  { viewOnly: false },
);

const id = ref<string[]>(asString(props.entityId || route.params["id"]));
const identifiers = ref<string[]>([]);
const loading = ref<boolean>(true);
const { getEditableMetadataKeys } = useFormHelper();

const entityType = computed(() => {
  if (props.entityType) return props.entityType;
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const queryVariables = reactive<GetEntityByIdQueryVariables>({
  id: id,
  type: entityType.value,
  preferredLanguage: locale.value,
});

watch(entityType, (value) => {
  queryVariables.type = value;
});

const { result, refetch, onError } = useQuery<GetEntityByIdQuery>(
  GetEntityByIdDocument,
  queryVariables,
  () => ({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  }),
);

onBeforeMount(() => {
  onError((error) => {
    if (error.message === "404: NOT FOUND")
      router.replace({ name: "NotFound" });
  });
});

const intialValues = ref<IntialValues | "no-values">("no-values");
const relationValues = ref<{ [key: string]: Object } | "no-values">(
  "no-values",
);
const columnList = ref<ColumnList | "no-values">("no-values");
const permissionToEdit = ref<boolean>();
const permissionToDelete = ref<boolean>();
const entity = ref<BaseEntity>();
const entityForBreadcrumb = ref<Entity>();

const addContextToState = (context: String): void => {
  mediafileViewerContexts.value.push(context);
  addMediafileSelectionStateContext(context);
};

const getElementsFromColumns = (columns: Column[]): any[] => {
  const elementsForColumns = columns.map((column: Column) =>
    Object.values(column.elements).filter(
      (element: any) => typeof element !== "string",
    ),
  );
  return elementsForColumns.flat();
};

const determineContextsForMediafileViewer = () => {
  if (columnList.value === "no-values") return;
  const columns: Column[] = Object.values(columnList.value)
    .map((value) => {
      if (typeof value !== "string") return value;
    })
    .filter((column: Column) => !!column);
  const elements = getElementsFromColumns(columns);
  Object.values(elements).forEach(
    (element: EntityListElement | SingleMediaFileElement) => {
      if (element?.__typename === "SingleMediaFileElement") {
        addContextToState("SingleMediaFileElement");
        setEntityMediafiles("SingleMediaFileElement", [entity.value]);
      }
      if (
        element?.__typename === "EntityListElement" &&
        element?.type === MediaFileElementTypes.Media
      ) {
        addContextToState(element.customQueryFilters);
      }
    },
  );
};

router.beforeEach(() => {
  if (isEdit) disableEditMode();
});

onBeforeRouteUpdate(async (to: any) => {
  queryVariables.id = to.params.id;
  queryVariables.type = entityType.value;
  intialValues.value = "no-values";
  relationValues.value = "no-values";
  columnList.value = "no-values";
  disableEditMode();
});

watch(
  () => result.value,
  (newvalue, oldvalue) => {
    entity.value = result.value?.Entity as BaseEntity;
    if (!entity.value && !oldvalue) router.push("/notFound");
    if (!entity.value || !entity.value.intialValues) return;
    useEntitySingle().setEntityUuid(entity.value.uuid || entity.value.id);
    entityForBreadcrumb.value = entity.value;
    if (!props.viewOnly) determineBreadcrumbs();

    identifiers.value = [entity.value.uuid, entity.value.id];
    intialValues.value = determineDefaultIntialValues(
      entity.value.intialValues,
      entity.value.entityView,
    );
    relationValues.value = entity.value.relationValues;
    columnList.value = entity.value.entityView;
    determineContextsForMediafileViewer();

    if (typeof columnList.value !== "string") {
      getEditableMetadataKeys(columnList.value, entity.value.uuid);
    }

    if (entity.value.type.toLowerCase() === "mediafile") {
      mediafileSelectionState.value[
        mediafileViewerContexts.value[0]
      ].mediafiles = [entity.value as MediaFileEntity];
      mediafileSelectionState.value[
        mediafileViewerContexts.value[0]
      ].selectedMediafile = entity.value as MediaFileEntity;
    }

    const mappings = fetchUpdateAndDeletePermission(
      entity.value.id,
      entity.value.type,
    );
    if (mappings) {
      mappings.then((result) => {
        permissionToEdit.value = result.get(Permission.Canupdate);
        permissionToDelete.value = result.get(Permission.Candelete);
      });
    }
    watch(
      () => permissionToDelete.value || permissionToEdit.value,
      () => {
        if (props.viewOnly) {
          hideEditToggle();
          return;
        }
        if (auth.isAuthenticated.value) {
          if (permissionToEdit.value && permissionToDelete.value)
            showEditToggle("edit-delete");
          else if (permissionToEdit.value && !permissionToDelete.value)
            showEditToggle("edit");
          else if (permissionToDelete.value && !permissionToEdit.value) {
            showEditToggle("delete");
          } else hideEditToggle();
        } else hideEditToggle();
      },
    );
    setRefetchFn(refetch);
    loading.value = false;
  },
);

const determineBreadcrumbs = async () => {
  clearBreadcrumbPath();
  setRootRoute(
    entityForBreadcrumb.value.id,
    getTitleOrNameFromEntity(entityForBreadcrumb.value),
  );
  do {
    const routeBreadcrumbs = getRouteBreadcrumbsOfEntity(
      getMappedSlug(entityForBreadcrumb.value),
    );
    if (!routeBreadcrumbs) break;
    entityForBreadcrumb.value = await iterateOverBreadcrumbs(
      [entityForBreadcrumb.value.id],
      routeBreadcrumbs,
      true,
    );
  } while (entityForBreadcrumb.value);
};

watch(
  () => locale.value,
  (newLocale: string) => {
    queryVariables.preferredLanguage = newLocale;
    refetch(queryVariables);
  },
);
</script>
