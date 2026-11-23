<template>
  <div
    v-if="!header"
    class="h-40 animate-pulse bg-surface-muted rounded-card"
    aria-busy="true"
  />
  <div
    v-else-if="!isCompact"
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
          t("reorder.hint", { total: order.length })
        }}</span>
      </span>
      <BaseButtonNew
        class="!w-auto"
        button-style="ghost"
        button-size="sm"
        :label="t('reorder.cancel')"
        :force-show-label="true"
        @click="emit('close', false)"
      />
      <BaseButtonNew
        class="!w-auto"
        button-style="commit"
        button-size="sm"
        :icon="DamsIcons.Check"
        :label="t('reorder.save')"
        :force-show-label="true"
        :disabled="!dirty"
        :loading="saving"
        @click="save"
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
        @click="goToPage(message.page)"
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
      v-if="dragIndex !== undefined && page > 0"
      :class="dropZoneClasses"
      @dragover.prevent
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
      <div
        v-for="(id, offset) in pageIds"
        :key="id"
        draggable="true"
        data-cy="entity-reorder-row"
        class="flex items-center gap-2 min-h-12 py-0.5 pr-2 pl-1 border-b border-border-subtle last:border-b-0 cursor-grab"
        :class="desktopRowClasses(pageStart + offset)"
        @dragstart="(event) => startDrag(event, pageStart + offset)"
        @dragover="(event) => dragOver(event, pageStart + offset)"
        @drop.prevent="dropAt(pageStart + offset)"
        @dragend="endDrag"
      >
        <unicon
          :name="Unicons.Draggabledots.name"
          height="20"
          class="w-6 shrink-0 text-text-muted"
        />
        <input
          type="number"
          min="1"
          :max="order.length"
          :aria-label="t('reorder.position')"
          :value="drafts[id] ?? pageStart + offset + 1"
          class="w-12 h-8.5 shrink-0 border border-border-default rounded-input text-center font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          @focus="selectInputText"
          @input="(event) => updateDraft(id, event)"
          @keydown.enter="blurInput"
          @keydown.esc="discardDraft(id)"
          @blur="commitDraft(id)"
        />
        <img
          v-if="thumbnails[id]"
          :src="thumbnails[id]"
          alt=""
          class="w-10 h-10 shrink-0 object-cover border border-border-subtle rounded-chip"
        />
        <span
          v-else
          class="w-10 h-10 shrink-0 bg-surface-muted border border-border-subtle rounded-chip"
        />
        <span class="flex-1 min-w-0 truncate text-text-link">{{
          names[id]
        }}</span>
        <span class="flex justify-center gap-0.5 w-20">
          <button
            v-for="arrow in arrows"
            :key="arrow.direction"
            type="button"
            class="w-8.5 h-8.5 flex items-center justify-center rounded-button hover:bg-accent-wash cursor-pointer disabled:text-text-disabled disabled:cursor-not-allowed"
            :disabled="!canMove(pageStart + offset, arrow.direction)"
            :title="arrowTitle(offset, arrow)"
            :aria-label="arrowTitle(offset, arrow)"
            @click="arrowMove(pageStart + offset, arrow.direction)"
          >
            <unicon :name="arrow.icon" height="22" />
          </button>
        </span>
      </div>
    </div>

    <div
      v-if="dragIndex !== undefined && page < pageCount - 1"
      :class="dropZoneClasses"
      @dragover.prevent
      @drop.prevent="dropAt(pageStart + pageSize)"
    >
      <unicon :name="Unicons.AngleDown.name" height="18" />
      {{ t("reorder.drop-start-of-page", { page: page + 2 }) }}
    </div>

    <div v-if="pageCount > 1" class="flex items-center gap-1 min-h-11">
      <span class="flex-1 text-label text-text-muted">
        {{ pageStart + 1 }}–{{ pageStart + pageIds.length }} /
        {{ order.length }}
      </span>
      <button
        v-for="pageNumber in pageCount"
        :key="pageNumber"
        type="button"
        class="min-w-9 h-9 px-2 border border-border-default rounded-button font-bold cursor-pointer"
        :class="pagerButtonClasses(pageNumber)"
        :aria-current="isCurrentPage(pageNumber) ? 'page' : undefined"
        @click="goToPage(pageNumber - 1)"
        @dragover="(event) => allowDropOnPage(event, pageNumber)"
        @drop.prevent="dropAt(startOfPage(pageNumber))"
      >
        {{ pageNumber }}
      </button>
    </div>
  </div>

  <Teleport v-else to="body">
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
          @click="emit('close', false)"
        >
          <unicon :name="Unicons.AngleLeft.name" height="28" />
        </button>
        <span class="flex flex-col flex-1 min-w-0">
          <span class="text-heading font-bold">{{
            t("reorder.change-order")
          }}</span>
          <span class="text-label text-text-muted">{{
            t("reorder.count", { count: order.length })
          }}</span>
        </span>
      </div>

      <div ref="scroller" class="relative flex-1 min-h-0 overflow-y-auto">
        <template v-for="(id, index) in order" :key="id">
          <div
            v-if="index % pageSize === 0"
            class="sticky top-0 z-sticky flex items-center gap-2 h-8 px-4 bg-surface-sunken border-b border-border-subtle text-label"
          >
            <span class="font-bold uppercase tracking-wide">{{
              t("reorder.page", { page: index / pageSize + 1 })
            }}</span>
            <span class="text-text-muted">{{
              t("reorder.positions", {
                from: index + 1,
                to: Math.min(index + pageSize, order.length),
              })
            }}</span>
          </div>
          <div
            :data-reorder-index="index"
            class="relative flex items-center gap-3 h-15 pl-4 border-b border-border-subtle cursor-pointer"
            :class="mobileRowClasses(index)"
            :style="mobileRowStyle(index)"
            @click="openSheet(id)"
          >
            <span
              class="w-6 shrink-0 text-right text-label font-bold text-text-muted"
              >{{ index + 1 }}</span
            >
            <img
              v-if="thumbnails[id]"
              :src="thumbnails[id]"
              alt=""
              class="w-10 h-10 shrink-0 object-cover border border-border-subtle rounded-chip"
            />
            <span
              v-else
              class="w-10 h-10 shrink-0 bg-surface-muted border border-border-subtle rounded-chip"
            />
            <span class="flex-1 min-w-0 truncate">{{ names[id] }}</span>
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
          @click="emit('close', false)"
        />
        <BaseButtonNew
          class="flex-1"
          button-style="commit"
          :label="t('reorder.save')"
          :force-show-label="true"
          :disabled="!dirty"
          :loading="saving"
          @click="save"
        />
      </div>

      <div
        v-if="sheetId !== undefined"
        class="absolute inset-0 z-overlay flex flex-col justify-end bg-scrim"
        @click="sheetId = undefined"
      >
        <div
          role="dialog"
          :aria-label="t('reorder.sheet-title', { name: names[sheetId] })"
          class="flex flex-col gap-3.5 p-(--sheet-padding) bg-surface rounded-t-(--sheet-radius) shadow-modal"
          @click.stop
        >
          <div class="w-10 h-1 self-center rounded-pill bg-border-default" />
          <div class="flex items-start gap-2">
            <span class="flex flex-col gap-0.5 flex-1 min-w-0">
              <span class="text-heading font-bold truncate">{{
                t("reorder.sheet-title", { name: names[sheetId] })
              }}</span>
              <span class="text-label text-text-muted">{{
                t("reorder.sheet-where", {
                  position: sheetIndex + 1,
                  total: order.length,
                  page: pageOfIndex(sheetIndex, pageSize) + 1,
                })
              }}</span>
            </span>
            <button
              type="button"
              class="w-11 h-11 -mt-1.5 -mr-2 flex items-center justify-center cursor-pointer"
              :aria-label="t('reorder.dismiss')"
              @click="sheetId = undefined"
            >
              <unicon :name="Unicons.Cross.name" height="24" />
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="action in sheetActions"
              :key="action.label"
              type="button"
              class="h-13 flex items-center justify-center gap-2 border border-border-default rounded-card font-bold cursor-pointer disabled:text-text-disabled disabled:cursor-not-allowed"
              :disabled="action.target === sheetIndex"
              @click="sheetMove(action.target)"
            >
              <unicon :name="action.icon" height="20" />
              {{ t(action.label) }}
            </button>
          </div>
          <form
            class="flex flex-col gap-1.5 pt-2.5 border-t border-border-subtle"
            @submit.prevent="sheetMove(Number(sheetPosition) - 1)"
          >
            <label
              for="reorder-sheet-position"
              class="font-bold text-text-link"
              >{{ t("reorder.move-to-position") }}</label
            >
            <div class="flex gap-2">
              <input
                id="reorder-sheet-position"
                v-model="sheetPosition"
                type="number"
                inputmode="numeric"
                min="1"
                :max="order.length"
                :placeholder="`1–${order.length}`"
                class="flex-1 min-w-0 h-12 px-3.5 border border-border-default rounded-input font-bold"
              />
              <BaseButtonNew
                class="!w-auto"
                button-style="primary"
                :label="t('reorder.move')"
                :force-show-label="true"
                :disabled="!isValidPosition(Number(sheetPosition))"
                @click="sheetMove(Number(sheetPosition) - 1)"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { DamsIcons, type Entity } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { stringIsUrl } from "@/helpers";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { isCompact } from "@/composables/useNavMenu";
