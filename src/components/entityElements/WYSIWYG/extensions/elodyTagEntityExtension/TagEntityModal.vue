<template>
  <BaseModal
    :modal-type="TypeModals.ElodyEntityTaggingModal"
    modal-height-style="min-h-[50vh]"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.ElodyEntityTaggingModal)"
  >
    <div v-if="element && element.taggingConfiguration" class="p-2">
      <div
        class="p-2 bg-accent-normal rounded-t-md text-white flex justify-between items-center"
      >
        <h3 class="text-lg font-bold">
          {{
            t("tagging.tag-entity", {
              entityType: element.taggingConfiguration.entityType,
            })
          }}
        </h3>
        <div
          class="cursor-pointer"
          @click="closeModal(TypeModals.ElodyEntityTaggingModal)"
        >
          <unicon :name="Unicons.Cross.name" />
        </div>
      </div>
      <div>
        <div class="p-2 bg-gray-200">
          <h4 class="text-md font-bold">
            {{
              t("tagging.tag-existing", {
                entityType: element.taggingConfiguration.entityType,
              })
            }}
          </h4>
        </div>
        <entity-picker-component
          :entity-uuid="parentId"
          :accepted-types="[element.taggingConfiguration.entityType]"
          :custom-query="element.taggingConfiguration.customQuery"
          :show-button="false"
          :enable-bulk-operations="false"
          :enable-advanced-filters="false"
          :computedFilters="computedAdvancedFilterInputs"
          base-library-height="max-h-[50vh]"
        />
      </div>
      <div class="bg-neutral-lightest rounded-md">
        <div class="p-2 bg-gray-200">
          <h4 class="text-md font-bold">
            {{
              t("tagging.tag-new", {
                entityType: element.taggingConfiguration.entityType,
              })
            }}
          </h4>
        </div>
        <dynamic-form
          :dynamic-form-query="
            element.taggingConfiguration.createNewEntityFormQuery
          "
          :router="router"
          :show-form-title="false"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Entitytyping,
  TypeModals,
  type WysiwygElement,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { Unicons } from "@/types";

const { closeModal, getModalInfo } = useBaseModal();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const parentId = computed(() => route.params["id"]);
const element = computed<WysiwygElement>(
  () => getModalInfo(TypeModals.ElodyEntityTaggingModal).element,
);
const form = computed(() =>
  useFormHelper().getForm(
    element.value.taggingConfiguration?.createNewEntityFormQuery,
  ),
);
const selectedText = computed<string>(
  () => getModalInfo(TypeModals.ElodyEntityTaggingModal).selectedText,
);

const computedAdvancedFilterInputs = computed<AdvancedFilterInput[]>(() => {
  const metadataFilterString =
    element.value.taggingConfiguration?.metadataFilter;
  const metadataKey = metadataFilterString.split("|")[1].split(".")[1];
  const entityType: Entitytyping =
    element.value.taggingConfiguration.entityType;
  if (
    !metadataFilterString ||
    !metadataKey ||
    !form.value ||
    !selectedText.value ||
    !entityType
  )
    return [];
  form.value.setFieldValue(`intialValues.${metadataKey}`, selectedText.value);
  const typeFilter: AdvancedFilterInput = {
    match_exact: true,
    type: AdvancedFilterTypes.Type,
    value: entityType,
  };
  const metadataFilter: AdvancedFilterInput = {
    key: [metadataFilterString],
    value: selectedText.value,
    type: AdvancedFilterTypes.Text,
    match_exact: false,
  };
  return [typeFilter, metadataFilter];
});
</script>

<style scoped></style>
