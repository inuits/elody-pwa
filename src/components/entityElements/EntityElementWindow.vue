<template>
  <div data-cy="entity-element-window" class="h-full flex flex-1">
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Left
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
    <div
      class="h-full w-full border-solid border-neutral-30 border-2 bg-background-light rounded-t-md @container/window"
    >
      <div
        class="border-solid border-neutral-30 border-b-2 rounded-t-md flex flex-row"
      >
        <h1
          data-cy="entity-element-window-title"
          class="subtitle text-text-body p-2"
        >
          {{ previewLabel ? t(previewLabel) : t(element.label) }}
        </h1>

        <div
          v-if="element.windowElementStatus"
          class="flex gap-4 w-1/4 items-center"
        >
          <h2 v-if="element.windowElementStatus.label">{{ t(element.windowElementStatus.label) }}</h2>
          <MetadataWrapper
            class="w-full"
            :metadata="getStatusMetadata()"
            :form-id="formId"
            :isEdit="computedIsEdit"
          />
        </div>


        <MetadataEditButton
          class="my-2"
          v-if="
            auth.isAuthenticated.value === true &&
            element.editMetadataButton?.hasButton &&
            showEditMetadataButton
          "
          button-size="small"
          :readmode-label="element.editMetadataButton.readmodeLabel"
          :editmode-label="element.editMetadataButton.editmodeLabel"
        />
        <div
          class="flex align-center"
          :class="{ 'ml-auto': !showEditMetadataButton }"
          v-if="
            auth.isAuthenticated.value === true && element.contextMenuActions
          "
        >
          <BaseContextMenuActions
            :context-menu-actions="element.contextMenuActions"
            :parent-entity-id="formId"
          />
        </div>
      </div>
      <div
        :class="[
          {
            'grid grid-cols-2 gap-2 justify-items-center max-w-full':
              props.element.layout === WindowElementLayout.HorizontalGrid,
          },
        ]"
      >
        <div
          v-for="(panel, index) in filteredPanels"
          :key="index"
          :class="[
            'w-full',
            {
              'border-solid border-neutral-30 border-b-2':
                props.element.layout !== WindowElementLayout.HorizontalGrid,
            },
          ]"
        >
          <entity-element-window-panel
            :panel="panel"
            :identifiers="identifiers"
            :is-edit="computedIsEdit"
            :form-id="formId"
          />
        </div>
      </div>
    </div>
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Right
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { auth } from "@/main";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import { usePermissions } from "@/composables/usePermissions";
import useEntitySingle from "@/composables/useEntitySingle";
import {
  DisplayCondition,
  Orientations,
  Permission,
  WindowElementLayout,
  type WindowElement,
  type WindowElementPanel,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "../windowPanel/EntityElementWindowPanel.vue";
import BaseExpandButton from "../base/BaseExpandButton.vue";
import MetadataEditButton from "@/components/MetadataEditButton.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import BaseContextMenuActions from "@/components/BaseContextMenuActions.vue";

const props = defineProps<{
  element: WindowElement;
  identifiers: string[];
  isEditOverwrite?: boolean;
  formId: string;
  previewLabel?: string;
  entityMetadata?: Record<string, any>;
  entityRelations?: Record<string, any>;
}>();

const emit = defineEmits<{
  (event: "resizeColumn", toggled: boolean): void;
}>();

const { t } = useI18n();
const { fetchAdvancedPermissions, fetchUpdateAndDeletePermission } =
  usePermissions();
const { getForm } = useFormHelper();
const useEditHelper = useEditMode(props.formId);

const permissionResults = ref<Record<string, boolean>>({});
const entityDetailPermissions = ref<Map<Permission, boolean> | null>(null);
const isCheckingPermissions = ref(true);

const computedIsEdit = computed(
  () => props.isEditOverwrite || useEditHelper.isEdit,
);

const showEditMetadataButton = computed(() => {
  const key = props.element.editMetadataButton?.hideIfMetadataNotPresent;
  if (!key) return true;
  const form = getForm(props.formId);
  if (!form) return true;
  const value = form.values.intialValues?.[key];
  return value !== undefined && value !== null && value !== "";
});

const resizeColumn = (toggled: boolean) => {
  emit("resizeColumn", toggled);
};

const allPanels = computed<WindowElementPanel[]>(() => {
  return Object.values(props.element).filter(
    (value): value is WindowElementPanel =>
      typeof value === "object" && value?.__typename === "WindowElementPanel",
  );
});

const resolvePanelPermissions = async () => {
  isCheckingPermissions.value = true;

  const uniquePermissions = [
    ...new Set(
      allPanels.value
        .flatMap((panel) => panel.can || [])
        .filter((p): p is string => !!p),
    ),
  ];

  const entityId = useEntitySingle().getEntityUuid();
  const entityType = useEntitySingle().getEntityType();

  const advancedPromise =
    uniquePermissions.length > 0
      ? fetchAdvancedPermissions(uniquePermissions)
      : Promise.resolve<Record<string, boolean>>({});
  const detailPromise =
    entityId && entityType
      ? fetchUpdateAndDeletePermission(entityId, entityType) ??
        Promise.resolve(null)
      : Promise.resolve(null);

  const [advancedResults, detailResults] = await Promise.all([
    advancedPromise,
    detailPromise,
  ]);
  permissionResults.value = advancedResults;
  entityDetailPermissions.value = detailResults ?? null;

  isCheckingPermissions.value = false;
};

const isPanelPermitted = (panelCan: string): boolean => {
  if (permissionResults.value[panelCan]) return true;

  const [action, targetEntityType] = panelCan.split(":");
  const currentEntityType = useEntitySingle().getEntityType();
  if (!targetEntityType || targetEntityType !== currentEntityType) return false;

  const detail = entityDetailPermissions.value;
  if (!detail) return false;
  if (action === "update") return !!detail.get(Permission.Canupdate);
  if (action === "delete") return !!detail.get(Permission.Candelete);
  if (action === "read") return !!detail.get(Permission.Canread);
  return false;
};

const getPanelsAllowedToDisplay = (): WindowElementPanel[] => {
  return allPanels.value.filter((panel) => {
    if (panel.__typename !== 'WindowElementPanel') return true;
    const condition = (panel as WindowElementPanel).displayCondition as DisplayCondition | undefined;
    if (!condition?.key) return true;
    if (condition.value) return String(props.entityMetadata?.[condition.key]) === String(condition.value)
    return props.entityRelations?.[condition.key] !== undefined;
  })
};

const filteredPanels = computed<WindowElementPanel[]>(() => {
  if (isCheckingPermissions.value) return [];

  const allowedDisplayPanels = getPanelsAllowedToDisplay();
  return allowedDisplayPanels.filter((panel) => {
    const requiredPerms = (panel.can && [panel.can]) || [];
    if (requiredPerms.length === 0) return true;

    return requiredPerms.some((p) => isPanelPermitted(p));
  });
});

const { getStatusMetadata, registerEditableKey } = useWindowOrPanelStatus(
  computed(() => props.element.windowElementStatus),
  props.formId,
  computed(() => props.isEdit),
);

onMounted(() => {
  resolvePanelPermissions();
  registerEditableKey();
});
</script>
