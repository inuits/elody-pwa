<template>
  <div
    data-cy="entity-reorder"
    class="flex flex-col gap-2 p-(--list-band-pad) bg-surface border border-border-panel rounded-card text-ui"
  >
    <div
      class="flex items-center gap-3 py-2 pr-2 pl-3 bg-accent-wash rounded-card"
    >
      <unicon :name="Unicons.Sort.name" height="20" class="text-text-link" />
      <span class="flex flex-col flex-1 min-w-0">
        <span class="font-bold">{{ t("reorder.changing-order") }}</span>
        <span class="text-label text-text-link">{{
          t("reorder.hint", { total: state.order.length })
        }}</span>
      </span>
      <BaseButtonNew
        class="!w-auto"
        button-style="ghost"
        button-size="sm"
        :label="t('reorder.cancel')"
        :force-show-label="true"
        @click="emit('cancel')"
      />
      <BaseButtonNew
        class="!w-auto"
        button-style="commit"
        button-size="sm"
        :icon="DamsIcons.Check"
        :label="t('reorder.save')"
        :force-show-label="true"
        :disabled="!state.dirty"
        :loading="state.saving"
        @click="emit('save')"
      />
    </div>

    <div
      v-if="message"
      role="status"
      class="flex items-center gap-2 min-h-10 pr-1 pl-3 border border-border-panel rounded-card text-label"
    >
      <unicon
        :name="Unicons.CheckCircle.name"
        height="18"
        class="text-text-link"
      />
      <span class="flex-1">{{ message.text }}</span>
      <button
        v-if="message.page !== page"
        type="button"
        class="p-1.5 font-bold text-text-link cursor-pointer"
        @click="showPage(message.page)"
      >
        {{ t("reorder.go-to-page", { page: message.page + 1 }) }}
      </button>
      <button
        type="button"
        class="p-1.5 text-text-muted cursor-pointer"
        :aria-label="t('reorder.dismiss')"
        @click="message = undefined"
      >
        <unicon :name="Unicons.Cross.name" height="18" />
      </button>
    </div>

    <div
      v-if="isDragging && page > 0"
      :class="dropZoneClasses"
      @dragover="allowDrop"
      @drop.prevent="dropAt(pageStart - 1)"
    >
      <unicon :name="Unicons.AngleUp.name" height="18" />
      {{ t("reorder.drop-end-of-page", { page }) }}
    </div>

    <div
      class="flex flex-col border border-border-subtle rounded-card overflow-hidden"
    >
      <div
        class="flex items-center gap-2 h-9 pr-2 pl-1 border-b border-border-subtle font-bold text-text-link"
      >
        <span class="w-30 shrink-0" />
        <span class="flex-1">{{ t("reorder.filename") }}</span>
        <span class="w-20 text-center">{{ t("reorder.move") }}</span>
      </div>
      <EntityReorderDesktopRow
        v-for="row in pageRows"
        :key="row.id"
        draggable="true"
        :class="rowClasses(row.index)"
        :index="row.index"
        :total="state.order.length"
        :page="page"
        :name="state.names[row.id]"
        :thumbnail="state.thumbnails[row.id]"
        :is-first-row-of-page="row.offset === 0"
        :is-last-row-of-page="row.offset === pageSize - 1"
        @dragstart="(event: DragEvent) => startDrag(event, row.index)"
        @dragover="(event: DragEvent) => dragOver(event, row.index)"
        @drop.prevent="dropAt(row.index)"
        @dragend="endDrag"
        @move="(target: number) => moveAndReport(row.index, target)"
      />
    </div>

    <div
      v-if="isDragging && page < pageCount - 1"
      :class="dropZoneClasses"
      @dragover="allowDrop"
      @drop.prevent="dropAt(startOfPage(page + 1))"
    >
      <unicon :name="Unicons.AngleDown.name" height="18" />
      {{ t("reorder.drop-start-of-page", { page: page + 2 }) }}
    </div>

    <EntityReorderPager
      v-if="pageCount > 1"
      :page="page"
      :page-count="pageCount"
      :page-size="pageSize"
      :total="state.order.length"
      :dragging="isDragging"
      @go-to="showPage"
      @drop="(pageIndex: number) => dropAt(startOfPage(pageIndex))"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { DamsIcons } from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityReorderDesktopRow from "@/components/library/entity-reorder/EntityReorderDesktopRow.vue";
import EntityReorderPager from "@/components/library/entity-reorder/EntityReorderPager.vue";
import { dropLineClass } from "@/composables/reorder/reorderHelpers";
import { useReorderPagination } from "@/composables/reorder/useReorderPagination";
import { useRowDragAndDrop } from "@/composables/reorder/useRowDragAndDrop";
import type {
  MoveDescription,
  ReorderState,
} from "@/composables/reorder/useReorderState";

const props = defineProps<{ state: ReorderState; pageSize: number }>();

const emit = defineEmits<{
  (event: "cancel"): void;
  (event: "save"): void;
}>();

const dropZoneClasses =
  "flex items-center justify-center gap-1.5 h-11 border-2 border-dashed border-accent rounded-card bg-accent-wash text-label font-bold text-text-link";

const { t } = useI18n();
const message = ref<MoveDescription>();

const {
  page,
  pageCount,
  pageStart,
  pageRows,
  goToPage,
  startOfPage,
  isOnCurrentPage,
} = useReorderPagination(
  toRef(() => props.state.order),
  toRef(() => props.pageSize),
);

const moveAndReport = (from: number, to: number) => {
  const target = props.state.move(from, to);
  if (target === undefined || isOnCurrentPage(target)) return;
  message.value = props.state.describeMove(target, props.pageSize);
};

const {
  dragIndex,
  overIndex,
  isDragging,
  startDrag,
  allowDrop,
  dragOver,
  dropAt,
  endDrag,
} = useRowDragAndDrop(moveAndReport);

const showPage = (pageIndex: number) => {
  goToPage(pageIndex);
  message.value = undefined;
};

const rowClasses = (index: number) => {
  if (index === dragIndex.value) return "opacity-40";
  return dropLineClass(index, dragIndex.value, overIndex.value);
};
</script>
