<template>
  <div class="text-text-light text-sm flex">
    <p>
      {{ t(metadata.label) }}
    </p>
    <p v-if="isFieldRequired && isEdit" class="pl-1">*</p>
  </div>
  <entity-element-metadata-edit
      v-if="(isEdit && metadata.field) || (isEdit && metadata.inputField)"
      :fieldKey="isMetadataOnRelation ? `${metadata.key}-${linkedEntityId}` : metadata.key"
      :label="metadata.label as string"
      v-model:value="metadata.value"
      :field="metadata.inputField ? metadata.inputField : metadata.field "
      :formId="formId"
      :unit="metadata.unit"
      :link-text="metadata.linkText"
      :is-metadata-on-relation="isMetadataOnRelation"
  />
  <entity-element-metadata
      v-else
      :label="metadata.label as string"
      :value="metadata.value"
      :link-text="metadata.linkText"
      :link-icon="metadata.linkIcon"
      :unit="metadata.unit"
  />
</template>

<script lang="ts" setup>
import EntityElementMetadataEdit from "@/components/metadata/EntityElementMetadataEdit.vue";
import EntityElementMetadata from "@/components/metadata/EntityElementMetadata.vue";
import { MetadataField} from "@/generated-types/queries";
import { computed } from "vue";
import {useI18n} from "vue-i18n";

const props = defineProps<{
  isEdit: boolean;
  formId: string;
  metadata: MetadataField
  linkedEntityId?: String;
}>();

const {t} = useI18n()

const isMetadataOnRelation = computed(() =>
    props.metadata.__typename === 'PanelRelationMetaData'
)
const isFieldRequired = computed(() =>
    props.metadata?.field?.validation?.includes("required")
);


</script>