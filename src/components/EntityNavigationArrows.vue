<template>
  <!-- Catalogue RecordStepper: "‹ 2 of 5 ›", the record's place in the list it was opened from. -->
  <span
    v-if="visible"
    role="group"
    :aria-label="t('entity-navigation.position-label')"
    class="inline-flex items-center gap-0.5 rounded-pill bg-surface-muted p-(--stepper-pad)"
  >
    <BaseTooltip position="bottom-start" :tooltip-offset="4">
      <template #activator="{ on, describedBy }">
        <BaseButtonNew
          v-on="on"
          :aria-describedby="describedBy"
          data-cy="entity-navigation-previous"
          class="!size-(--stepper-button-size) !p-0 !rounded-pill"
          button-style="ghost"
          :icon="DamsIcons.AngleLeft"
          :aria-label="t('entity-navigation.open-previous')"
          :disabled="!previousEntity"
          @click="navigateTo(previousEntity)"
        />
      </template>
      <span>{{ t("entity-navigation.open-previous") }}</span>
    </BaseTooltip>
    <span
      data-cy="entity-navigation-position"
      class="px-1.5 text-label font-bold text-text-muted whitespace-nowrap"
    >
      {{ position ? t("entity-navigation.position", position) : "" }}
    </span>
    <BaseTooltip position="bottom-end" :tooltip-offset="4">
      <template #activator="{ on, describedBy }">
        <BaseButtonNew
          v-on="on"
          :aria-describedby="describedBy"
          data-cy="entity-navigation-next"
          class="!size-(--stepper-button-size) !p-0 !rounded-pill"
          button-style="ghost"
          :icon="DamsIcons.AngleRight"
          :aria-label="t('entity-navigation.open-next')"
          :disabled="!nextEntity"
          @click="navigateTo(nextEntity)"
        />
      </template>
      <span>{{ t("entity-navigation.open-next") }}</span>
    </BaseTooltip>
  </span>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { DamsIcons, type Entity } from "@/generated-types/queries";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useEntityNavigation } from "@/composables/useEntityNavigation";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { showNavigationArrows } = useEntityPageConfig();
const {
  getPreviousEntity,
  getNextEntity,
  getPosition,
  getNavigationRoute,
  hasNavigationEntities,
} = useEntityNavigation();

const entityId = computed(() => String(route.params["id"] ?? ""));

const isSingleEntityPage = computed(
  () => route.name === "SingleEntity" || route.name === "SingleMediafile",
);

const previousEntity = computed<Entity | undefined>(() =>
  isSingleEntityPage.value ? getPreviousEntity(entityId.value) : undefined,
);

const nextEntity = computed<Entity | undefined>(() =>
  isSingleEntityPage.value ? getNextEntity(entityId.value) : undefined,
);

const position = computed(() =>
  isSingleEntityPage.value ? getPosition(entityId.value) : undefined,
);

const ownsRouteState: boolean = inject("OwnsRouteState", true);

const visible = computed(
  () =>
    ownsRouteState &&
    isSingleEntityPage.value &&
    showNavigationArrows.value &&
    hasNavigationEntities(),
);

const navigateTo = (entity: Entity | undefined) => {
  if (!entity) return;
  router.push(getNavigationRoute(entity));
};

// Alt + ← / → steps, except where the keys move the caret in a field.
const onKeydown = (event: KeyboardEvent) => {
  if (!visible.value || !event.altKey) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest?.("input, textarea, select, [contenteditable]")) return;
  if (event.key === "ArrowLeft") navigateTo(previousEntity.value);
  else if (event.key === "ArrowRight") navigateTo(nextEntity.value);
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped></style>
