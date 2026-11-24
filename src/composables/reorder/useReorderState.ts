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

const NAME_KEYS = ["title", "name", "original_filename", "filename"];

export type MoveDescription = { text: string; page: number };

export const useReorderState = (
  parentId: string,
  returnType: string,
  relationType: string,
  fetchEntities: (limit: number) => Promise<Entity[]>,
) => {
  const { t } = useI18n();
  const { getMediaFilenameFromEntity } = useListItemHelper();

  const header = ref<string>();
  const rows = ref<OrderCsvRow[]>([]);
  const savedOrder = ref<string[]>([]);
  const order = ref<string[]>([]);
  const thumbnails = ref<Record<string, string | undefined>>({});
  const entityNames = ref<Record<string, string | undefined>>({});
  const saving = ref(false);
  const loaded = ref(false);

  const names = computed(() =>
    Object.fromEntries(
      rows.value.map((row) => [
        row.id,
        row.name ?? entityNames.value[row.id] ?? row.id,
      ]),
    ),
  );
  const dirty = computed(() => order.value.join() !== savedOrder.value.join());

  const thumbnailUrl = (entity: Entity): string | undefined => {
    const media = getMediaFilenameFromEntity(entity);
    if (!media) return undefined;
    if (stringIsUrl(media)) return media;
    return `/api/iiif/3/${media}/square/^100,/0/default.jpg`;
  };

  const loadOrder = async () => {
    const parsed = parseOrderCsv(
      await fetchOrderCsv(parentId, returnType, relationType),
    );
    rows.value = parsed.rows;
    order.value = parsed.rows.map((row) => row.id);
    savedOrder.value = [...order.value];
    header.value = parsed.header;
  };

  const nameOf = (entity: Entity): string | undefined => {
    const values = (entity.intialValues ?? {}) as Record<string, unknown>;
    const name = NAME_KEYS.map((key) => values[key]).find(
      (value) => typeof value === "string" && value !== "",
    );
    return name as string | undefined;
  };

  // The list's own query only returns what the user may read, so names and
  // thumbnails come from there rather than from the order endpoint.
  const loadEntityDetails = async () => {
    const entities = await fetchEntities(order.value.length).catch(
      () => [] as Entity[],
    );
    const thumbnailsById: Record<string, string | undefined> = {};
    const namesById: Record<string, string | undefined> = {};
    for (const entity of entities) {
      for (const id of [entity.id, entity.uuid]) {
        thumbnailsById[id] = thumbnailUrl(entity);
        namesById[id] = nameOf(entity);
      }
    }
    thumbnails.value = thumbnailsById;
    entityNames.value = namesById;
    loaded.value = true;
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
      await saveOrderCsv(parentId, relationType, csv);
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
    loadEntityDetails,
    move,
    describeMove,
    save,
  });
};

export type ReorderState = ReturnType<typeof useReorderState>;
