<template>
  <BaseModal
    :modal-type="TypeModals.ElodyEntityTaggingModal"
    modal-height-style="min-h-[50vh]"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.ElodyEntityTaggingModal)"
  >
    <div
      v-if="element && taggingConfiguration && selectedText"
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
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  CharacterReplacementSettings,
  DamsIcons,
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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
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
import {
  extractTitleKeyFromMetadataFilter,
  parseRegexFromString,
} from "@/helpers";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const { setBulkSelectionLimit, isBulkSelectionLimitReached, getEnqueuedItems } =
  useBulkOperations();
const { closeModal, getModalInfo, updateModal } = useBaseModal();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    element: WysiwygElement;
    editor: Editor;
  }>(),
  {},
);

const parentId = computed(() => route.params["id"]);
const formIndex: number = 0;
const selectionLimit: number = 1;
const taggingConfiguration: TaggableEntityConfiguration[] =
  props.element.taggingConfiguration?.taggableEntityConfiguration!;
const acceptedTypes = computed(() =>
  taggingConfiguration.map(
    (configurationItem) => configurationItem.taggableEntityType,
  ),
);

const selectedText = computed<string>(() => {
  return getModalInfo(TypeModals.ElodyEntityTaggingModal).selectedText || "";
});

const characterReplacementSettings = computed<CharacterReplacementSettings[]>(
  () => {
    return taggingConfiguration?.[formIndex]?.replaceCharacterFromTagSettings;
  },
);

const applyReplacementSettingsToSelectedText = (): string => {
  let result = selectedText.value;
  if (!characterReplacementSettings.value) return result;

  characterReplacementSettings.value.forEach(
    (settingsItem: CharacterReplacementSettings) => {
      const parsedRegex = parseRegexFromString(
        settingsItem.replacementCharactersRegex,
      );
      if (!parsedRegex) return;
      result = result.replace(parsedRegex, settingsItem.characterToReplaceWith);
    },
  );

  return result;
};

const textWithReplacements = computed<string>(() => {
  return applyReplacementSettingsToSelectedText();
});

const existingEntitySelected = computed<boolean>(() => {
  return isBulkSelectionLimitReached(BulkOperationsContextEnum.TagEntityModal);
});
const prefilledFormValues = ref<object | undefined>(undefined);

const setEntityName = () => {
  if (!taggingConfiguration) return;
  const entityTypes: Entitytyping[] = taggingConfiguration.map(
    (configurationItem: TaggableEntityConfiguration) =>
      configurationItem.taggableEntityType,
  );

  if (!textWithReplacements.value || !entityTypes) return;

  const titleKeys = entityTypes.map((type: Entitytyping) => {
    const configuration: TaggableEntityConfiguration =
      getExtensionConfigurationForEntity({ type });
    return extractTitleKeyFromMetadataFilter(
      configuration.metadataFilterForTagContent,
    );
  });

  prefilledFormValues.value = {
    intialValues: { [titleKeys[formIndex]]: textWithReplacements.value },
  };
};

watch(
  () => selectedText.value,
  () => {
    setEntityName();
  },
);

const computedAdvancedFilterInputs = computed<AdvancedFilterInput[]>(() => {
  const entityTypes: Entitytyping[] = taggingConfiguration.map(
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
      value: textWithReplacements.value,
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

  props.editor.commands.linkEntityToTaggedText(
    entityToTag,
    relationType,
    newTaggingText,
  );
};

onMounted(() => {
  setBulkSelectionLimit(
    BulkOperationsContextEnum.TagEntityModal,
    selectionLimit,
  );
});
</script>

<style scoped></style>
