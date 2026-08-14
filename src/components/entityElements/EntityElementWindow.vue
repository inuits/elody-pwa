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
      class="h-full w-full border-solid border rounded-lg @container/window"
      role="region"
      :aria-label="previewLabel ? t(previewLabel) : t(element.label)"
      :class="
        isSectionHeader
          ? 'border-accent bg-accent'
          : 'border-accent-light-strong bg-neutral-white'
      "
    >
      <!-- the full accent is reserved for section-level headers (a window
           that only carries a label); content panels get the light band -->
      <div
        class="border-solid border-b rounded-t-lg flex flex-row items-center"
        :class="
          isSectionHeader
            ? 'border-accent bg-accent'
            : 'border-accent-light-strong bg-accent-light'
        "
      >
        <h3
          data-cy="entity-element-window-title"
          class="text-value font-bold px-4 py-2.5 m-0"
          :class="isSectionHeader ? 'text-neutral-white' : 'text-accent-dark'"
        >
          {{ previewLabel ? t(previewLabel) : t(element.label) }}
        </h3>

        <div
          v-if="element.windowElementStatus"
          class="relative flex gap-4 items-center"
        >
          <h2 v-if="element.windowElementStatus.label">{{ t(element.windowElementStatus.label) }}</h2>
          <!-- quality status chip: click explains WHY a record is (not)
               checkable, listing blocking empty required fields as jumps -->
          <button
            type="button"
            data-cy="quality-status-chip"
            aria-haspopup="dialog"
            :aria-expanded="statusPopoverOpen"
            class="flex items-center gap-1 cursor-pointer rounded-md border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-accent-accent"
            @click.stop="statusPopoverOpen = !statusPopoverOpen"
          >
            <MetadataWrapper
              class="w-full pointer-events-none"
              :metadata="getStatusMetadata()"
              :form-id="formId"
              :isEdit="computedIsEdit"
            />
            <unicon :name="Unicons.AngleDown.name" height="14" />
          </button>
          <div
            v-if="statusPopoverOpen"
            role="dialog"
            data-cy="quality-status-popover"
            :aria-label="
              element.windowElementStatus.label
                ? t(element.windowElementStatus.label)
                : translate('quality-status.title', 'Quality status')
            "
            class="absolute left-0 top-9 z-popover w-[290px] rounded-overlay border border-neutral-40 bg-neutral-white p-4 text-value shadow-overlay"
            @click.stop
            @keydown.escape.stop="statusPopoverOpen = false"
          >
            <template v-if="requiredEmptyFields.length > 0">
              <p class="m-0 pb-1.5">
                {{
                  translate(
                    "quality-status.blocked",
                    "Not checkable yet — required and empty:",
                  )
                }}
              </p>
              <button
                v-for="field in requiredEmptyFields"
                :key="field.key"
                type="button"
                class="block w-full cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-left text-value font-bold text-red-default hover:bg-red-light focus-visible:outline-2 focus-visible:outline-accent-accent"
                @click="jumpToField(field.key)"
              >
                → {{ getTranslatedMessage(field.label) }}
              </button>
            </template>
            <p v-else class="m-0 font-bold text-green-700">
              {{
                translate(
                  "quality-status.clear",
                  "All required fields are filled.",
                )
              }}
            </p>
          </div>
        </div>


        <!-- No window-wide edit button: editing is per field, block or row. -->
        <div
          class="flex align-center ml-auto"
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
              'border-solid border-neutral-20 border-b':
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
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { auth } from "@/main";
import { useEditMode } from "@/composables/useEdit";
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
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import EventBus from "@/EventBus";
import { Unicons } from "@/types";
import { useFormHelper } from "@/composables/useFormHelper";
import { getTranslatedMessage } from "@/helpers";
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

const { t, te } = useI18n();
const { getForm } = useFormHelper();
const { fetchAdvancedPermissions, fetchUpdateAndDeletePermission } =
  usePermissions();
const useEditHelper = useEditMode(props.formId);

const permissionResults = ref<Record<string, boolean>>({});
const entityDetailPermissions = ref<Map<Permission, boolean> | null>(null);
const isCheckingPermissions = ref(true);

const computedIsEdit = computed(
  () => props.isEditOverwrite || useEditHelper.isEdit,
);

const translate = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;

// a window with a label but no panels is a section-level header
const isSectionHeader = computed<boolean>(() => allPanels.value.length === 0);

const statusPopoverOpen = ref<boolean>(false);

// Outside click closes the quality-status popover.
const closeStatusPopover = () => (statusPopoverOpen.value = false);
watch(statusPopoverOpen, (open) => {
  if (open) document.addEventListener("click", closeStatusPopover);
  else document.removeEventListener("click", closeStatusPopover);
});
onBeforeUnmount(() =>
  document.removeEventListener("click", closeStatusPopover),
);

// Blocking fields: required per input-field config AND currently empty.
const requiredEmptyFields = computed<{ key: string; label: string }[]>(() => {
  const form = getForm(props.formId);
  if (!form) return [];
  const result: { key: string; label: string }[] = [];
  for (const panel of allPanels.value) {
    for (const value of Object.values(panel)) {
      const metadata = value as any;
      if (metadata?.__typename !== "PanelMetaData") continue;
      const rules = metadata.inputField?.validation?.value;
      if (!rules || !String(rules).includes("required")) continue;
      const currentValue = (form.values.intialValues as any)?.[metadata.key];
      const isEmpty =
        currentValue === undefined ||
        currentValue === null ||
        (typeof currentValue === "string" && currentValue.trim() === "") ||
        (Array.isArray(currentValue) && currentValue.length === 0);
      if (isEmpty) result.push({ key: metadata.key, label: metadata.label });
    }
  }
  return result;
});

const jumpToField = (fieldKey: string) => {
  statusPopoverOpen.value = false;
  EventBus.emit("jumpToPanelField", fieldKey);
};

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
