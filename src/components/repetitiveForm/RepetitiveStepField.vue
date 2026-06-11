<template>
  <div class="w-full" data-testid="repetitive-step-field">
    <!-- The picker and the create form render as views INSIDE the flow's
         single modal. Nested <dialog> elements would steal the app-wide
         '.base-modal--opened' teleport target used by tooltips/dropdowns. -->
    <div v-if="view === 'pick'" data-testid="repetitive-step-picker">
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
        base-library-height="h-[55vh]"
        @entities-selected="onPicked"
      />
      <div class="w-fit mt-4">
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

    <div v-else data-testid="repetitive-step-create">
      <div v-if="!skipSearch" class="w-fit mb-4">
        <BaseButtonNew
          data-testid="repetitive-step-back-to-search"
          :label="$t('repetitiveForm.back-to-search')"
          :icon="DamsIcons.AngleLeft"
          button-style="default"
          button-size="small"
          class="border border-neutral-50"
          @click="view = 'pick'"
        />
      </div>
      <DynamicForm
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
import type { RepetitiveStepConfig } from "@/composables/useRepetitiveForm";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

type SelectedEntity = { id: string; label?: string };

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
  emit("selected", { id: item.id, label: (item as any).value });
};

const onCreated = (entity: any) => {
  emit("created", entity);
};
</script>
