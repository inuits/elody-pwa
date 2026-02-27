<template>
  <div
    v-if="subFields.length"
    class="relation-metadata-list-field flex flex-col gap-1"
  >
    <!-- Add button – aligned with the field label in MetadataWrapper (absolute top-right) -->
    <div v-if="!disabled" class="absolute top-0 right-0">
      <BaseButtonNew
        class="!w-auto"
        :icon="DamsIcons.Plus"
        :label="t('actions.labels.add-entry')"
        button-style="accentNormal"
        button-size="verySmall"
        @click="addItem"
      />
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-[rgba(0,58,82,0.2)]">
      <div class="grid" :style="gridStyle">
        <!-- Header row -->
        <div
          v-for="(subField, index) in subFields"
          :key="`header-${subField.key}`"
          class="flex items-center bg-background-normal px-2 py-1.5 text-xs font-medium text-text-body border-b border-[rgba(0,58,82,0.2)]"
          :class="{
            'border-r border-r-[rgba(0,58,82,0.2)]':
              index < subFields.length - 1,
          }"
        >
          {{ t(subField.label) }}
        </div>
        <div
          v-if="!disabled"
          class="bg-background-normal border-b border-[rgba(0,58,82,0.2)] border-l border-l-[rgba(0,58,82,0.2)]"
        />

        <!-- Data rows -->
        <template v-for="(item, rowIndex) in items" :key="rowIndex">
          <div
            v-for="(subField, colIndex) in subFields"
            :key="subField.key"
            class="flex items-center px-2 py-1 border-b border-[rgba(0,58,82,0.08)]"
            :class="{
              'border-r border-r-[rgba(0,58,82,0.15)]':
                colIndex < subFields.length - 1,
            }"
          >
            <BaseInputTextNumberDatetime
              v-if="subField.type === InputFieldTypes.Text"
              class="w-full"
              :model-value="item[subField.key] as string"
              input-style="defaultWithBorder"
              type="text"
              :disabled="disabled"
              @update:model-value="updateValue(rowIndex, subField.key, $event)"
            />
            <BaseInputTextNumberDatetime
              v-else-if="subField.type === InputFieldTypes.Checkbox"
              :model-value="item[subField.key] as string"
              input-style="defaultWithBorder"
              type="checkbox"
              :disabled="disabled"
              @update:model-value="updateValue(rowIndex, subField.key, $event)"
            />
            <AdvancedDropdown
              v-else-if="subField.type === InputFieldTypes.Dropdown"
              class="w-full"
              :model-value="item[subField.key] as string"
              :options="(subField.options as DropdownOption[]) ?? []"
              :disable="disabled"
              style-type="defaultWithBorder"
              @update:model-value="updateValue(rowIndex, subField.key, $event)"
            />
            <ViewModesAutocompleteMetadata
              v-else-if="
                subField.type === InputFieldTypes.DropdownMultiselectMetadata ||
                subField.type === InputFieldTypes.DropdownSingleselectMetadata
              "
              v-model:model-value="item[subField.key] as string[]"
              :metadata-dropdown-options="subField.options"
              :canCreateOption="true"
              :select-type="
                subField.type === InputFieldTypes.DropdownSingleselectMetadata
                  ? 'single'
                  : 'multi'
              "
              :disabled="false"
              mode="edit"
            />
          </div>
          <div
            v-if="!disabled"
            class="flex items-center justify-center px-1 py-1 border-b border-[rgba(0,58,82,0.08)] border-l border-l-[rgba(0,58,82,0.2)]"
          >
            <BaseButtonNew
              class="!w-auto"
              :icon="DamsIcons.Trash"
              button-style="redDefault"
              button-size="verySmall"
              @click="removeItem(rowIndex)"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  type DropdownOption,
  type SubField,
  InputFieldTypes,
} from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";

const props = defineProps<{
  modelValue: Record<string, any>[] | undefined;
  subFields: SubField[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>[]): void;
}>();

const { t } = useI18n();

const gridStyle = computed(() => {
  const cols = props.subFields.map((sf) =>
    sf.type === InputFieldTypes.Checkbox
      ? "max-content"
      : "minmax(max-content, 1fr)",
  );
  if (!props.disabled) cols.push("max-content");
  return { gridTemplateColumns: cols.join(" ") };
});

const items = ref<Record<string, any>[]>(props.modelValue ?? []);

watch(
  () => props.modelValue,
  (newValue) => {
    items.value = newValue ?? [];
  },
  { deep: true },
);

const emitUpdate = () => {
  emit("update:modelValue", items.value);
};

const updateValue = (rowIndex: number, key: string, value: any) => {
  items.value[rowIndex] = { ...items.value[rowIndex], [key]: value };
  emitUpdate();
};

const addItem = () => {
  const emptyItem: Record<string, any> = {};
  for (const subField of props.subFields) {
    emptyItem[subField.key] =
      subField.type === InputFieldTypes.Checkbox ? false : "";
  }
  items.value.push(emptyItem);
  emitUpdate();
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
  emitUpdate();
};
</script>
