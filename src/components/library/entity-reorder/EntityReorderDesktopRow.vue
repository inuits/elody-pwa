<template>
  <div
    data-cy="entity-reorder-row"
    class="flex items-center gap-2 min-h-12 py-0.5 pr-2 pl-1 border-b border-border-subtle last:border-b-0 cursor-grab"
  >
    <unicon
      :name="Unicons.Draggabledots.name"
      height="20"
      class="w-6 shrink-0 text-text-muted"
    />
    <input
      type="number"
      min="1"
      :max="total"
      :aria-label="t('reorder.position')"
      :value="draft ?? index + 1"
      class="w-12 h-8.5 shrink-0 border border-border-default rounded-input text-center font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      @focus="selectInputText"
      @input="updateDraft"
      @keydown.enter="blurInput"
      @keydown.esc="draft = undefined"
      @blur="commitDraft"
    />
    <EntityReorderThumbnail :url="thumbnail" />
    <span class="flex-1 min-w-0 truncate text-text-link">{{ name }}</span>
    <span class="flex justify-center gap-0.5 w-20">
      <button
        v-for="arrow in arrows"
        :key="arrow.direction"
        type="button"
        class="w-8.5 h-8.5 flex items-center justify-center rounded-button hover:bg-accent-wash cursor-pointer disabled:text-text-disabled disabled:cursor-not-allowed"
        :disabled="!canMove(arrow.direction)"
        :title="arrowTitle(arrow)"
        :aria-label="arrowTitle(arrow)"
        @click="emit('move', index + arrow.direction)"
      >
        <unicon :name="arrow.icon" height="22" />
      </button>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import EntityReorderThumbnail from "@/components/library/entity-reorder/EntityReorderThumbnail.vue";
import { isValidPosition } from "@/composables/reorder/reorderHelpers";

type Arrow = { direction: number; icon: string; label: string };

const props = defineProps<{
  index: number;
  total: number;
  page: number;
  name: string;
  thumbnail?: string;
  isFirstRowOfPage: boolean;
  isLastRowOfPage: boolean;
}>();

const emit = defineEmits<{ (event: "move", target: number): void }>();

const arrows: Arrow[] = [
  { direction: -1, icon: Unicons.AngleUp.name, label: "reorder.move-up" },
  { direction: 1, icon: Unicons.AngleDown.name, label: "reorder.move-down" },
];

const { t } = useI18n();
const draft = ref<string>();

const canMove = (direction: number) => {
  const target = props.index + direction;
  return target >= 0 && target < props.total;
};

const arrowTitle = (arrow: Arrow) => {
  const movesToPreviousPage =
    arrow.direction < 0 && props.isFirstRowOfPage && canMove(-1);
  const movesToNextPage =
    arrow.direction > 0 && props.isLastRowOfPage && canMove(1);

  if (movesToPreviousPage)
    return t("reorder.to-end-of-page", { page: props.page });
  if (movesToNextPage)
    return t("reorder.to-start-of-page", { page: props.page + 2 });
  return t(arrow.label);
};

const selectInputText = (event: FocusEvent) =>
  (event.target as HTMLInputElement).select();

const blurInput = (event: KeyboardEvent) =>
  (event.target as HTMLInputElement).blur();

const updateDraft = (event: Event) => {
  draft.value = (event.target as HTMLInputElement).value;
};

const commitDraft = () => {
  const position = Number(draft.value);
  draft.value = undefined;
  if (isValidPosition(position, props.total)) emit("move", position - 1);
};
</script>
