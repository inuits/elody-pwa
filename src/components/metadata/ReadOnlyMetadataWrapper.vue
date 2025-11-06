<template>
  <div
    data-cy="metadata-wrapper"
    v-if="!refMetadata.showOnlyInEditMode && isPermitted"
    :key="label"
  >
    <metadata-title :metadata="refMetadata" :is-field-required="false" />
    <div class="flex gap-2">
      <base-tooltip
        class="w-full basis-[fit-content]"
        position="right-end"
        :tooltip-offset="8"
      >
        <template #activator="{ on }">
          <div
            v-on="showTooltip ? on : {}"
            class="flex column gap-2 items-center"
          >
            <MetadataTruncatedText
              @overflow-status="handleOverflowStatus"
              :disabled="!linkedEntityId && !refMetadata.lineClamp"
              :line-clamp="refMetadata.lineClamp || 1"
            >
              <MetadataFormatter
                v-if="refMetadata.value?.formatter"
                v-bind="refMetadata.value"
                :translation-key="refMetadata.valueTranslationKey"
                :entity="{ type: entityType }"
              />
              <entity-element-metadata
                v-else
                :label="refMetadata.label as string"
                :value="refMetadata.value"
                :link-text="refMetadata.linkText"
                :link-icon="refMetadata.linkIcon"
                :unit="refMetadata.unit"
                :base-library-mode="baseLibraryMode"
                :custom-value="refMetadata.customValue"
                :translation-key="refMetadata.valueTranslationKey"
              />
            </MetadataTruncatedText>
            <BaseCopyToClipboard
              v-if="refMetadata.copyToClipboard"
              class="w-6 h-6"
              :value="refMetadata.value"
              @click.stop.prevent
            />
          </div>
        </template>
        <template #default>
          <entity-element-metadata
            class="text-text-placeholder"
            :label="refMetadata.label as string"
            v-model:value="metadataValueToDisplayOnTooltip"
            :link-text="refMetadata.linkText"
            :link-icon="refMetadata.linkIcon"
            :unit="refMetadata.unit"
            :base-library-mode="baseLibraryMode"
          />
        </template>
      </base-tooltip>
      <MetadataValueTooltip
        class="grow-0 shrink-0 basis-0 items-center"
        v-if="refMetadata.valueTooltip?.type && refMetadata.value"
        :value-tooltip="refMetadata.valueTooltip"
        :entity="refMetadata.value?.entity"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import EntityElementMetadata from "@/components/metadata/EntityElementMetadata.vue";
import MetadataFormatter from "@/components/metadata/MetadataFormatter.vue";
import MetadataTruncatedText from "./MetadataTruncatedText.vue";
import MetadataValueTooltip from "./MetadataValueTooltip.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import {
  BaseLibraryModes,
  type PanelMetaData,
  type PanelRelationMetaData,
  type PanelRelationRootData,
  type Entitytyping,
} from "@/generated-types/queries";
import { computed, onMounted, watch, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import { usePermissions } from "@/composables/usePermissions";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";

const props = withDefaults(
  defineProps<{
    isEdit: boolean;
    formId: string;
    metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
    linkedEntityId?: string;
    baseLibraryMode?: BaseLibraryModes;
    formFlow?: "edit" | "create";
    showErrors?: boolean;
    entityType?: Entitytyping;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    formFlow: "edit",
    showErrors: false,
  },
);

const { fetchAdvancedPermission, setExtraVariables } = usePermissions();
const { t } = useI18n();

const showTooltip = ref<boolean>(false);
const isPermitted = ref<boolean>(false);
const refMetadata = ref<
  PanelMetaData | PanelRelationMetaData | PanelRelationRootData
>(props.metadata);

const handleOverflowStatus = (status: boolean) => {
  showTooltip.value = status;
};

const metadataValueToDisplayOnTooltip = computed(
  () => refMetadata.value?.value?.label || refMetadata.value?.value,
);

const label = computed(() =>
  refMetadata.value.label
    ? t(refMetadata.value.label as string)
    : t("metadata.no-label"),
);

const updatePermissionVariables = () => {
  setExtraVariables({
    parentEntityId: props.formId,
    childEntityId: "",
  });
};

const isPermittedToDisplay = async () => {
  const permissions = refMetadata.value.can;
  const hasPermissionsToCheck = permissions && permissions?.length > 0;

  if (!hasPermissionsToCheck) {
    isPermitted.value = true;
    return;
  }
  isPermitted.value = await fetchAdvancedPermission(permissions);
};

watch(
  () => props.metadata,
  (newValue) => {
    refMetadata.value = newValue;
  },
);

watch(
  () => props.formId,
  () => {
    updatePermissionVariables();
  },
  { immediate: true },
);

onMounted(async () => {
  await isPermittedToDisplay();
});
</script>
