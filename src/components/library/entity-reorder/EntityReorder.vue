<template>
  <div
    v-if="!state.loaded"
    class="h-40 animate-pulse bg-surface-muted rounded-card"
    aria-busy="true"
  />
  <EntityReorderMobile
    v-else-if="isCompact"
    :state="state"
    :page-size="pageSize"
    @cancel="emit('close', false)"
    @save="save"
  />
  <EntityReorderDesktop
    v-else
    :state="state"
    :page-size="pageSize"
    @cancel="emit('close', false)"
    @save="save"
  />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Entity } from "@/generated-types/queries";
import EntityReorderDesktop from "@/components/library/entity-reorder/EntityReorderDesktop.vue";
import EntityReorderMobile from "@/components/library/entity-reorder/EntityReorderMobile.vue";
import { isCompact } from "@/composables/useNavMenu";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useReorderState } from "@/composables/reorder/useReorderState";

const props = defineProps<{
  parentId: string;
  pageSize: number;
  fetchEntities: (limit: number) => Promise<Entity[]>;
}>();

const emit = defineEmits<{ (event: "close", saved: boolean): void }>();

const { t } = useI18n();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const state = useReorderState(props.parentId, props.fetchEntities);

const showError = (error: unknown) => {
  console.error(error);
  displayErrorNotification(
    t("notifications.errors.generic.title"),
    t("notifications.errors.generic.description"),
  );
};

onMounted(async () => {
  try {
    await state.loadOrder();
  } catch (error) {
    showError(error);
    emit("close", false);
    return;
  }
  await state.loadThumbnails();
});

const save = async () => {
  try {
    const saved = await state.save();
    if (!saved) return;
    displaySuccessNotification(t("reorder.saved"), "");
    emit("close", true);
  } catch (error) {
    showError(error);
  }
};
</script>