import { useListItemHelper } from "@/composables/useListItemHelper";
import { useBaseNotification } from "@/composables/useBaseNotification";
import {
  fetchOrderCsv,
  moveItem,
  type OrderCsvRow,
  pageOfIndex,
  parseOrderCsv,
  saveOrderCsv,
  serializeOrderCsv,
} from "@/composables/useEntityReorder";

type Arrow = { direction: number; icon: string; label: string };

const props = defineProps<{
  parentId: string;
  pageSize: number;
  fetchEntities: (limit: number) => Promise<Entity[]>;
}>();

const emit = defineEmits<{ (event: "close", saved: boolean): void }>();

const AUTOSCROLL_EDGE_SIZE = 50;
const AUTOSCROLL_STEP = 14;
const MOBILE_MESSAGE_DURATION = 2600;

const arrows: Arrow[] = [
  { direction: -1, icon: Unicons.AngleUp.name, label: "reorder.move-up" },
  { direction: 1, icon: Unicons.AngleDown.name, label: "reorder.move-down" },
];

const dropZoneClasses =
  "flex items-center justify-center gap-1.5 h-11 border-2 border-dashed border-accent rounded-card bg-accent-wash text-label font-bold text-text-link";

const { t } = useI18n();
const { getMediaFilenameFromEntity } = useListItemHelper();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();

