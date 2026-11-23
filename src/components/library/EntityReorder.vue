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
        :class="dropIndicatorClasses(pageStart + offset)"
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
          @focus="(event) => (event.target as HTMLInputElement).select()"
          @input="
            (event) => (drafts[id] = (event.target as HTMLInputElement).value)
          "
          @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
          @keydown.esc="delete drafts[id]"
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
            v-for="direction in [-1, 1]"
            :key="direction"
            type="button"
            class="w-8.5 h-8.5 flex items-center justify-center rounded-button hover:bg-accent-wash cursor-pointer disabled:text-text-disabled disabled:cursor-not-allowed"
            :disabled="!canMove(pageStart + offset, direction)"
            :title="arrowTitle(offset, direction)"
            :aria-label="arrowTitle(offset, direction)"
            @click="arrowMove(pageStart + offset, direction)"
          >
            <unicon
              :name="
                direction < 0 ? Unicons.AngleUp.name : Unicons.AngleDown.name
              "
              height="22"
            />
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
        :class="
          pageNumber - 1 === page
            ? 'bg-accent text-text-on-accent'
            : dragIndex !== undefined
              ? 'bg-accent-wash'
              : 'bg-surface'
        "
        :aria-current="pageNumber - 1 === page ? 'page' : undefined"
        @click="goToPage(pageNumber - 1)"
        @dragover="
          (event) =>
            dragIndex !== undefined &&
            pageNumber - 1 !== page &&
            event.preventDefault()
        "
        @drop.prevent="dropAt((pageNumber - 1) * pageSize)"
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
            :class="[
              flashIndex === index ? 'bg-accent-wash' : 'bg-surface',
              pointerDrag?.index === index
                ? 'z-content-raised shadow-overlay'
                : '',
              dropIndicatorClasses(index),
            ]"
            :style="
              pointerDrag?.index === index
                ? { transform: `translateY(${pointerDrag.offsetY}px)` }
                : undefined
            "
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

const props = defineProps<{
  parentId: string;
  pageSize: number;
  fetchEntities: (limit: number) => Promise<Entity[]>;
}>();

const emit = defineEmits<{ (event: "close", saved: boolean): void }>();

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
    target: Math.min(order.value.length - 1, sheetIndex.value + 1),
  },
  {
    label: "reorder.to-end",
    icon: Unicons.AngleDoubleRight.name,
    target: order.value.length - 1,
  },
]);

const dropZoneClasses =
  "flex items-center justify-center gap-1.5 h-11 border-2 border-dashed border-accent rounded-card bg-accent-wash text-label font-bold text-text-link";

const isValidPosition = (position: number) =>
  Number.isInteger(position) && position >= 1 && position <= order.value.length;

const thumbnailUrl = (entity: Entity): string | undefined => {
  const media = getMediaFilenameFromEntity(entity);
  if (!media) return undefined;
  return stringIsUrl(media)
    ? media
    : `/api/iiif/3/${media}/square/^100,/0/default.jpg`;
};

onMounted(async () => {
  try {
    const parsed = parseOrderCsv(await fetchOrderCsv(props.parentId));
    rows.value = parsed.rows;
    order.value = parsed.rows.map((row) => row.id);
    savedOrder.value = [...order.value];
    header.value = parsed.header;
  } catch (error) {
    console.error(error);
    displayErrorNotification(
      t("notifications.errors.generic.title"),
      t("notifications.errors.generic.description"),
    );
    emit("close", false);
    return;
  }
  // thumbnails only; the rows already show their filenames
  const entities = await props
    .fetchEntities(order.value.length)
    .catch(() => [] as Entity[]);
  thumbnails.value = Object.fromEntries(
    entities.flatMap((entity) =>
      [entity.id, entity.uuid].map((id) => [id, thumbnailUrl(entity)]),
    ),
  );
});

const move = (from: number, to: number) => {
  const target = Math.max(0, Math.min(order.value.length - 1, to));
  if (target === from) return;
  const id = order.value[from];
  order.value = moveItem(order.value, from, target);
  const targetPage = pageOfIndex(target, props.pageSize);
  if (isCompact.value) return landOnMobile(target, id);
  if (targetPage !== page.value)
    message.value = {
      text: t("reorder.moved", {
        name: names.value[id],
        position: target + 1,
        page: targetPage + 1,
      }),
      page: targetPage,
    };
};

