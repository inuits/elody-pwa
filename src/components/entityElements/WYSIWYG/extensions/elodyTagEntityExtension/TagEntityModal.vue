<template>
  <BaseModal
    :modal-type="TypeModals.ElodyEntityTaggingModal"
    modal-height-style="min-h-[50vh]"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.ElodyEntityTaggingModal)"
  >
    <div
      v-if="
        element && element.taggingConfiguration && extensionConfiguration.length
      "
      class="p-2"
    >
      <div
        class="p-2 bg-accent-normal rounded-t-md text-white flex justify-between items-center"
      >
        <h3 class="text-lg font-bold">
          {{
            t("tagging.tag-entity", {
              entityType: extensionConfiguration[0].taggableEntityType,
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
                entityType: extensionConfiguration[0].taggableEntityType,
              })
            }}
          </h4>
        </div>
        <entity-picker-component
          :entity-uuid="parentId"
          :accepted-types="acceptedTypes"
          :custom-query="element.taggingConfiguration.customQuery"
          :entity-picker-mode="EntityPickerMode.Emit"
          :show-button="false"
          :enable-bulk-operations="false"
          :enable-advanced-filters="false"
          :computedFilters="computedAdvancedFilterInputs"
          :context="BulkOperationsContextEnum.TagEntityModal"
          base-library-height="max-h-[50vh]"
        />
      </div>
      <div class="bg-neutral-lightest rounded-md">
        <div class="p-2 bg-gray-200">
          <h4 class="text-md font-bold">
            {{
              t("tagging.tag-new", {
                entityType: extensionConfiguration[0].taggableEntityType,
              })
            }}
          </h4>
        </div>
        <dynamic-form
          :dynamic-form-query="
            extensionConfiguration[0].createNewEntityFormQuery
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
  EntityPickerMode,
  Entitytyping,
  type MetadataInput,
  type TaggableEntityConfiguration,
  TypeModals,
  type WysiwygElement,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { Unicons } from "@/types";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import type { Editor } from "@tiptap/vue-3";
import {
  getExtensionConfigurationForEntity,
  extensionConfiguration,
  tagEntity,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import { extractTitleKeyFromMetadataFilter } from "@/helpers";

const { setBulkSelectionLimit, isBulkSelectionLimitReached, getEnqueuedItems } =
  useBulkOperations();
const { closeModal, getModalInfo } = useBaseModal();
const { getForm } = useFormHelper();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const parentId = computed(() => route.params["id"]);
const selectionLimit: number = 1;
const acceptedTypes = computed(() =>
  extensionConfiguration.value.map(
    (configurationItem) => configurationItem.taggableEntityType,
  ),
);
const element = computed<WysiwygElement>(
  () => getModalInfo(TypeModals.ElodyEntityTaggingModal).element,
);
const editor = computed<Editor>(
  () => getModalInfo(TypeModals.ElodyEntityTaggingModal).editor,
);
const form = computed(() =>
  getForm(extensionConfiguration.value[0].createNewEntityFormQuery),
); //Todo:
const selectedText = computed<string>(() => {
  return getModalInfo(TypeModals.ElodyEntityTaggingModal).selectedText;
});

const computedAdvancedFilterInputs = computed<AdvancedFilterInput[]>(() => {
  const entityTypes: Entitytyping[] = extensionConfiguration.value.map(
    (configurationItem: TaggableEntityConfiguration) =>
      configurationItem.taggableEntityType,
  );
  if (!entityTypes) return [];

  const typeFilters: AdvancedFilterInput[] = [];
  const metadataFilters: AdvancedFilterInput[] = [];

  entityTypes.forEach((type: Entitytyping) => {
    const configurationItem: TaggableEntityConfiguration =
      getExtensionConfigurationForEntity({ type });
    const metadataKey = extractTitleKeyFromMetadataFilter(
      configurationItem.metadataFilterForTagContent,
    );

    const veeValidateKey: string = `intialValues.${metadataKey}`;
    // if (
    //   form.value &&
    //   !form.value.values.intialValues[metadataKey] &&
    //   !form.value.meta.dirty
    // )
    //   form.value.setFieldValue(veeValidateKey, selectedText.value);

    typeFilters.push({
      match_exact: true,
      type: AdvancedFilterTypes.Type,
      value: type,
    });

    metadataFilters.push({
      key: [configurationItem.metadataFilterForTagContent],
      value: selectedText.value,
      type: AdvancedFilterTypes.Text,
      match_exact: false,
    });
  });

  return [...typeFilters, ...metadataFilters];
});

const getNewTaggingTextFromTeaserMetadata = (
  teaserMetadataKey: string,
  taggedEntity: InBulkProcessableItem,
) => {
  return taggedEntity.teaserMetadata.filter(
    (teaserMetadataItem: MetadataInput) =>
      teaserMetadataItem.key === teaserMetadataKey,
  )[0].value;
};

const tagExistingEntityFlow = () => {
  const context = BulkOperationsContextEnum.TagEntityModal;
  if (!isBulkSelectionLimitReached(context)) return;

  const entityToTag = getEnqueuedItems(context)[0];
  const entityTypeConfigurationItem: TaggableEntityConfiguration =
    getExtensionConfigurationForEntityType(entityToTag.type);
  const newTaggingTextKey = extractTitleKeyFromMetadataFilter(
    entityTypeConfigurationItem.metadataFilterForTagContent,
  );
  const newTaggingText = getNewTaggingTextFromTeaserMetadata(
    newTaggingTextKey,
    entityToTag,
  );
  const relationType = entityTypeMappingItem.relationType;
  if (!entityToTag) return;

  tagEntity(entityToTag, relationType, parentId.value, context);

  editor.value.commands.linkEntityToTaggedText(
    entityToTag,
    relationType,
    newTaggingText,
  );
};

watch(
  () => isBulkSelectionLimitReached(BulkOperationsContextEnum.TagEntityModal),
  () => {
    tagExistingEntityFlow();
  },
);

watch(
  () => element.value,
  () => {
    setBulkSelectionLimit(
      BulkOperationsContextEnum.TagEntityModal,
      selectionLimit,
    );
  },
);
</script>

<style scoped></style>
