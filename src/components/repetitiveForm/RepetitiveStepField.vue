<template>
  <div class="w-full" data-testid="repetitive-step-field">
    <!-- The picker and the create form render as views INSIDE the flow's
         single modal. Nested <dialog> elements would steal the app-wide
         '.base-modal--opened' teleport target used by tooltips/dropdowns. -->
    <div v-if="step.metadataOnly" data-testid="repetitive-step-metadata">
      <div class="flex gap-3 mb-4" data-testid="repetitive-step-actions">
        <slot name="actions" />
      </div>
      <!-- no entity of its own: just collects field values (e.g. relation
           metadata) for the flow to attach to an earlier step's entity -->
      <DynamicForm
        :key="step.key"
        :dynamic-form-query="step.createForm"
        :router="router"
        :skip-entity-mutation="true"
        @values-submitted="onMetadataSubmitted"
      />
    </div>

    <div v-else-if="view === 'pick'" data-testid="repetitive-step-picker">
      <!-- one row: the flow's back button (slot) next to this step's buttons -->
      <div class="flex gap-3 mb-4" data-testid="repetitive-step-actions">
        <slot name="actions" />
        <RepetitiveCreateButton
          v-if="creatableOptions.length"
          :types="creatableOptions"
          @select="chooseType"
        />
      </div>
      <!-- keyed per step: the picker loads its custom query on mount only -->
      <EntityPickerComponent
        :key="step.key"
        :entity-uuid="pickerParentUuid"
        :filter-parent-entity="getForm(parentEntityId)?.values"
        :accepted-types="acceptedTypes"
        :custom-query="step.pickerQuery ?? ''"
        :custom-filters-query="step.pickerFiltersQuery ?? undefined"
        :force-show-filters="step.pickerFiltersCollapsed !== undefined ? !step.pickerFiltersCollapsed : false"
        :computed-filters="computedFilters"
        :show-button="true"
        :selection-enabled="step.maxSelection === -1 ? true : step.maxSelection >= 1"
        :enable-bulk-operations="true"
        :enable-advanced-filters="true"
        :entity-picker-mode="EntityPickerMode.Emit"
        :should-use-state-for-route="false"
        :selection-limit="step.maxSelection ?? undefined"
        base-library-height="max-h-[55vh]"
        :search-mode="step.entityPickerSearchConfig?.mode ?? undefined"
        :search-metadata-keys="step.entityPickerSearchConfig?.metadataKeys ?? undefined"
        :search-accepted-types="step.entityPickerSearchConfig?.acceptedTypes ?? undefined"
        :search-static-filters="step.entityPickerSearchConfig?.staticFilters ?? undefined"
        @entities-selected="onPicked"
      />
    </div>

    <div v-else data-testid="repetitive-step-create">
      <div class="flex gap-3 mb-4" data-testid="repetitive-step-actions">
        <slot name="actions" />
        <div v-if="showBackFromCreate" class="w-fit">
          <BaseButtonNew
            data-testid="repetitive-step-back-to-search"
            :label="$t(backLabel)"
            :icon="DamsIcons.AngleLeft"
            button-style="accentAccent"
            button-size="small"
            @click="goBackFromCreate"
          />
        </div>
      </div>
      <!-- keyed per chosen type: a reused instance would keep the previous
           form's state and submit empty/mismatched metadata -->
      <DynamicForm
        v-if="selectedType"
        :key="`${step.key}:${selectedType.entityType}`"
        :dynamic-form-query="selectedType.createForm"
        :router="router"
        :prefilled-form-values="createPrefill"
        :emit-entity-created="true"
        @entity-created="onCreated"
      />
      <!-- no picker to fall back on (skipSearch) and more than one type:
           let the user pick which type to create first -->
      <RepetitiveCreateButton
        v-else
        :types="creatableOptions"
        @select="chooseType"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import {
  DamsIcons,
  EntityPickerMode,
  type AdvancedFilterInput,
  type RepetitiveStep,
  type RepetitiveCreatableType,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import {
  describePickedItem,
  type StagedEntityDetail,
} from "@/composables/useRepetitiveForm";
import { getEntityIdFromRoute } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import useEntitySingle from "@/composables/useEntitySingle";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import RepetitiveCreateButton from "@/components/repetitiveForm/RepetitiveCreateButton.vue";

type SelectedEntity = {
  id: string;
  label?: string;
  details?: StagedEntityDetail[];
  values?: Record<string, unknown>;
};

const props = withDefaults(
  defineProps<{
    step: RepetitiveStep;
    scopeFilter?: AdvancedFilterInput | null;
    skipSearch?: boolean;
    createPrefill?: object;
    pickerParentUuid?: string;
  }>(),
  {
    scopeFilter: null,
    skipSearch: false,
    createPrefill: undefined,
    pickerParentUuid: "",
  },
);

const emit = defineEmits<{
  (e: "selected", entity: SelectedEntity): void;
  (e: "created", entity: any, entityType?: string): void;
  (e: "metadataSubmitted", values: Record<string, unknown>): void;
}>();

const router = useRouter();
const { getForm } = useFormHelper();

// the entity whose detail page hosts the flow (e.g. the boekenbank); parent
// values are read from its form the same way copyValueFromParent does
const parentEntityId = getEntityIdFromRoute();

const allCreatableOptions = computed<RepetitiveCreatableType[]>(() => {
  if (props.step.creatableTypes?.length) return props.step.creatableTypes;
  if (!props.step.createForm) return [];
  return [
    {
      label: "repetitiveForm.create-new",
      entityType: props.step.entityType,
      createForm: props.step.createForm,
    },
  ];
});

const normalizeTypeValue = (raw: unknown): string | undefined => {
  let value: unknown = Array.isArray(raw) ? raw[0] : raw;
  if (value && typeof value === "object")
    value = (value as any).value ?? (value as any).key;
  return typeof value === "string" && value ? value : undefined;
};

// when the step's subtype is already decided by a parent value
// (creatableTypeFromParentKey, e.g. the boekenbank's "expression_type"), read
// it from the parent entity and match it to one of the creatable types
const parentDerivedType = (): RepetitiveCreatableType | null => {
  const key = props.step.creatableTypeFromParentKey;
  if (!key) return null;
  const value = normalizeTypeValue(
    getForm(parentEntityId)?.values?.intialValues?.[key],
  );
  if (!value) return null;
  return (
    allCreatableOptions.value.find((type) => type.entityType === value) ?? null
  );
};

// a parent-decided subtype collapses the options to that one type, so no
// chooser is shown; otherwise the full configured list is offered
const creatableOptions = computed<RepetitiveCreatableType[]>(() => {
  const derived = parentDerivedType();
  return derived ? [derived] : allCreatableOptions.value;
});

// a single option needs no chooser; multiple options stay unselected until
// the user picks one from the dropdown
const defaultSelectedType = (): RepetitiveCreatableType | null =>
  creatableOptions.value.length === 1 ? creatableOptions.value[0] : null;

const initialView = () => (props.skipSearch ? "create" : "pick");
const view = ref<"pick" | "create">(initialView());
const selectedType = ref<RepetitiveCreatableType | null>(defaultSelectedType());

const acceptedTypes = computed<string[]>(
  () => props.step.acceptedTypes ?? [props.step.entityType],
);

const computedFilters = computed<AdvancedFilterInput[] | undefined>(() =>
  props.scopeFilter ? [props.scopeFilter] : undefined,
);

const showBackFromCreate = computed(
  () =>
    !props.skipSearch ||
    (creatableOptions.value.length > 1 && !!selectedType.value),
);
const backLabel = computed(() =>
  props.skipSearch
    ? "repetitiveForm.change-type"
    : "repetitiveForm.back-to-search",
);

const chooseType = (type: RepetitiveCreatableType) => {
  selectedType.value = type;
  view.value = "create";
};

const goBackFromCreate = () => {
  if (!props.skipSearch) {
    view.value = "pick";
    selectedType.value = defaultSelectedType();
    return;
  }
  // skipSearch: no picker to return to, so go back to the type chooser
  selectedType.value = null;
};

// the field stays mounted across steps; reset the view when the step changes
watch(
  () => props.step.key,
  () => {
    view.value = initialView();
    selectedType.value = defaultSelectedType();
  },
);

watch(
  [view, () => props.pickerParentUuid],
  ([currentView, parentUuid]) => {
    if (currentView === "create" && parentUuid) {
      useEntitySingle().setEntityUuid(parentUuid);
    }
  },
  { immediate: true },
);

const onPicked = (items: InBulkProcessableItem[]) => {
  const item = items?.[0];
  if (!item) return;
  const { label, details } = describePickedItem(item);
  emit("selected", { id: item.id, label, details, values: item.intialValues });
};

const onCreated = (entity: any) => {
  emit("created", entity, selectedType.value?.entityType);
};

const onMetadataSubmitted = (values: Record<string, unknown>) => {
  emit("metadataSubmitted", values);
};
</script>
