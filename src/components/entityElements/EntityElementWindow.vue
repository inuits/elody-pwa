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
        <MetadataEditButton
          class="my-2"
          v-if="
            auth.isAuthenticated.value === true &&
            element.editMetadataButton?.hasButton
          "
          button-size="small"
          :readmode-label="element.editMetadataButton.readmodeLabel"
          :editmode-label="element.editMetadataButton.editmodeLabel"
        />
        <BaseContextMenuActions
          v-if="
            auth.isAuthenticated.value === true && element.contextMenuActions
          "
          :context-menu-actions="element.contextMenuActions"
          :parent-entity-id="formId"
        />
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
import { usePermissions } from "@/composables/usePermissions";
import {
  Orientations,
  WindowElementLayout,
  type WindowElement,
  type WindowElementPanel,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "../windowPanel/EntityElementWindowPanel.vue";
import BaseExpandButton from "../base/BaseExpandButton.vue";
import MetadataEditButton from "@/components/MetadataEditButton.vue";
import BaseContextMenuActions from "@/components/BaseContextMenuActions.vue";

const props = defineProps<{
  element: WindowElement;
  identifiers: string[];
  isEditOverwrite?: boolean;
  formId: string;
  previewLabel?: string;
}>();

const emit = defineEmits<{
  (event: "resizeColumn", toggled: boolean): void;
}>();

const { t } = useI18n();
const { fetchAdvancedPermissions } = usePermissions();
const useEditHelper = useEditMode(props.formId);

const permissionResults = ref<Record<string, boolean>>({});
const isCheckingPermissions = ref(true);

const computedIsEdit = computed(
  () => props.isEditOverwrite || useEditHelper.isEdit,
);

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

  if (uniquePermissions.length > 0) {
    const results = await fetchAdvancedPermissions(uniquePermissions);
    permissionResults.value = results;
  }

  isCheckingPermissions.value = false;
};

const filteredPanels = computed<WindowElementPanel[]>(() => {
  if (isCheckingPermissions.value) return [];

  return allPanels.value.filter((panel) => {
    const requiredPerms = panel.can && [panel.can] || [];
    if (requiredPerms.length === 0) return true;

    return requiredPerms.some((p) => permissionResults.value[p]);
  });
});

onMounted(() => {
  resolvePanelPermissions();
});
</script>
