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
        <h3 class="text-lg font-bold">
          {{ getEntityTitle(result.Entity) }}
        </h3>
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
  </BaseModal>
</template>

<script setup lang="ts">
import {
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  TypeModals,
} from "@/generated-types/queries";
import { computed, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import BaseModal from "@/components/base/BaseModal.vue";
import { useQuery } from "@vue/apollo-composable";
import { getEntityTitle } from "@/helpers";
import { Unicons } from "@/types";
import EntitySingle from "@/views/EntitySingle.vue";

const { getModalInfo, closeModal } = useBaseModal();

const entityId = computed<string>(() => {
  return getModalInfo(TypeModals.EntityDetailModal).entityId;
});
const entityType = computed<string>(() => {
  return getModalInfo(TypeModals.EntityDetailModal).entityType;
});
const queryVariables = computed(() => {
  return { id: entityId.value, type: entityType.value };
});

const { result, refetch } = useQuery<GetEntityByIdQuery>(
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
</script>

<style scoped></style>
