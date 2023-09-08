<template>
  <BaseModal
    v-if="modal && form"
    :modal-state="modal.state"
    :modal-position="modal.modalPosition"
    modal-width-style="w-11/12"
    @hide-modal="closeModal(TypeModals.BulkOperationsEdit)"
  >
    <div class="flex flex-wrap p-8 h-full">
      <div class="flex basis-full gap-8 h-[94%]">
        <div class="h-full basis-[56%]">
          <div class="h-[40px] mb-6">
            <LibraryBar
              v-model:skip="skip"
              v-model:limit="limit"
              :total-items="getEnqueuedItemCount(context)"
              @update:skip="loadItems()"
              @update:limit="loadItems()"
            />
          </div>
          <div class="h-[90%] overflow-y-hidden hover:overflow-y-auto">
            <ListItem
              v-for="item in items"
              :key="item.id"
              :item-id="item.id"
              :teaser-metadata="item.teaserMetadata"
              :bulk-operations-context="context"
              :thumb-icon="getThumbnail(item)"
            />
          </div>
        </div>
        <div class="grow mb-6">
          <EntityElementWindow
            v-if="relationForm"
            :element="relationForm"
            :is-edit-overwrite="editRelations"
            :form-id="formId"
          />
        </div>
      </div>
      <div class="basis-full h-[55px]">
        <BulkOperationsSubmitBar
          :button-label="t('bulk-operations.edit')"
          :button-icon="DamsIcons.DocumentInfo"
          :selected-items-count="getEnqueuedItemCount(context)"
          :disabled="!relationFormHasValues || !relationEntityId"
          @submit="bulkAddRelations()"
          @cancel="closeModal(TypeModals.BulkOperationsEdit)"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import {
  DamsIcons,
  ModalState,
  TypeModals,
  GetBulkOperationsRelationFormDocument,
  BulkAddRelationsDocument,
} from "@/generated-types/queries";
import type {
  BulkAddRelationsMutation,
  BulkAddRelationsMutationVariables,
  PanelMetaData,
  WindowElement,
  GetBulkOperationsRelationFormQuery,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { ref, inject, watch, computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useI18n } from "vue-i18n";
import { useMutation, useQuery } from "@vue/apollo-composable";
import EntityElementWindow from "../EntityElementWindow.vue";
import { useFormHelper } from "@/composables/useFormHelper";

const props = defineProps<{
  context: Context;
}>();

const { getEnqueuedItems, getEnqueuedItemCount } = useBulkOperations();
const config = inject("config") as any;
const validationSchema = inject("validationSchema") as Object;
const { t } = useI18n();
const { getThumbnail } = useThumbnailHelper();
const { getModal, closeModal } = useBaseModal();
const { createForm, createEntityValues, getForm, formContainsValues } =
  useFormHelper();
const modal = getModal(TypeModals.BulkOperationsEdit);
const skip = ref<number>(1);
const limit = ref<number>(config.bulkSelectAllSizeLimit);
const relationForm = ref<WindowElement | undefined>(undefined);
const items = ref<InBulkProcessableItem[]>([]);
const entityIds = computed(() =>
  items.value.map((item: InBulkProcessableItem) => item.id)
);
const formId = "bulkEdit";
const form = computed(() => getForm(formId));
const relationFormHasValues = computed(() => formContainsValues(formId));
const relationEntityId = computed((): string | undefined => {
  const intialValues = form.value?.values.intialValues;
  if (!intialValues) return undefined;
  return Object.values(intialValues)[0] as string;
});
const editRelations = ref<boolean>(true);

const { mutate: mutateRelations } = useMutation<
  BulkAddRelationsMutation,
  BulkAddRelationsMutationVariables
>(BulkAddRelationsDocument);

const bulkAddRelations = () => {
  if (!relationEntityId.value) return;
  mutateRelations({
    entityIds: entityIds.value,
    relationEntityId: relationEntityId.value,
    relationType: "",
  });
};

const { onResult: onRelationFormResult } =
  useQuery<GetBulkOperationsRelationFormQuery>(
    GetBulkOperationsRelationFormDocument
  );

onRelationFormResult((relationFormResult: any) => {
  relationForm.value = relationFormResult?.data?.BulkOperationsRelationForm;
  const panels: any = relationForm.value;
  if (panels) {
    const fields = Object.values(panels.relations);
    const entityValues = createEntityValues(fields as PanelMetaData[]);
    createForm(formId, entityValues, validationSchema);
  }
});

const loadItems = () =>
  (items.value = getEnqueuedItems(props.context, skip.value, limit.value));

watch(
  () => modal.state,
  (modalState) => {
    if (modalState === ModalState.Show) {
      loadItems();
    }
  }
);
</script>
