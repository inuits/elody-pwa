<template>
  <div>
    <div
      v-if="!loading"
      class="pl-24 h-full w-full flex fixed top-0 bg-neutral-lightest pt-24 left-0"
    >
      <entity-form
        v-if="intialValues != 'no-values'"
        :intialValues="intialValues"
      >
        <entity-column
          v-if="columnList != 'no-values'"
          :columnList="columnList"
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
  Entitytyping,
  GetEntityByIdDocument,
  type ColumnList,
  type GetEntityByIdQueryVariables,
  type IntialValues,
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

const props = withDefaults(
  defineProps<{
    entityType?: Entitytyping;
  }>(),
  {
    entityType: Entitytyping.Asset,
  }
);

const config: any = inject("config");
const id = asString(useRoute().params["id"]);
const loading = ref<boolean>(true);
const auth = useAuth();
const { showEditToggle, disableEditMode, isEdit, setRefetchFn } = useEditMode();
const { setCurrentRouteTitle, addVisitedRoute, currentRouteTitle } =
  useBreadcrumbs(config);
const router = useRouter();

const queryVariables = reactive<GetEntityByIdQueryVariables>({
  id: id,
  type: props.entityType,
});

const { result, refetch } = useQuery(GetEntityByIdDocument, queryVariables, {
  notifyOnNetworkStatusChange: true,
  fetchPolicy: "no-cache",
});

onBeforeRouteUpdate(async (to: any) => {
  queryVariables.id = to.params.id;
  intialValues.value = "no-values";
  columnList.value = "no-values";
  disableEditMode();
});

const intialValues = ref<Omit<IntialValues, "keyValue"> | "no-values">(
  "no-values"
);
const columnList = ref<ColumnList | "no-values">("no-values");

watch(result, (queryResults) => {
  setRefetchFn(refetch);
  try {
    const entity: BaseEntity | undefined = queryResults?.Entity || undefined;
    if (entity) {
      intialValues.value = entity?.intialValues;
      columnList.value = entity?.entityView;
      //If logged in set edit mode -> need to check permissions if enabled
      if (auth.isAuthenticated.value === true) {
        showEditToggle("edit");
      }

      setCurrentRouteTitle(entity?.intialValues?.title);
      addVisitedRoute({ id: entity?.id, routeName: currentRouteTitle.value });

      loading.value = false;
    }
  } catch (error) {
    console.error("no assets");
  }
});

router.beforeEach(() => {
  if (isEdit) {
    disableEditMode();
  }
});
</script>
