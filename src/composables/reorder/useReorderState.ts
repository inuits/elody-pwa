import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { Entity } from "@/generated-types/queries";
import { stringIsUrl } from "@/helpers";
import { useListItemHelper } from "@/composables/useListItemHelper";
import {
  fetchOrderCsv,
  moveItem,
  type OrderCsvRow,
  pageOfIndex,
  parseOrderCsv,
  saveOrderCsv,
  serializeOrderCsv,
} from "@/composables/reorder/reorderHelpers";

export type MoveDescription = { text: string; page: number };

export const useReorderState = (
  parentId: string,
  fetchEntities: (limit: number) => Promise<Entity[]>,
) => {
  const { t } = useI18n();
  const { getMediaFilenameFromEntity } = useListItemHelper();

  const header = ref<string>();
  const rows = ref<OrderCsvRow[]>([]);
  const savedOrder = ref<string[]>([]);
  const order = ref<string[]>([]);
  const thumbnails = ref<Record<string, string | undefined>>({});
  const saving = ref(false);

  const loaded = computed(() => header.value !== undefined);
  const names = computed(() =>
    Object.fromEntries(rows.value.map((row) => [row.id, row.name])),
  );
  const dirty = computed(() => order.value.join() !== savedOrder.value.join());

  const thumbnailUrl = (entity: Entity): string | undefined => {
    const media = getMediaFilenameFromEntity(entity);
    if (!media) return undefined;
    if (stringIsUrl(media)) return media;
    return `/api/iiif/3/${media}/square/^100,/0/default.jpg`;
  };

  const loadOrder = async () => {
    const parsed = parseOrderCsv(await fetchOrderCsv(parentId));
    rows.value = parsed.rows;
    order.value = parsed.rows.map((row) => row.id);
    savedOrder.value = [...order.value];
    header.value = parsed.header;
  };

  const loadThumbnails = async () => {
    const entities = await fetchEntities(order.value.length).catch(
      () => [] as Entity[],
    );
    const thumbnailsById: Record<string, string | undefined> = {};
    for (const entity of entities) {
      const url = thumbnailUrl(entity);
      thumbnailsById[entity.id] = url;
      thumbnailsById[entity.uuid] = url;
    }
    thumbnails.value = thumbnailsById;
  };

  const move = (from: number, to: number): number | undefined => {
    const lastIndex = order.value.length - 1;
    const target = Math.max(0, Math.min(lastIndex, to));
    if (target === from) return undefined;
    order.value = moveItem(order.value, from, target);
    return target;
  };

  const describeMove = (target: number, pageSize: number): MoveDescription => {
    const targetPage = pageOfIndex(target, pageSize);
    return {
      text: t("reorder.moved", {
        name: names.value[order.value[target]],
        position: target + 1,
        page: targetPage + 1,
      }),
      page: targetPage,
    };
  };

  const save = async (): Promise<boolean> => {
    if (!dirty.value || saving.value) return false;
    saving.value = true;
    try {
      const csv = serializeOrderCsv(header.value!, order.value, rows.value);
      await saveOrderCsv(parentId, csv);
      return true;
    } finally {
      saving.value = false;
    }
  };

  return reactive({
    order,
    thumbnails,
    saving,
    loaded,
    names,
    dirty,
    loadOrder,
    loadThumbnails,
    move,
    describeMove,
    save,
  });
};

export type ReorderState = ReturnType<typeof useReorderState>;
