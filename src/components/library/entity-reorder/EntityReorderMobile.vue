<template>
  <Teleport to="body">
    <div
      data-cy="entity-reorder"
      class="fixed inset-0 z-modal flex flex-col bg-surface text-ui"
    >
      <div
        class="flex items-center gap-1.5 h-16 shrink-0 pr-3 pl-1 border-b border-border-subtle"
      >
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center cursor-pointer"
          :aria-label="t('reorder.back')"
          @click="emit('cancel')"
        >
          <unicon :name="Unicons.AngleLeft.name" height="28" />
        </button>
        <span class="flex flex-col flex-1 min-w-0">
          <span class="text-heading font-bold">{{
            t("reorder.change-order")
          }}</span>
          <span class="text-label text-text-muted">{{
            t("reorder.count", { count: state.order.length })
          }}</span>
        </span>
      </div>

      <div ref="scroller" class="relative flex-1 min-h-0 overflow-y-auto">
        <template v-for="(id, index) in state.order" :key="id">
          <div
            v-if="isStartOfPage(index)"
            class="sticky top-0 z-sticky flex items-center gap-2 h-8 px-4 bg-surface-sunken border-b border-border-subtle text-label"
          >
            <span class="font-bold uppercase tracking-wide">{{
              t("reorder.page", { page: pageOfIndex(index, pageSize) + 1 })
            }}</span>
            <span class="text-text-muted">{{
              t("reorder.positions", {
                from: index + 1,
                to: Math.min(index + pageSize, state.order.length),
              })
            }}</span>
          </div>
          <div
            :data-reorder-index="index"
            class="relative flex items-center gap-3 h-15 pl-4 border-b border-border-subtle cursor-pointer"
            :class="rowClasses(index)"
            :style="rowStyle(index)"
            @click="sheetId = id"
          >
            <span
              class="w-6 shrink-0 text-right text-label font-bold text-text-muted"
              >{{ index + 1 }}</span
            >
            <EntityReorderThumbnail :url="state.thumbnails[id]" />
            <span class="flex-1 min-w-0 truncate">{{ state.names[id] }}</span>
            <span
              class="w-13 h-15 shrink-0 flex items-center justify-center text-text-muted touch-none cursor-grab"
              :aria-label="t('reorder.drag')"
              @pointerdown="(event) => startPointerDrag(event, index)"
              @pointermove="movePointerDrag"
              @pointerup="endPointerDrag"
              @pointercancel="endPointerDrag"
              @click.stop
            >
              <unicon :name="Unicons.Draggabledots.name" height="24" />
            </span>
          </div>
        </template>
      </div>

      <div
        v-if="message"
        role="status"
        class="absolute left-3 right-3 bottom-22 z-popover flex items-center gap-2 min-h-11 px-3.5 bg-surface-inverted text-text-on-inverted rounded-overlay font-bold shadow-toast"
      >
        <unicon :name="Unicons.CheckCircle.name" height="18" />
        {{ message.text }}
      </div>

      <div
        class="flex gap-2.5 shrink-0 px-4 pt-3 pb-4 border-t border-border-subtle"
      >
        <BaseButtonNew
          class="flex-1"
          :label="t('reorder.cancel')"
          :force-show-label="true"
          @click="emit('cancel')"
        />
        <BaseButtonNew
          class="flex-1"
          button-style="commit"
          :label="t('reorder.save')"
          :force-show-label="true"
          :disabled="!state.dirty"
          :loading="state.saving"
          @click="emit('save')"
        />
      </div>

      <EntityReorderMoveSheet
        v-if="sheetId !== undefined"
        :name="state.names[sheetId]"
        :index="sheetIndex"
        :total="state.order.length"
        :page-size="pageSize"
        @move="moveFromSheet"
        @close="sheetId = undefined"
      />
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityReorderMoveSheet from "@/components/library/entity-reorder/EntityReorderMoveSheet.vue";
import EntityReorderThumbnail from "@/components/library/entity-reorder/EntityReorderThumbnail.vue";
import {
  dropLineClass,
  pageOfIndex,
} from "@/composables/reorder/reorderHelpers";
import { usePointerDrag } from "@/composables/reorder/usePointerDrag";
import type {
  MoveDescription,
  ReorderState,
} from "@/composables/reorder/useReorderState";

const props = defineProps<{ state: ReorderState; pageSize: number }>();

const emit = defineEmits<{
  (event: "cancel"): void;
  (event: "save"): void;
}>();

const MESSAGE_DURATION = 2600;

const { t } = useI18n();
const scroller = ref<HTMLElement>();
const sheetId = ref<string>();
const flashIndex = ref<number>();
const message = ref<MoveDescription>();
let messageTimeout: ReturnType<typeof setTimeout>;

const sheetIndex = computed(() =>
  props.state.order.indexOf(sheetId.value ?? ""),
);

const isStartOfPage = (index: number) => index % props.pageSize === 0;

const scrollToRow = async (index: number) => {
  await nextTick();
  const row = scroller.value?.querySelector(`[data-reorder-index="${index}"]`);
  row?.scrollIntoView({ block: "center" });
};

const moveAndShow = (from: number, to: number) => {
  const target = props.state.move(from, to);
  if (target === undefined) return;
  flashIndex.value = target;
  message.value = props.state.describeMove(target, props.pageSize);
  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    flashIndex.value = undefined;
    message.value = undefined;
  }, MESSAGE_DURATION);
  scrollToRow(target);
};

const { pointerDrag, startPointerDrag, movePointerDrag, endPointerDrag } =
  usePointerDrag(scroller, moveAndShow);

const moveFromSheet = (target: number) => {
  const from = sheetIndex.value;
  sheetId.value = undefined;
  moveAndShow(from, target);
};

const rowClasses = (index: number) => {
  const styles = {
    lifted: "z-content-raised shadow-overlay bg-surface",
    flashed: "bg-accent-wash",
    idle: "bg-surface",
  };
  if (pointerDrag.value?.index === index) return styles.lifted;
  const background = flashIndex.value === index ? styles.flashed : styles.idle;
  const dropLine = dropLineClass(
    index,
    pointerDrag.value?.index,
    pointerDrag.value?.over,
  );
  return [background, dropLine];
};

const rowStyle = (index: number) => {
  if (pointerDrag.value?.index !== index) return undefined;
  return { transform: `translateY(${pointerDrag.value.offsetY}px)` };
};
</script>
