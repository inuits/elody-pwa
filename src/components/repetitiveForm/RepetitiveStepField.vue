<template>
  <div class="w-full" data-testid="repetitive-step-field">
    <button
      type="button"
      data-testid="repetitive-step-trigger"
      class="w-full text-left border rounded px-3 py-2"
      @click="activate"
    >
      {{ selectedEntity ? selectedEntity.label || selectedEntity.id : placeholder }}
    </button>

    <RepetitiveStepModal :open="pickerOpen" @close="pickerOpen = false">
      <EntityPickerComponent
        :entity-uuid="pickerParentUuid"
        :accepted-types="acceptedTypes"
        :custom-query="step.pickerQuery ?? ''"
        :custom-filters-query="step.pickerFiltersQuery"
        :computed-filters="computedFilters"
        :show-button="false"
        :enable-bulk-operations="false"
        :enable-advanced-filters="true"
        :entity-picker-mode="EntityPickerMode.Emit"
        @entities-selected="onPicked"
      />
      <button
        type="button"
        data-testid="repetitive-step-create-new"
        class="mt-2 underline"
        @click="openCreate"
      >
        {{ $t("repetitiveForm.create-new") }}
      </button>
    </RepetitiveStepModal>

    <RepetitiveStepModal :open="createOpen" @close="createOpen = false">
      <DynamicForm
        :dynamic-form-query="step.createForm"
        :router="router"
        :prefilled-form-values="createPrefill"
        @entity-created="onCreated"
      />
    </RepetitiveStepModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  EntityPickerMode,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import type { RepetitiveStepConfig } from "@/composables/useRepetitiveForm";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
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
    placeholder?: string;
  }>(),
  {
    scopeFilter: null,
    skipSearch: false,
    createPrefill: undefined,
    pickerParentUuid: "",
    placeholder: "",
  },
);

const emit = defineEmits<{
  (e: "selected", entity: SelectedEntity): void;
  (e: "created", entity: any): void;
}>();

const router = useRouter();
const pickerOpen = ref(false);
const createOpen = ref(false);
const selectedEntity = ref<SelectedEntity | null>(null);

const acceptedTypes = computed<string[]>(
  () => props.step.acceptedTypes ?? [props.step.entityType],
);

const computedFilters = computed<AdvancedFilterInput[] | undefined>(() =>
  props.scopeFilter ? [props.scopeFilter] : undefined,
);

const activate = () => {
  if (props.skipSearch) createOpen.value = true;
  else pickerOpen.value = true;
};

const openCreate = () => {
  pickerOpen.value = false;
  createOpen.value = true;
};

const onPicked = (items: InBulkProcessableItem[]) => {
  const item = items?.[0];
  if (!item) return;
  const entity: SelectedEntity = { id: item.id, label: (item as any).value };
  selectedEntity.value = entity;
  emit("selected", entity);
  pickerOpen.value = false;
};

const onCreated = (entity: any) => {
  selectedEntity.value = { id: entity.id ?? entity.uuid };
  emit("created", entity);
  createOpen.value = false;
};
</script>
