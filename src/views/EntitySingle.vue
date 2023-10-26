<template>
  <div>
    <div
      v-if="!loading"
      class="pl-24 h-full w-full flex fixed top-0 bg-neutral-lightest pt-24 left-0"
    >
      <entity-form
        v-if="intialValues != 'no-values' && relationValues != 'no-values'"
        :intial-values="intialValues"
        :relation-values="relationValues"
      >
        <entity-column
          v-if="columnList != 'no-values'"
          :columnList="columnList"
          :identifiers="identifiers"
        ></entity-column>
      </entity-form>
    </div>
    <div
      v-else
      class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0 animate-pulse text-neutral-20"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  GetEntityByIdDocument,
  type ColumnList,
  type GetEntityByIdQueryVariables,
  type IntialValues,
  type RelationValues,
  type GetEntityByIdQuery,
  type BaseEntity,
} from "@/generated-types/queries";
import EntityColumn from "@/components/EntityColumn.vue";
import EntityForm from "@/components/EntityForm.vue";
import useEditMode from "@/composables/useEdit";
import { asString } from "@/helpers";
import { reactive, ref, watch, inject } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useQuery } from "@vue/apollo-composable";
import { useRoute, onBeforeRouteUpdate, useRouter } from "vue-router";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";

const config: any = inject("config");
const router = useRouter();
const route = useRoute();
const auth = useAuth();
const { locale, t } = useI18n();

const id = asString(route.params["id"]);
const identifiers = ref<string[]>([]);
const loading = ref<boolean>(true);
const { showEditToggle, disableEditMode, isEdit, setRefetchFn } = useEditMode();
const { setCurrentRouteTitle, addVisitedRoute, currentRouteTitle } =
  useBreadcrumbs(config, t);
const { getEditableMetadataKeys } = useFormHelper();

const queryVariables = reactive<GetEntityByIdQueryVariables>({
  id: id,
  type: String(route.meta.entityType),
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
const relationValues = ref<RelationValues | "no-values">("no-values");
const columnList = ref<ColumnList | "no-values">("no-values");

router.beforeEach(() => {
  if (isEdit) disableEditMode();
});

onBeforeRouteUpdate(async (to: any) => {
  queryVariables.id = to.params.id;
  intialValues.value = "no-values";
  relationValues.value = "no-values";
  columnList.value = "no-values";
  disableEditMode();
});

watch(
  () => result.value,
  () => {
    const entity: BaseEntity = result.value?.Entity as BaseEntity;
    if (!entity || !entity.intialValues) return;

    identifiers.value = [entity.id, entity.intialValues.id].filter(
      (id) => id != undefined
    );
    intialValues.value = entity.intialValues;
    relationValues.value = entity.relationValues as RelationValues;
    columnList.value = entity.entityView;

    if (typeof columnList.value !== "string") {
      getEditableMetadataKeys(columnList.value, route.params.id as string);
    }

    if (auth.isAuthenticated.value) showEditToggle("edit");

    setCurrentRouteTitle(
      entity.intialValues?.title || entity.intialValues?.name
    );
    addVisitedRoute({ id: entity.id, routeName: currentRouteTitle.value });

    setRefetchFn(refetch);
    loading.value = false;
  }
);

watch(
  () => locale.value,
  (newLocale: string) => {
    queryVariables.preferredLanguage = newLocale;
    refetch(queryVariables);
  }
);
</script>