const header = ref<string>();
const rows = ref<OrderCsvRow[]>([]);
const savedOrder = ref<string[]>([]);
const order = ref<string[]>([]);
const thumbnails = ref<Record<string, string | undefined>>({});
const page = ref(0);
const saving = ref(false);
const message = ref<{ text: string; page: number }>();
const drafts = ref<Record<string, string>>({});
const dragIndex = ref<number>();
const overIndex = ref<number>();
const flashIndex = ref<number>();
const pointerDrag = ref<{ index: number; over: number; offsetY: number }>();
const sheetId = ref<string>();
const sheetPosition = ref("");
const scroller = ref<HTMLElement>();

const names = computed(() =>
  Object.fromEntries(rows.value.map((row) => [row.id, row.name])),
);
const dirty = computed(() => order.value.join() !== savedOrder.value.join());
const pageCount = computed(() =>
  Math.max(1, Math.ceil(order.value.length / props.pageSize)),
);
const pageStart = computed(() => page.value * props.pageSize);
const pageIds = computed(() =>
  order.value.slice(pageStart.value, pageStart.value + props.pageSize),
);
const sheetIndex = computed(() =>
  sheetId.value === undefined ? -1 : order.value.indexOf(sheetId.value),
);
const lastIndex = computed(() => order.value.length - 1);
const sheetActions = computed(() => [
  { label: "reorder.to-start", icon: Unicons.AngleDoubleLeft.name, target: 0 },
  {
    label: "reorder.up-one",
    icon: Unicons.AngleUp.name,
    target: Math.max(0, sheetIndex.value - 1),
  },
  {
    label: "reorder.down-one",
    icon: Unicons.AngleDown.name,
    target: Math.min(lastIndex.value, sheetIndex.value + 1),
  },
  {
    label: "reorder.to-end",
    icon: Unicons.AngleDoubleRight.name,
    target: lastIndex.value,
  },
]);

const isValidPosition = (position: number) =>
  Number.isInteger(position) && position >= 1 && position <= order.value.length;

const thumbnailUrl = (entity: Entity): string | undefined => {
  const media = getMediaFilenameFromEntity(entity);
  if (!media) return undefined;
  if (stringIsUrl(media)) return media;
  return `/api/iiif/3/${media}/square/^100,/0/default.jpg`;
};

const loadOrder = async (): Promise<boolean> => {
  try {
    const parsed = parseOrderCsv(await fetchOrderCsv(props.parentId));
    rows.value = parsed.rows;
    order.value = parsed.rows.map((row) => row.id);
    savedOrder.value = [...order.value];
    header.value = parsed.header;
    return true;
  } catch (error) {
    console.error(error);
    displayErrorNotification(
      t("notifications.errors.generic.title"),
      t("notifications.errors.generic.description"),
    );
    return false;
  }
};

