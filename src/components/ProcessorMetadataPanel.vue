<template>
  <div v-if="processorConfig?.panels" class="processor-metadata-panels">
    <div
      v-for="(panel, panelIndex) in processorConfig.panels"
      :key="panelIndex"
      class="p-2 w-full"
    >
      <div
        @click="togglePanel(panelIndex)"
        class="flex items-center justify-between cursor-pointer"
      >
        <h2>{{ t(panel.label) }}</h2>
        <unicon
          :name="
            !collapsedPanels[panelIndex]
              ? Unicons.CompressAlt.name
              : Unicons.ExpandAlt.name
          "
        />
      </div>

      <transition>
        <div v-show="!collapsedPanels[panelIndex]">
          <div
            v-for="field in panel.fields"
            :key="field.key"
            class="py-2 px-2"
          >
            <div class="text-sm font-semibold text-text-body mb-1">
              {{ t(field.label) }}
              <span v-if="field.isRequired && isEditing" class="text-red-500"
                >*</span
              >
            </div>

            <template v-if="isEditing && panel.isEditable">
              <input
                v-if="isTextField(field.inputFieldType)"
                type="text"
                :value="editValues[field.key] ?? field.value"
                @input="
                  updateEditValue(
                    field.key,
                    ($event.target as HTMLInputElement).value,
                  )
                "
                class="w-full border border-neutral-30 rounded px-2 py-1 text-sm"
                :required="field.isRequired"
              />

              <input
                v-else-if="field.inputFieldType === 'baseNumberField'"
                type="number"
                :value="editValues[field.key] ?? field.value"
                @input="
                  updateEditValue(
                    field.key,
                    ($event.target as HTMLInputElement).value,
                  )
                "
                class="w-full border border-neutral-30 rounded px-2 py-1 text-sm"
                :required="field.isRequired"
              />

              <label
                v-else-if="field.inputFieldType === 'baseCheckbox'"
                class="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  :checked="
                    toBoolean(editValues[field.key] ?? field.value)
                  "
                  @change="
                    updateEditValue(
                      field.key,
                      ($event.target as HTMLInputElement).checked.toString(),
                    )
                  "
                />
                <span class="text-sm">{{ t(field.label) }}</span>
              </label>

              <select
                v-else-if="
                  field.inputFieldType === 'baseSelectField' &&
                  field.inValues?.length
                "
                :value="editValues[field.key] ?? field.value"
                @change="
                  updateEditValue(
                    field.key,
                    ($event.target as HTMLSelectElement).value,
                  )
                "
                class="w-full border border-neutral-30 rounded px-2 py-1 text-sm"
              >
                <option value="">--</option>
                <option
                  v-for="opt in field.inValues"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>

              <span
                v-else-if="field.inputFieldType === 'hasWriterField'"
                class="text-sm text-text-placeholder"
              >
                {{ field.value || t("metadata.labels.writer") }}
              </span>

              <input
                v-else
                type="text"
                :value="editValues[field.key] ?? field.value"
                @input="
                  updateEditValue(
                    field.key,
                    ($event.target as HTMLInputElement).value,
                  )
                "
                class="w-full border border-neutral-30 rounded px-2 py-1 text-sm"
              />
            </template>

            <template v-else>
              <span
                v-if="field.inputFieldType === 'baseCheckbox'"
                class="text-sm"
              >
                {{ toBoolean(field.value) ? "Yes" : "No" }}
              </span>
              <span v-else class="text-sm text-text-body">
                {{ field.value || "-" }}
              </span>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";

interface ProcessorConfigField {
  key: string;
  label: string;
  inputFieldType: string;
  isRequired?: boolean;
  inValues?: string[];
  value: string;
}

interface ProcessorConfigPanel {
  label: string;
  panelType: string;
  isEditable: boolean;
  fields: ProcessorConfigField[];
}

interface ProcessorConfig {
  panels: ProcessorConfigPanel[];
}

defineProps<{
  processorConfig: ProcessorConfig | null;
  isEditing: boolean;
}>();

defineEmits<{
  (event: "save", values: Record<string, string>): void;
}>();

const { t } = useI18n();

const collapsedPanels = reactive<Record<number, boolean>>({});
const editValues = reactive<Record<string, string>>({});

const togglePanel = (index: number) => {
  collapsedPanels[index] = !collapsedPanels[index];
};

const isTextField = (type: string) =>
  type === "baseTextField" || type === "baseTextField";

const toBoolean = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return !!value;
};

const updateEditValue = (key: string, value: string) => {
  editValues[key] = value;
};

const getChangedValues = (): Record<string, string> => {
  return { ...editValues };
};

defineExpose({ getChangedValues });
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.1s linear;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0%);
  transform-origin: top;
}
</style>
