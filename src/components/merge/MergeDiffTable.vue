<template>
  <div class="w-full">
    <p v-if="rows.length === 0" class="py-4 text-text-subtitle">
      {{ t("bulk-operations.merge-modal.no-differences") }}
    </p>

    <div v-else class="w-full overflow-x-auto">
      <table class="w-full table-fixed border-collapse">
        <thead>
          <tr class="border-b border-neutral-40">
            <th class="w-1/4 p-2 text-left align-bottom">
              {{ t("bulk-operations.merge-modal.field") }}
            </th>
            <th
              v-for="side in sides"
              :key="side.name"
              class="w-3/8 p-2 text-left align-bottom"
            >
              {{ side.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            class="border-b border-neutral-30"
          >
            <td class="p-2 font-bold align-top">{{ row.label }}</td>
            <td v-for="side in sides" :key="side.name" class="p-2 align-top">
              <label class="flex gap-2 cursor-pointer items-start">
                <input
                  type="radio"
                  class="mt-1"
                  :name="`merge-${row.key}`"
                  :value="side.name"
                  :checked="choiceFor(row.key) === side.name"
                  :data-testid="`choice-${row.key}-${side.name}`"
                  @change="choose(row.key, side.name)"
                />
                <span>{{ displayValue(valueFor(row, side.name)) }}</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type {
  MergeChoices,
  MergeRow,
  MergeSide,
} from "@/composables/useMergeDiff";

const props = withDefaults(
  defineProps<{
    rows: MergeRow[];
    leftLabel: string;
    rightLabel: string;
    choices?: MergeChoices;
  }>(),
  { choices: () => ({}) },
);

const emit = defineEmits<{
  (event: "update:choices", choices: MergeChoices): void;
}>();

const { t } = useI18n();

const sides = computed<{ name: MergeSide; label: string }[]>(() => [
  { name: "left", label: props.leftLabel },
  { name: "right", label: props.rightLabel },
]);

const choiceFor = (key: string): MergeSide => props.choices[key] ?? "left";

const valueFor = (row: MergeRow, side: MergeSide): unknown =>
  side === "left" ? row.leftValue : row.rightValue;

const displayValue = (value: unknown): string => {
  if (value === undefined || value === null || value === "")
    return t("bulk-operations.merge-modal.empty-value");
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const choose = (key: string, side: MergeSide) => {
  emit("update:choices", { ...props.choices, [key]: side });
};
</script>
