<template>
  <BaseModal
    :modal-type="TypeModals.EntityDetailModal"
    modal-height-style="min-h-[50vh]"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.EntityDetailModal)"
  >
    <div v-if="result">
      <div
        class="p-2 bg-neutral-100 rounded-t-md text-white flex justify-between items-center"
      >
        <div class="flex items-center gap-2 min-w-0">
          <button
            v-if="trail.length > 0"
            type="button"
            data-cy="entity-detail-modal-back"
            class="cursor-pointer"
            @click="goBack"
          >
            <unicon :name="Unicons.AngleLeft.name" />
          </button>
          <h3 class="text-lg font-bold truncate">
            {{ getEntityTitle(result.Entity) }}
          </h3>
        </div>
        <div
          class="cursor-pointer"
          @click="closeModal(TypeModals.EntityDetailModal)"
        >
          <unicon :name="Unicons.Cross.name" />
        </div>
      </div>
      <entity-single
        :entity-id="entityId"
        :entityType="entityType"
        :view-only="true"
      />
    </div>
    <ListItemSkeleton v-else-if="loading" :amount="4" class="p-4" />
  </BaseModal>
</template>

<script setup lang="ts">
import {
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  TypeModals,
} from "@/generated-types/queries";
import { computed, provide, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import BaseModal from "@/components/base/BaseModal.vue";
import { useQuery } from "@vue/apollo-composable";
import { getEntityTitle } from "@/helpers";
import { Unicons } from "@/types";
import useEntitySingle from "@/composables/useEntitySingle";
import EntitySingle from "@/views/EntitySingle.vue";
import ListItemSkeleton from "@/components/base/skeletons/ListItemSkeleton.vue";
import {
  provideEntityNavigationScope,
  type EntityNavigationTarget,
} from "@/composables/useScopedEntityNavigation";

const { getModalInfo, closeModal, updateModal } = useBaseModal();
const {
  getEntityUuid,
  setEntityUuid,
  getEntityType,
  setEntityType,
  getRefetch,
  setRefetch,
} = useEntitySingle();

provide("OwnsRouteState", false);

const entityId = computed<string>(() => {
  return getModalInfo(TypeModals.EntityDetailModal).entityId;
});
const entityType = computed<string>(() => {
  return getModalInfo(TypeModals.EntityDetailModal).entityType;
});
const queryVariables = computed(() => {
  return { id: entityId.value, type: entityType.value };
});

const { result, refetch, loading } = useQuery<GetEntityByIdQuery>(
  GetEntityByIdDocument,
  queryVariables,
  () => ({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
    enabled: !!entityId.value,
  }),
);

watch(
  () => entityId.value,
  () => {
    refetch();
  },
);

const trail = ref<EntityNavigationTarget[]>([]);

const showEntity = (target: EntityNavigationTarget) =>
  updateModal(TypeModals.EntityDetailModal, {
    entityId: target.id,
    entityType: target.type,
  });

provideEntityNavigationScope((target: EntityNavigationTarget) => {
  if (target.id === entityId.value && target.type === entityType.value) return;
  trail.value.push({ id: entityId.value, type: entityType.value });
  showEntity(target);
});

const goBack = () => {
  const previous = trail.value.pop();
  if (previous) showEntity(previous);
};

let pageEntity:
  | { uuid?: string; type?: string; refetch?: () => void }
  | undefined;

watch(
  () => getModalInfo(TypeModals.EntityDetailModal).open,
  (isOpen: boolean) => {
    trail.value = [];
    if (isOpen) {
      pageEntity = {
        uuid: getEntityUuid(),
        type: getEntityType(),
        refetch: getRefetch(),
      };
      return;
    }
    if (!pageEntity) return;
    setEntityUuid(pageEntity.uuid ?? "");
    setEntityType(pageEntity.type ?? "");
    if (pageEntity.refetch) setRefetch(pageEntity.refetch);
    pageEntity = undefined;
  },
);
</script>

<style scoped></style>
