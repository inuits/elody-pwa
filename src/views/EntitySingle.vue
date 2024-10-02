<template>
  <div>
    <div
      v-if="!loading && entity"
      class="pl-24 h-full w-full flex fixed top-0 bg-neutral-lightest pt-24 left-0 z-2"
    >
      <entity-form
        v-if="intialValues != 'no-values' && relationValues != 'no-values'"
        :intial-values="intialValues"
        :relation-values="relationValues"
        :uuid="entity.uuid"
        :type="String(route.params['type'])"
        :delete-query-options="entity.deleteQueryOptions"
      >
        <entity-column
          v-if="columnList != 'no-values'"
          :columnList="columnList"
          :identifiers="identifiers"
          :uuid="entity.uuid"
        ></entity-column>
      </entity-form>
    </div>
    <div
      v-else
      class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0 animate-pulse text-neutral-20 z-2"
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
  Entity,
} from "@/generated-types/queries";
import EntityColumn from "@/components/EntityColumn.vue";
import EntityForm from "@/components/EntityForm.vue";
import { asString } from "@/helpers";
import { reactive, ref, watch, inject } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { usePermissions } from "@/composables/usePermissions";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, onBeforeRouteUpdate, useRouter } from "vue-router";
import useEntitySingle from "@/composables/useEntitySingle";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";

const config: any = inject("config");
const router = useRouter();
const route = useRoute();
const auth = useAuth();
const { locale, t } = useI18n();
const { fetchUpdateAndDeletePermission } = usePermissions();
const {
  clearBreadcrumbPath,
  getRouteBreadcrumbsOfEntity,
  addTitleToBreadcrumb,
  setRootRoute,
  iterateOverBreadcrumbs
} = useBreadcrumbs(config);
const {
  isEdit,
  hideEditToggle,
  disableEditMode,
  showEditToggle,
  setRefetchFn,
} = useEditMode();

const { mediafileSelectionState } = useEntityMediafileSelector();
const id = asString(route.params["id"]);
const identifiers = ref<string[]>([]);
const loading = ref<boolean>(true);
const { getEditableMetadataKeys } = useFormHelper();

const queryVariables = reactive<GetEntityByIdQueryVariables>({
  id: id,
  type: String(route.params["type"]),
  preferredLanguage: locale.value,
});
const { result, refetch } = useQuery<GetEntityByIdQuery>(
  GetEntityByIdDocument,
  queryVariables,
  () => ({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  })
);

const intialValues = ref<IntialValues | "no-values">("no-values");
const relationValues = ref<{ [key: string]: Object } | "no-values">(
  "no-values"
);
const columnList = ref<ColumnList | "no-values">("no-values");
const permissionToEdit = ref<boolean>();
const permissionToDelete = ref<boolean>();
const entity = ref<BaseEntity>();
const entityForBreadcrumb = ref<BaseEntity>();

router.beforeEach(() => {
  if (isEdit) disableEditMode();
});

onBeforeRouteUpdate(async (to: any) => {
  queryVariables.id = to.params.id;
  queryVariables.type = to.params.type;
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
    determineBreadcrumbs();

    identifiers.value = [entity.value.uuid, entity.value.id];
    intialValues.value = entity.value.intialValues;
    relationValues.value = entity.value.relationValues;
    columnList.value = entity.value.entityView;

    if (typeof columnList.value !== "string") {
      getEditableMetadataKeys(columnList.value, entity.value.uuid);
    }

    if (entity.value.type.toLowerCase() === "mediafile") {
      mediafileSelectionState.mediafiles = [entity.value as MediaFileEntity];
      mediafileSelectionState.selectedMediafile =
        entity.value as MediaFileEntity;
    }

    const mappings = fetchUpdateAndDeletePermission(
      entity.value.id,
      entity.value.type
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
        if (auth.isAuthenticated.value) {
          if (permissionToEdit.value && permissionToDelete.value)
            showEditToggle("delete");
          else if (permissionToEdit.value && !permissionToDelete.value)
            showEditToggle("edit");
          else hideEditToggle();
        } else hideEditToggle();
      }
    );
    setRefetchFn(refetch);
    loading.value = false;
  }
);

const determineBreadcrumbs = async () => {
  clearBreadcrumbPath();
  setRootRoute(entityForBreadcrumb.value.id, getTitleOrNameFromEntity(entityForBreadcrumb.value));
  do {
    const routeBreadcrumbs = getRouteBreadcrumbsOfEntity(entityForBreadcrumb.value.type);
    if (!routeBreadcrumbs) break;
    entityForBreadcrumb.value = await iterateOverBreadcrumbs([entityForBreadcrumb.value.id], routeBreadcrumbs);
    if (entityForBreadcrumb.value)
      addTitleToBreadcrumb(getTitleOrNameFromEntity(entityForBreadcrumb.value));
  } while (entityForBreadcrumb.value)
}

const getTitleOrNameFromEntity = (entity: Entity): string => {
  return entity.intialValues.title || entity.intialValues.name || entity.intialValues.filename || entity.intialValues.id;
}

watch(
  () => locale.value,
  (newLocale: string) => {
    queryVariables.preferredLanguage = newLocale;
    refetch(queryVariables);
  }
);
</script>