const loadThumbnails = async () => {
  const entities = await props
    .fetchEntities(order.value.length)
    .catch(() => [] as Entity[]);
  const thumbnailsById: Record<string, string | undefined> = {};
  for (const entity of entities) {
    const url = thumbnailUrl(entity);
    thumbnailsById[entity.id] = url;
    thumbnailsById[entity.uuid] = url;
  }
  thumbnails.value = thumbnailsById;
};

onMounted(async () => {
  const loaded = await loadOrder();
  if (!loaded) {
    emit("close", false);
    return;
  }
  await loadThumbnails();
});

const movedMessage = (movedId: string, target: number) => {
  const targetPage = pageOfIndex(target, props.pageSize);
  return {
    text: t("reorder.moved", {
      name: names.value[movedId],
      position: target + 1,
      page: targetPage + 1,
    }),
    page: targetPage,
  };
};

const move = (from: number, to: number) => {
  const target = Math.max(0, Math.min(lastIndex.value, to));
  if (target === from) return;
  const movedId = order.value[from];
  order.value = moveItem(order.value, from, target);

  if (isCompact.value) {
    showMoveOnMobile(movedId, target);
    return;
  }
  const landsOnOtherPage = pageOfIndex(target, props.pageSize) !== page.value;
  if (landsOnOtherPage) message.value = movedMessage(movedId, target);
};

const goToPage = (pageIndex: number) => {
  page.value = pageIndex;
  message.value = undefined;
};

const isCurrentPage = (pageNumber: number) => pageNumber - 1 === page.value;

const startOfPage = (pageNumber: number) => (pageNumber - 1) * props.pageSize;

const pagerButtonClasses = (pageNumber: number) => {
  const styles = {
    current: "bg-accent text-text-on-accent",
    dropTarget: "bg-accent-wash",
    idle: "bg-surface",
  };
  if (isCurrentPage(pageNumber)) return styles.current;
  if (dragIndex.value !== undefined) return styles.dropTarget;
  return styles.idle;
};

const allowDropOnPage = (event: DragEvent, pageNumber: number) => {
  if (dragIndex.value === undefined || isCurrentPage(pageNumber)) return;
  event.preventDefault();
};

const canMove = (index: number, direction: number) =>
  index + direction >= 0 && index + direction <= lastIndex.value;

const arrowTitle = (offset: number, arrow: Arrow) => {
  const index = pageStart.value + offset;
  const isFirstRowOfPage = offset === 0;
  const isLastRowOfPage = offset === props.pageSize - 1;
  const movesToPreviousPage =
    arrow.direction < 0 && isFirstRowOfPage && canMove(index, -1);
  const movesToNextPage =
    arrow.direction > 0 && isLastRowOfPage && canMove(index, 1);

  if (movesToPreviousPage)
    return t("reorder.to-end-of-page", { page: page.value });
  if (movesToNextPage)
    return t("reorder.to-start-of-page", { page: page.value + 2 });
  return t(arrow.label);
};

const arrowMove = (index: number, direction: number) => {
  if (canMove(index, direction)) move(index, index + direction);
};

const selectInputText = (event: FocusEvent) =>
  (event.target as HTMLInputElement).select();

const blurInput = (event: KeyboardEvent) =>
  (event.target as HTMLInputElement).blur();

const updateDraft = (id: string, event: Event) => {
  drafts.value[id] = (event.target as HTMLInputElement).value;
};

const discardDraft = (id: string) => {
  delete drafts.value[id];
};

const commitDraft = (id: string) => {
  const position = Number(drafts.value[id]);
  discardDraft(id);
  if (isValidPosition(position)) move(order.value.indexOf(id), position - 1);
};

const startDrag = (event: DragEvent, index: number) => {
  event.dataTransfer!.effectAllowed = "move";
  // Firefox only starts a drag when data is set
  event.dataTransfer!.setData("text/plain", String(index));
  // Dim the row a tick later, after the browser took the drag image
  setTimeout(() => (dragIndex.value = index));
};

const dragOver = (event: DragEvent, index: number) => {
  if (dragIndex.value === undefined) return;
  event.preventDefault();
  overIndex.value = index;
};

const dropAt = (target: number) => {
  if (dragIndex.value !== undefined) move(dragIndex.value, target);
  endDrag();
};

