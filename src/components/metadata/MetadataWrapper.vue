<template>
  <div class="text-text-light text-sm flex">
    <p>
      {{ t(metadata.label) }}
    </p>
    <p v-if="isFieldRequired && isEdit" class="pl-1">*</p>
  </div>
  <entity-element-metadata-edit
    v-if="(isEdit && metadata.field) || (isEdit && metadata.inputField)"
    :fieldKey="
      isMetadataOnRelation ? `${metadata.key}-${linkedEntityId}` : metadata.key
    "
    :label="metadata.label as string"
    v-model:value="metadata.value"
    :field="metadata.inputField ? metadata.inputField : metadata.field"
    :formId="formId"
    :unit="metadata.unit"
    :link-text="metadata.linkText"
    :isMetadataOnRelation="isMetadataOnRelation"
    :set-value="setValue"
  />
  <entity-element-metadata
    v-else
    :label="metadata.label as string"
    v-model:value="metadata.value"
    :link-text="metadata.linkText"
    :link-icon="metadata.linkIcon"
    :unit="metadata.unit"
  />
</template>

<script lang="ts" setup>
import EntityElementMetadataEdit from "@/components/metadata/EntityElementMetadataEdit.vue";
import EntityElementMetadata from "@/components/metadata/EntityElementMetadata.vue";
import { DropdownOption, MetadataField } from "@/generated-types/queries";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useField } from "vee-validate";
import { ref } from "vue/dist/vue";

const props = defineProps<{
  isEdit: boolean;
  formId: string;
  metadata: MetadataField;
  linkedEntityId?: String;
}>();

const { t } = useI18n();
const isMetadataOnRelation = computed(
  () => props.metadata.__typename === "PanelRelationMetaData"
);
const {
  errorMessage,
  value: fieldValue,
  setValue,
} = useField<string>(
  isMetadataOnRelation
    ? `relationValues.newrelations.${props.metadata.fieldKey}`
    : `intialValues.${props.metadata.fieldKey}`,
  props.metadata.field && props.metadata.field.validation
    ? props.metadata.field.validation
    : undefined,
  {
    label: t(props.metadata.label as string),
  }
);
const isFieldRequired = computed(() =>
  props.metadata?.field?.validation?.includes("required")
);
</script>
