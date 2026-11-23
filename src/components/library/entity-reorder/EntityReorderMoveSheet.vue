<template>
  <div
    class="absolute inset-0 z-overlay flex flex-col justify-end bg-scrim"
    @click="emit('close')"
  >
    <div
      role="dialog"
      :aria-label="t('reorder.sheet-title', { name })"
      class="flex flex-col gap-3.5 p-(--sheet-padding) bg-surface rounded-t-(--sheet-radius) shadow-modal"
      @click.stop
    >
      <div class="w-10 h-1 self-center rounded-pill bg-border-default" />
      <div class="flex items-start gap-2">
        <span class="flex flex-col gap-0.5 flex-1 min-w-0">
          <span class="text-heading font-bold truncate">{{
            t("reorder.sheet-title", { name })
          }}</span>
          <span class="text-label text-text-muted">{{
            t("reorder.sheet-where", {
              position: index + 1,
              total,
              page: pageOfIndex(index, pageSize) + 1,
            })
          }}</span>
        </span>
        <button
          type="button"
          class="w-11 h-11 -mt-1.5 -mr-2 flex items-center justify-center cursor-pointer"
          :aria-label="t('reorder.dismiss')"
          @click="emit('close')"
        >
          <unicon :name="Unicons.Cross.name" height="24" />
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="action in quickMoves"
          :key="action.label"
          type="button"
          class="h-13 flex items-center justify-center gap-2 border border-border-default rounded-card font-bold cursor-pointer disabled:text-text-disabled disabled:cursor-not-allowed"
          :disabled="action.target === index"
          @click="moveTo(action.target)"
        >
          <unicon :name="action.icon" height="20" />
          {{ t(action.label) }}
        </button>
      </div>
      <form
        class="flex flex-col gap-1.5 pt-2.5 border-t border-border-subtle"
        @submit.prevent="moveToTypedPosition"
      >
        <label for="reorder-sheet-position" class="font-bold text-text-link">{{
          t("reorder.move-to-position")
        }}</label>
        <div class="flex gap-2">
          <input
            id="reorder-sheet-position"
            v-model="typedPosition"
            type="number"
            inputmode="numeric"
            min="1"
            :max="total"
            :placeholder="`1–${total}`"
            class="flex-1 min-w-0 h-12 px-3.5 border border-border-default rounded-input font-bold"
          />
          <BaseButtonNew
            class="!w-auto"
            button-style="primary"
            :label="t('reorder.move')"
            :force-show-label="true"
            :disabled="!isValidPosition(Number(typedPosition), total)"
            @click="moveToTypedPosition"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  isValidPosition,
  pageOfIndex,
} from "@/composables/reorder/reorderHelpers";

const props = defineProps<{
  name: string;
  index: number;
  total: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  (event: "move", target: number): void;
  (event: "close"): void;
}>();

const { t } = useI18n();
const typedPosition = ref("");

const lastIndex = computed(() => props.total - 1);
const quickMoves = computed(() => [
  { label: "reorder.to-start", icon: Unicons.AngleDoubleLeft.name, target: 0 },
  {
    label: "reorder.up-one",
    icon: Unicons.AngleUp.name,
    target: Math.max(0, props.index - 1),
  },
  {
    label: "reorder.down-one",
    icon: Unicons.AngleDown.name,
    target: Math.min(lastIndex.value, props.index + 1),
  },
  {
    label: "reorder.to-end",
    icon: Unicons.AngleDoubleRight.name,
    target: lastIndex.value,
  },
]);

const moveTo = (target: number) => {
  if (!isValidPosition(target + 1, props.total)) return;
  if (target === props.index) return;
  emit("move", target);
};

const moveToTypedPosition = () => moveTo(Number(typedPosition.value) - 1);
</script>