const endDrag = () => {
  dragIndex.value = undefined;
  overIndex.value = undefined;
};

const dropLineClass = (
  index: number,
  draggedIndex: number | undefined,
  hoveredIndex: number | undefined,
) => {
  const isDropTarget =
    draggedIndex !== undefined &&
    index === hoveredIndex &&
    index !== draggedIndex;
  if (!isDropTarget) return "";
  const styles = {
    before: "shadow-reorder-drop-before",
    after: "shadow-reorder-drop-after",
  };
  if (draggedIndex > index) return styles.before;
  return styles.after;
};

const desktopRowClasses = (index: number) => {
  if (index === dragIndex.value) return "opacity-40";
  return dropLineClass(index, dragIndex.value, overIndex.value);
};

const mobileRowClasses = (index: number) => {
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

const mobileRowStyle = (index: number) => {
  if (pointerDrag.value?.index !== index) return undefined;
  return { transform: `translateY(${pointerDrag.value.offsetY}px)` };
};

let pointerStart = { y: 0, scrollTop: 0 };

const startPointerDrag = (event: PointerEvent, index: number) => {
  event.preventDefault();
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  pointerStart = { y: event.clientY, scrollTop: scroller.value!.scrollTop };
  pointerDrag.value = { index, over: index, offsetY: 0 };
};

const autoScrollNearEdges = (
  scrollContainer: HTMLElement,
  pointerY: number,
) => {
  const bounds = scrollContainer.getBoundingClientRect();
  if (pointerY < bounds.top + AUTOSCROLL_EDGE_SIZE)
    scrollContainer.scrollTop -= AUTOSCROLL_STEP;
  else if (pointerY > bounds.bottom - AUTOSCROLL_EDGE_SIZE)
    scrollContainer.scrollTop += AUTOSCROLL_STEP;
};

const rowIndexUnderPointer = (
  event: PointerEvent,
  draggedIndex: number,
): number | undefined => {
  const elements = document.elementsFromPoint(event.clientX, event.clientY);
  for (const element of elements) {
    const row = element.closest<HTMLElement>("[data-reorder-index]");
    if (!row) continue;
    const rowIndex = Number(row.dataset.reorderIndex);
    if (rowIndex !== draggedIndex) return rowIndex;
  }
  return undefined;
};

const movePointerDrag = (event: PointerEvent) => {
  const drag = pointerDrag.value;
  const scrollContainer = scroller.value;
  if (!drag || !scrollContainer) return;

  autoScrollNearEdges(scrollContainer, event.clientY);
  const scrolledDistance = scrollContainer.scrollTop - pointerStart.scrollTop;
  const movedDistance = event.clientY - pointerStart.y;
  pointerDrag.value = {
    index: drag.index,
    over: rowIndexUnderPointer(event, drag.index) ?? drag.over,
    offsetY: movedDistance + scrolledDistance,
  };
};

const endPointerDrag = () => {
  const drag = pointerDrag.value;
  pointerDrag.value = undefined;
  if (drag) move(drag.index, drag.over);
};

let mobileMessageTimeout: ReturnType<typeof setTimeout>;

const showMoveOnMobile = async (movedId: string, target: number) => {
  flashIndex.value = target;
  message.value = movedMessage(movedId, target);
  clearTimeout(mobileMessageTimeout);
  mobileMessageTimeout = setTimeout(() => {
    flashIndex.value = undefined;
    message.value = undefined;
  }, MOBILE_MESSAGE_DURATION);

  await nextTick();
  const movedRow = scroller.value?.querySelector(
    `[data-reorder-index="${target}"]`,
  );
  movedRow?.scrollIntoView({ block: "center" });
};

const openSheet = (id: string) => {
  sheetId.value = id;
  sheetPosition.value = "";
};

const sheetMove = (target: number) => {
  if (!isValidPosition(target + 1) || target === sheetIndex.value) return;
  const from = sheetIndex.value;
  sheetId.value = undefined;
  move(from, target);
};

const save = async () => {
  if (!dirty.value || saving.value) return;
  saving.value = true;
  try {
    const csv = serializeOrderCsv(header.value!, order.value, rows.value);
    await saveOrderCsv(props.parentId, csv);
    displaySuccessNotification(t("reorder.saved"), "");
    emit("close", true);
  } catch (error) {
    console.error(error);
    displayErrorNotification(
      t("notifications.errors.generic.title"),
      t("notifications.errors.generic.description"),
    );
  } finally {
    saving.value = false;
  }
};
</script>
