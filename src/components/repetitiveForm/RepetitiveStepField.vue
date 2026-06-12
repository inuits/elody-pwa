<template>
  <div class="w-full" data-testid="repetitive-step-field">
    <!-- The picker and the create form render as views INSIDE the flow's
         single modal. Nested <dialog> elements would steal the app-wide
         '.base-modal--opened' teleport target used by tooltips/dropdowns. -->
    <div v-if="view === 'pick'" data-testid="repetitive-step-picker">
      <!-- one row: the flow's back button (slot) next to this step's buttons -->
      <div class="flex gap-3 mb-4" data-testid="repetitive-step-actions">
        <slot name="actions" />
        <div class="w-fit">
          <BaseButtonNew
            data-testid="repetitive-step-create-new"
            :label="$t('repetitiveForm.create-new')"
            :icon="DamsIcons.Plus"
            button-style="accentAccent"
            button-size="small"
            @click="openCreate"
          />
        </div>
      </div>
      <!-- keyed per step: the picker loads its custom query on mount only -->
      <EntityPickerComponent
        :key="step.key"
        :entity-uuid="pickerParentUuid"
        :accepted-types="acceptedTypes"
        :custom-query="step.pickerQuery ?? ''"
        :custom-filters-query="step.pickerFiltersQuery"
        :computed-filters="computedFilters"
        :show-button="true"
        :enable-bulk-operations="true"
        :enable-advanced-filters="true"
        :entity-picker-mode="EntityPickerMode.Emit"
        :should-use-state-for-route="false"
        :selection-limit="step.maxSelection"
        base-library-height="h-[55vh]"
        @entities-selected="onPicked"
      />
    </div>

    <div v-else data-testid="repetitive-step-create">
      <div class="flex gap-3 mb-4" data-testid="repetitive-step-actions">
        <slot name="actions" />
        <div v-if="!skipSearch" class="w-fit">
          <BaseButtonNew
            data-testid="repetitive-step-back-to-search"
            :label="$t('repetitiveForm.back-to-search')"
            :icon="DamsIcons.AngleLeft"
            button-style="accentAccent"
            button-size="small"
            @click="view = 'pick'"
          />
        </div>
      </div>
      <!-- keyed per step: a reused instance would keep the previous step's
           form state and submit empty metadata -->
      <DynamicForm
        :key="step.key"
        :dynamic-form-query="step.createForm"
        :router="router"
        :prefilled-form-values="createPrefill"
        :emit-entity-created="true"
        @entity-created="onCreated"
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
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import {
  describePickedItem,
  type RepetitiveStepConfig,
  type StagedEntityDetail,
} from "@/composables/useRepetitiveForm";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

type SelectedEntity = {
  id: string;
  label?: string;
  details?: StagedEntityDetail[];
  values?: Record<string, unknown>;
};

const props = withDefaults(
  defineProps<{
    step: RepetitiveStepConfig;
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
  (e: "created", entity: any): void;
}>();

const router = useRouter();

const initialView = () => (props.skipSearch ? "create" : "pick");
const view = ref<"pick" | "create">(initialView());

const acceptedTypes = computed<string[]>(
  () => props.step.acceptedTypes ?? [props.step.entityType],
);

const computedFilters = computed<AdvancedFilterInput[] | undefined>(() =>
  props.scopeFilter ? [props.scopeFilter] : undefined,
);

const openCreate = () => {
  view.value = "create";
};

// the field stays mounted across steps; reset the view when the step changes
watch(
  () => props.step.key,
  () => {
    view.value = initialView();
  },
);

const onPicked = (items: InBulkProcessableItem[]) => {
  const item = items?.[0];
  if (!item) return;
  const { label, details } = describePickedItem(item);
  emit("selected", { id: item.id, label, details, values: item.intialValues });
};

const onCreated = (entity: any) => {
  emit("created", entity);
};
</script>