const goToPage = (target: number) => {
  page.value = target;
  message.value = undefined;
};

const canMove = (index: number, direction: number) =>
  index + direction >= 0 && index + direction < order.value.length;

const arrowTitle = (offset: number, direction: number) => {
  const index = pageStart.value + offset;
  if (direction < 0 && offset === 0 && index > 0)
    return t("reorder.to-end-of-page", { page: page.value });
  if (direction > 0 && offset === props.pageSize - 1 && canMove(index, 1))
    return t("reorder.to-start-of-page", { page: page.value + 2 });
  return t(direction < 0 ? "reorder.move-up" : "reorder.move-down");
};

const arrowMove = (index: number, direction: number) => {
  if (canMove(index, direction)) move(index, index + direction);
};

const commitDraft = (id: string) => {
  const position = Number(drafts.value[id]);
  delete drafts.value[id];
  if (isValidPosition(position)) move(order.value.indexOf(id), position - 1);
};

const startDrag = (event: DragEvent, index: number) => {
  event.dataTransfer!.effectAllowed = "move";
  // Firefox only starts a drag with data set
  event.dataTransfer!.setData("text/plain", String(index));
  // a tick later, so the drag image is taken before the row dims
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

const dropIndicatorClasses = (index: number) => {
  const from = pointerDrag.value?.index ?? dragIndex.value;
  const over = pointerDrag.value?.over ?? overIndex.value;
  if (from === undefined) return "";
  if (from === index && !pointerDrag.value) return "opacity-40";
  if (over !== index || from === index) return "";
  return from > index
    ? "shadow-reorder-drop-before"
    : "shadow-reorder-drop-after";
};

let pointerStart = { y: 0, scrollTop: 0 };

const startPointerDrag = (event: PointerEvent, index: number) => {
  event.preventDefault();
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  pointerStart = { y: event.clientY, scrollTop: scroller.value!.scrollTop };
  pointerDrag.value = { index, over: index, offsetY: 0 };
};

const movePointerDrag = (event: PointerEvent) => {
  if (!pointerDrag.value || !scroller.value) return;
  const bounds = scroller.value.getBoundingClientRect();
  if (event.clientY < bounds.top + 50) scroller.value.scrollTop -= 14;
  else if (event.clientY > bounds.bottom - 50) scroller.value.scrollTop += 14;
  const draggedIndex = String(pointerDrag.value.index);
  const hit = document
    .elementsFromPoint(event.clientX, event.clientY)
    .map((element) => element.closest<HTMLElement>("[data-reorder-index]"))
    .find((row) => row && row.dataset.reorderIndex !== draggedIndex);
  pointerDrag.value = {
    index: pointerDrag.value.index,
    over: hit ? Number(hit.dataset.reorderIndex) : pointerDrag.value.over,
    offsetY:
      event.clientY -
      pointerStart.y +
      scroller.value.scrollTop -
      pointerStart.scrollTop,
  };
};

const endPointerDrag = () => {
  const drag = pointerDrag.value;
  pointerDrag.value = undefined;
  if (drag) move(drag.index, drag.over);
};

let flashTimeout: ReturnType<typeof setTimeout>;

const landOnMobile = async (target: number, id: string) => {
  flashIndex.value = target;
  message.value = {
    text: t("reorder.moved", {
      name: names.value[id],
      position: target + 1,
      page: pageOfIndex(target, props.pageSize) + 1,
    }),
    page: pageOfIndex(target, props.pageSize),
  };
  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => {
    flashIndex.value = undefined;
    message.value = undefined;
  }, 2600);
  await nextTick();
  scroller.value
    ?.querySelector(`[data-reorder-index="${target}"]`)
    ?.scrollIntoView({ block: "center" });
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
    await saveOrderCsv(
      props.parentId,
      serializeOrderCsv(header.value!, order.value, rows.value),
    );
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
