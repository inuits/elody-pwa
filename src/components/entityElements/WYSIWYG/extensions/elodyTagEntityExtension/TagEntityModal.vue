<template>
  <BaseModal
    :modal-type="TypeModals.ElodyEntityTaggingModal"
    modal-height-style="min-h-[50vh]"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.ElodyEntityTaggingModal)"
  >
    <div
      v-if="element && taggingConfiguration.length && selectedText"
      :key="`${taggingConfiguration[formIndex].createNewEntityFormQuery}-${getModalInfo(TypeModals.ElodyEntityTaggingModal).open}`"
      class="p-2"
    >
      <div
        class="p-2 bg-accent-normal rounded-t-md text-white flex justify-between items-center"
      >
        <h3 class="text-lg font-bold">
          {{
            t("tagging.tag-entity", {
              entityType: taggingConfiguration[formIndex].taggableEntityType,
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
      <div v-if="computedAdvancedFilterInputs">
        <div class="p-2 bg-gray-200">
          <h4 class="text-md font-bold">
            {{
              t("tagging.tag-existing", {
                entityType: taggingConfiguration[formIndex].taggableEntityType,
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
          :should-use-state-for-route="false"
          base-library-height="max-h-[50vh]"
        />
        <div class="py-2">
          <BaseButtonNew
            :label="
              t('tagging.tag-selected-button', {
                entityType: taggingConfiguration[formIndex].taggableEntityType,
              })
            "
            :icon="DamsIcons.Tag"
            button-style="accentAccent"
            :disabled="!existingEntitySelected"
            @click="tagExistingEntityFlow()"
          />
        </div>
      </div>
      <div class="bg-neutral-lightest rounded-md">
        <div class="p-2 bg-gray-200">
          <h4 class="text-md font-bold">
            {{
              t("tagging.tag-new", {
                entityType: taggingConfiguration[formIndex].taggableEntityType,
              })
            }}
          </h4>
        </div>
        <dynamic-form
          :dynamic-form-query="
            taggingConfiguration[formIndex].createNewEntityFormQuery
          "
          :router="router"
          :show-form-title="false"
          :prefilled-form-values="prefilledFormValues"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Entitytyping } from "@/generated-types/queries";
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  EntityPickerMode,
  type MetadataInput,
  type TaggableEntityConfiguration,
  TypeModals,
  type WysiwygElement,
  DamsIcons,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import { computed, watch, ref } from "vue";
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
  tagEntity,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import { extractTitleKeyFromMetadataFilter } from "@/helpers";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const { setBulkSelectionLimit, isBulkSelectionLimitReached, getEnqueuedItems } =
  useBulkOperations();
const { closeModal, getModalInfo } = useBaseModal();
const { getForm } = useFormHelper();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const parentId = computed(() => route.params["id"]);
const formIndex: number = 0;
const selectionLimit: number = 1;
const acceptedTypes = computed(() =>
  taggingConfiguration.value.map(
    (configurationItem) => configurationItem.taggableEntityType,
  ),
);
const element = computed<WysiwygElement>(
  () => getModalInfo(TypeModals.ElodyEntityTaggingModal).element,
);
const taggingConfiguration = computed<TaggableEntityConfiguration[]>(
  () => element.value.taggingConfiguration.taggableEntityConfiguration,
);
const editor = computed<Editor>(
  () => getModalInfo(TypeModals.ElodyEntityTaggingModal).editor,
);
const form = computed(() =>
  getForm(taggingConfiguration.value[formIndex].createNewEntityFormQuery),
);
const selectedText = computed<string>(() => {
  return getModalInfo(TypeModals.ElodyEntityTaggingModal).selectedText;
});
const existingEntitySelected = computed<boolean>(() =>
  isBulkSelectionLimitReached(BulkOperationsContextEnum.TagEntityModal),
);
const prefilledFormValues = ref<object | undefined>(undefined);

const setEntityName = () => {
  const entityTypes: Entitytyping[] = taggingConfiguration.value.map(
    (configurationItem: TaggableEntityConfiguration) =>
      configurationItem.taggableEntityType,
  );

  if (!selectedText.value || !entityTypes) return;

  const titleKeys = entityTypes.map((type: Entitytyping) => {
    const configuration: TaggableEntityConfiguration =
      getExtensionConfigurationForEntity({ type });
    return extractTitleKeyFromMetadataFilter(
      configuration.metadataFilterForTagContent,
    );
  });

  prefilledFormValues.value = {
    intialValues: { [titleKeys[formIndex]]: selectedText.value },
  };
};

watch(
  () => selectedText.value,
  () => setEntityName(),
);

const computedAdvancedFilterInputs = computed<AdvancedFilterInput[]>(() => {
  const entityTypes: Entitytyping[] = taggingConfiguration.value.map(
    (configurationItem: TaggableEntityConfiguration) =>
      configurationItem.taggableEntityType,
  );
  if (!entityTypes) return [];

  const typeFilters: AdvancedFilterInput[] = [];
  const metadataFilters: AdvancedFilterInput[] = [];

  entityTypes.forEach((type: Entitytyping) => {
    const configurationItem: TaggableEntityConfiguration =
      getExtensionConfigurationForEntity({ type });

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
    getExtensionConfigurationForEntity({ type: entityToTag.type });
  const newTaggingTextKey = extractTitleKeyFromMetadataFilter(
    entityTypeConfigurationItem.metadataFilterForTagContent,
  );
  const newTaggingText = getNewTaggingTextFromTeaserMetadata(
    newTaggingTextKey,
    entityToTag,
  );
  const relationType = entityTypeConfigurationItem.relationType;
  if (!entityToTag) return;

  tagEntity(entityToTag, relationType, parentId.value, context);

  editor.value.commands.linkEntityToTaggedText(
    entityToTag,
    relationType,
    newTaggingText,
  );
};

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
